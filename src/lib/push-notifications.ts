/**
 * Push Notification Sending Utility
 *
 * Lightweight FCM implementation using the HTTP v1 API with Google OAuth2.
 * Does NOT require firebase-admin or firebase packages.
 * Falls back gracefully to console logging when Firebase env vars are missing.
 */

import { db } from '@/lib/db'
import { JWT } from 'google-auth-library'

// ─── Types ──────────────────────────────────────────────────
export interface PushNotificationPayload {
  titleAr: string
  titleEn: string
  bodyAr: string
  bodyEn: string
  data?: Record<string, string>
}

interface FCMMessage {
  token?: string
  notification?: {
    title: string
    body: string
  }
  data?: Record<string, string>
  android?: {
    notification?: {
      title_loc_key?: string
      title_loc_args?: string[]
      body_loc_key?: string
      body_loc_args?: string[]
    }
  }
  apns?: {
    payload?: {
      aps?: {
        alert?: {
          title?: string
          body?: string
        }
      }
    }
  }
  webpush?: {
    notification?: {
      title: string
      body: string
      icon?: string
      badge?: string
      data?: Record<string, string>
    }
  }
}

// ─── Firebase Config Check ──────────────────────────────────
function getFirebaseConfig(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    return null
  }

  return { projectId, clientEmail, privateKey }
}

// ─── Access Token via Google OAuth2 ────────────────────────
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const config = getFirebaseConfig()
  if (!config) {
    throw new Error('Firebase configuration is missing')
  }

  const jwtClient = new JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  const credentials = await jwtClient.authorize()
  if (!credentials.access_token) {
    throw new Error('Failed to obtain Google OAuth2 access token')
  }

  cachedToken = {
    token: credentials.access_token,
    expiresAt: Date.now() + (credentials.expiry_date || 3600_000),
  }

  return cachedToken.token
}

// ─── Send Single FCM Message ───────────────────────────────
async function sendFCMMessage(message: FCMMessage): Promise<{ success: boolean; error?: string }> {
  const config = getFirebaseConfig()
  if (!config) {
    return { success: false, error: 'Firebase not configured' }
  }

  try {
    const accessToken = await getAccessToken()
    const url = `https://fcm.googleapis.com/v1/projects/${config.projectId}/messages:send`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`[Push] FCM send failed (${response.status}):`, errorBody)
      return { success: false, error: `HTTP ${response.status}: ${errorBody}` }
    }

    const result = await response.json()
    return { success: true }
  } catch (error) {
    console.error('[Push] FCM send error:', error)
    return { success: false, error: String(error) }
  }
}

// ─── Build FCM Message for a Token ─────────────────────────
function buildMessage(
  fcmToken: string,
  platform: string,
  notification: PushNotificationPayload
): FCMMessage {
  // Default notification uses Arabic (primary language of the app)
  const title = notification.titleAr
  const body = notification.bodyAr

  const message: FCMMessage = {
    token: fcmToken,
    notification: { title, body },
    data: notification.data || {},
  }

  // Platform-specific overrides
  if (platform === 'web') {
    message.webpush = {
      notification: {
        title,
        body,
        icon: '/icon-192.png',
        badge: '/icon-128.png',
        data: notification.data || {},
      },
    }
  }

  return message
}

// ─── Handle Invalid Tokens ─────────────────────────────────
async function handleInvalidToken(token: string): Promise<void> {
  try {
    await db.pushToken.updateMany({
      where: { token, isActive: true },
      data: { isActive: false },
    })
  } catch (error) {
    console.error('[Push] Error deactivating invalid token:', error)
  }
}

// ─── Public API: Send Push Notification ────────────────────
export async function sendPushNotification(
  userId: string,
  notification: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  const config = getFirebaseConfig()

  if (!config) {
    return { sent: 0, failed: 0 }
  }

  // Look up active push tokens for the user
  const pushTokens = await db.pushToken.findMany({
    where: { userId, isActive: true },
  })

  if (pushTokens.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0

  // Send to each token (sequentially to avoid rate limiting)
  for (const pushToken of pushTokens) {
    const message = buildMessage(pushToken.token, pushToken.platform, notification)
    const result = await sendFCMMessage(message)

    if (result.success) {
      sent++
    } else {
      failed++
      // Check for invalid token errors and deactivate them
      if (
        result.error?.includes('UNREGISTERED') ||
        result.error?.includes('invalid-registration-token') ||
        result.error?.includes('NotRegistered') ||
        result.error?.includes('404')
      ) {
        await handleInvalidToken(pushToken.token)
      }
    }
  }

  return { sent, failed }
}

// ─── Public API: Send Multicast Push ───────────────────────
export async function sendMulticastPush(
  userIds: string[],
  notification: PushNotificationPayload
): Promise<{ totalSent: number; totalFailed: number }> {
  const config = getFirebaseConfig()

  if (!config) {
    return { totalSent: 0, totalFailed: 0 }
  }

  if (userIds.length === 0) {
    return { totalSent: 0, totalFailed: 0 }
  }

  // Look up all active push tokens for the given users
  const pushTokens = await db.pushToken.findMany({
    where: {
      userId: { in: userIds },
      isActive: true,
    },
  })

  if (pushTokens.length === 0) {
    return { totalSent: 0, totalFailed: 0 }
  }

  let totalSent = 0
  let totalFailed = 0

  // Group tokens by user for tracking
  const tokensByUser = new Map<string, typeof pushTokens>()
  for (const pt of pushTokens) {
    const list = tokensByUser.get(pt.userId) || []
    list.push(pt)
    tokensByUser.set(pt.userId, list)
  }

  // Send to all tokens (process in batches of 10 to avoid overwhelming FCM)
  const batchSize = 10
  const allTokens = pushTokens

  for (let i = 0; i < allTokens.length; i += batchSize) {
    const batch = allTokens.slice(i, i + batchSize)

    const results = await Promise.allSettled(
      batch.map(async (pushToken) => {
        const message = buildMessage(pushToken.token, pushToken.platform, notification)
        const result = await sendFCMMessage(message)

        if (!result.success) {
          // Check for invalid token errors
          if (
            result.error?.includes('UNREGISTERED') ||
            result.error?.includes('invalid-registration-token') ||
            result.error?.includes('NotRegistered') ||
            result.error?.includes('404')
          ) {
            await handleInvalidToken(pushToken.token)
          }
        }

        return result
      })
    )

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.success) {
        totalSent++
      } else {
        totalFailed++
      }
    }

    // Small delay between batches
    if (i + batchSize < allTokens.length) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
  }

  return { totalSent, totalFailed }
}

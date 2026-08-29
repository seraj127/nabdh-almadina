import { createServer } from 'node:http'
import { jwtVerify } from 'jose'
import { Server, type Socket } from 'socket.io'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET is required and must be at least 32 characters long')
}

const secret = new TextEncoder().encode(jwtSecret)
const sessionCheckUrl = process.env.SYNC_SESSION_CHECK_URL
if (process.env.NODE_ENV === 'production' && !sessionCheckUrl) {
  throw new Error('SYNC_SESSION_CHECK_URL is required in production for revocation-aware sessions')
}

const allowedOrigins = (process.env.SYNC_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 64 * 1024,
})

type Session = {
  userId: string
  role: string
  platform: 'web' | 'mobile' | 'admin'
  jti: string
}

const connectedUsers = new Map<string, Session>()

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(header.split(';').flatMap((part) => {
    const index = part.indexOf('=')
    if (index <= 0) return []
    return [[part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())]]
  }))
}

function getToken(socket: Socket): string | undefined {
  const authToken = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : undefined
  if (authToken) return authToken
  const cookies = parseCookies(socket.handshake.headers.cookie)
  return cookies.admin_session || cookies.session_token
}

async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'nabd-al-madina',
      audience: 'nabd-session',
      algorithms: ['HS256'],
    })
    const userId = typeof payload.userId === 'string' ? payload.userId : ''
    const role = typeof payload.role === 'string' ? payload.role : ''
    const platform = payload.platform === 'web' || payload.platform === 'mobile' || payload.platform === 'admin'
      ? payload.platform
      : null
    const jti = typeof payload.jti === 'string' ? payload.jti : ''
    if (!userId || !role || !platform || !jti) return null

    if (sessionCheckUrl) {
      const response = await fetch(sessionCheckUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(3000),
      })
      if (!response.ok) return null
      const current = await response.json() as { valid?: boolean; userId?: string; role?: string }
      if (!current.valid || current.userId !== userId || current.role !== role) return null
    }

    return { userId, role, platform, jti }
  } catch {
    return null
  }
}

function requireAdmin(socket: Socket): boolean {
  const session = socket.data.session as Session | undefined
  return session?.role === 'admin' && session.platform === 'admin'
}

function isSafeIdentifier(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 160
}

io.use(async (socket, next) => {
  const token = getToken(socket)
  if (!token) return next(new Error('Authentication required'))
  const session = await verifySessionToken(token)
  if (!session) return next(new Error('Invalid or expired session'))
  socket.data.session = session
  next()
})

io.on('connection', (socket) => {
  const session = socket.data.session as Session
  connectedUsers.set(socket.id, session)
  socket.join(`user-${session.userId}`)
  if (session.role === 'admin' && session.platform === 'admin') socket.join('admin-room')
  console.log(`Authenticated client connected: ${session.userId} (${session.role})`)

  // These events are server-controlled operational events. Only an authenticated
  // admin session may emit them; client-provided userId/role are never trusted.
  socket.on('order-created', (data: { orderId: string; orderNumber: string; userId: string; total: number }) => {
    if (!requireAdmin(socket) || !isSafeIdentifier(data?.orderId) || !isSafeIdentifier(data?.orderNumber) || !isSafeIdentifier(data?.userId)) return
    io.to('admin-room').emit('new-order', { ...data, emittedBy: session.userId })
  })

  socket.on('order-updated', (data: { orderId: string; orderNumber: string; userId: string; status: string; note?: string }) => {
    if (!requireAdmin(socket) || !isSafeIdentifier(data?.orderId) || !isSafeIdentifier(data?.orderNumber) || !isSafeIdentifier(data?.userId) || !isSafeIdentifier(data?.status)) return
    const payload = { ...data, emittedBy: session.userId }
    io.to(`user-${data.userId}`).emit('order-status-changed', payload)
    io.to('admin-room').emit('order-status-changed', payload)
  })

  socket.on('notify-user', (data: { userId: string; titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; type: string }) => {
    if (!requireAdmin(socket) || !isSafeIdentifier(data?.userId) || !isSafeIdentifier(data?.type)) return
    io.to(`user-${data.userId}`).emit('notification', { ...data, emittedBy: session.userId })
  })

  socket.on('dashboard-refresh', () => {
    if (requireAdmin(socket)) io.to('admin-room').emit('refresh-stats')
  })

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id)
  })
})

const port = Number(process.env.PORT || 3004)
httpServer.listen(port, () => {
  console.log(`Authenticated sync WebSocket server running on port ${port}`)
})

function shutdown() {
  io.close(() => httpServer.close(() => process.exit(0)))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

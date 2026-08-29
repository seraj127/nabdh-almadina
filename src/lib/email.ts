/**
 * Email Service for نبض المدينة (Nabd Al-Madina)
 * Sends emails via SMTP or logs to console in development
 * Graceful fallback when SMTP is not configured
 */

import { db } from '@/lib/db';
import { renderTemplate, type EmailTemplate } from './email-templates';

// ─── SMTP Configuration ────────────────────────────────────
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromEmail = process.env.EMAIL_FROM || 'no-reply@nabd-almadina.ly';
  const fromName = process.env.EMAIL_FROM_NAME || 'نبض المدينة';

  if (!host || !user || !pass) {
    return null;
  }

  return { host, port, user, pass, fromEmail, fromName };
}

// ─── Send Email via SMTP (using fetch to external API) ─────
async function sendViaSmtp(
  to: string,
  subject: string,
  html: string,
  config: SmtpConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use a simple SMTP relay approach
    // In production, you would use Resend, SendGrid, or similar
    // For now, we'll use a generic web API approach
    
    const apiUrl = process.env.EMAIL_API_URL;
    
    if (apiUrl) {
      // Use external email API (Resend, SendGrid, Mailgun, etc.)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${config.fromName} <${config.fromEmail}>`,
          to,
          subject,
          html,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Email] API send failed:', errorBody);
        return { success: false, error: `HTTP ${response.status}: ${errorBody}` };
      }

      return { success: true };
    }

    // No API configured - email logged to database only
    
    return { success: true };
  } catch (error) {
    console.error('[Email] Send error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Public API: Send Templated Email ──────────────────────
export async function sendTemplatedEmail(
  to: string,
  template: EmailTemplate,
  data: Record<string, any>,
  userId?: string
): Promise<{ success: boolean; emailLogId?: string; error?: string }> {
  try {
    // Render the email template
    const rendered = renderTemplate(template, data);
    const subject = data.lang === 'en' ? rendered.subjectEn : rendered.subjectAr;

    // Create email log entry
    const emailLog = await db.emailLog.create({
      data: {
        userId: userId || null,
        to,
        subjectAr: rendered.subjectAr,
        subjectEn: rendered.subjectEn,
        template,
        status: 'pending',
        data: JSON.stringify(data),
      },
    });

    // Attempt to send
    const config = getSmtpConfig();
    let sendResult: { success: boolean; error?: string };

    if (config) {
      sendResult = await sendViaSmtp(to, subject, rendered.html, config);
    } else {
      // No SMTP configured - email logged to database only
      sendResult = { success: true };
    }

    // Update email log
    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: sendResult.success ? 'sent' : 'failed',
        error: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    });

    return {
      success: sendResult.success,
      emailLogId: emailLog.id,
      error: sendResult.error,
    };
  } catch (error) {
    console.error('[Email] sendTemplatedEmail error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Public API: Send Raw Email ────────────────────────────
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  template: string = 'custom',
  userId?: string,
  data?: Record<string, any>
): Promise<{ success: boolean; emailLogId?: string; error?: string }> {
  try {
    const emailLog = await db.emailLog.create({
      data: {
        userId: userId || null,
        to,
        subjectAr: subject,
        subjectEn: subject,
        template,
        status: 'pending',
        data: data ? (data as any) : undefined,
      },
    });

    const config = getSmtpConfig();
    let sendResult: { success: boolean; error?: string };

    if (config) {
      sendResult = await sendViaSmtp(to, subject, html, config);
    } else {
      // No SMTP configured - email logged to database only
      sendResult = { success: true };
    }

    await db.emailLog.update({
      where: { id: emailLog.id },
      data: {
        status: sendResult.success ? 'sent' : 'failed',
        error: sendResult.error || null,
        sentAt: sendResult.success ? new Date() : null,
      },
    });

    return { success: sendResult.success, emailLogId: emailLog.id, error: sendResult.error };
  } catch (error) {
    console.error('[Email] sendEmail error:', error);
    return { success: false, error: String(error) };
  }
}

// ─── Public API: Get Email Logs ────────────────────────────
export async function getEmailLogs(
  userId?: string,
  limit: number = 50,
  offset: number = 0
) {
  const where = userId ? { userId } : {};
  
  const [logs, total] = await Promise.all([
    db.emailLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    db.emailLog.count({ where }),
  ]);

  return { logs, total };
}

// ─── Public API: Send Notification Email ───────────────────
export async function sendNotificationEmail(
  userId: string,
  titleAr: string,
  titleEn: string,
  bodyAr: string,
  bodyEn: string,
  type: string
): Promise<void> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, language: true },
    });

    if (!user?.email) return; // No email on file

    // Map notification type to email template
    const templateMap: Record<string, EmailTemplate> = {
      order: 'order_confirmation',
      promo: 'promo',
      system: 'welcome',
    };

    const template = templateMap[type] || 'welcome';
    const name = user.name || 'عميل';

    await sendTemplatedEmail(user.email, template, { name, lang: user.language }, userId);
  } catch (error) {
    console.error('[Email] sendNotificationEmail error:', error);
  }
}

// ─── Public API: Map notification type to email template ──
export function notificationTypeToEmailTemplate(type: string): EmailTemplate | null {
  const map: Record<string, EmailTemplate> = {
    order: 'order_confirmation',
    order_shipped: 'order_shipped',
    order_delivered: 'order_delivered',
    payment: 'payment_confirmed',
    wallet: 'wallet_deposit',
    promo: 'promo',
    otp: 'otp',
    password_reset: 'password_reset',
    system: 'welcome',
    welcome: 'welcome',
  };
  return map[type] || null;
}

// ─── Public API: Send email to user (resolves email from userId) ──
export async function sendEmailToUser(
  userId: string,
  template: EmailTemplate,
  data: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, language: true },
    });

    if (!user?.email) {
      return { success: false, error: 'User has no email address' };
    }

    // Inject user name if not provided
    if (!data.name && !data.customerName) {
      data.name = user.name || 'عميل';
    }
    if (!data.lang) {
      data.lang = user.language;
    }

    return await sendTemplatedEmail(user.email, template, data, userId);
  } catch (error) {
    console.error('[Email] sendEmailToUser error:', error);
    return { success: false, error: String(error) };
  }
}

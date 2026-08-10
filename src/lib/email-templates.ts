/**
 * Email Templates for نبض المدينة (Nabd Al-Madina)
 * Beautiful RTL Arabic HTML email templates with brand colors
 */

export type EmailTemplate =
  | 'welcome'
  | 'order_confirmation'
  | 'order_shipped'
  | 'order_delivered'
  | 'otp'
  | 'password_reset'
  | 'payment_confirmed'
  | 'wallet_deposit'
  | 'promo';

interface TemplateResult {
  subjectAr: string;
  subjectEn: string;
  html: string;
}

// ─── Base Layout ────────────────────────────────────────────
function baseLayout(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f5f5f5; direction: rtl; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .content { padding: 32px 24px; }
    .content h2 { color: #1f2937; font-size: 20px; margin: 0 0 16px; }
    .content p { color: #4b5563; font-size: 15px; line-height: 1.7; margin: 0 0 12px; }
    .highlight-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
    .highlight-box .value { font-size: 28px; font-weight: 700; color: #059669; }
    .highlight-box .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 16px 0; }
    .order-items { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .order-items th { background: #f9fafb; color: #6b7280; font-size: 12px; padding: 10px 12px; text-align: right; border-bottom: 1px solid #e5e7eb; }
    .order-items td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; font-size: 14px; color: #374151; }
    .order-total { text-align: left; font-weight: 700; font-size: 16px; color: #059669; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
    .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 4px 0; }
    .footer a { color: #10b981; text-decoration: none; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { color: #6b7280; font-size: 13px; }
    .info-value { color: #1f2937; font-size: 13px; font-weight: 500; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .content { padding: 20px 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ نبض المدينة</h1>
      <p>متجرك الإلكتروني الأول في ليبيا</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>نبض المدينة - جميع الحقوق محفوظة © ${new Date().getFullYear()}</p>
      <p>تواصل معنا: support@nabd-almadina.ly | +218 XX XXXXXXX</p>
      <p style="margin-top:8px"><a href="#">إلغاء الاشتراك</a> · <a href="#">سياسة الخصوصية</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Welcome ────────────────────────────────────────────────
export function welcomeTemplate(data: { name: string }): TemplateResult {
  const html = baseLayout(`
    <h2>مرحباً بك ${data.name}! 🎉</h2>
    <p>شكراً لانضمامك إلى نبض المدينة! نحن سعداء بوجودك معنا.</p>
    <p>اكتشف تشكيلة واسعة من المنتجات المميزة مع توصيل سريع لجميع مناطق ليبيا.</p>
    <div class="highlight-box">
      <div class="value">10 د.ل</div>
      <div class="label">كوبون ترحيبي: WELCOME10</div>
    </div>
    <p>استخدم الكوبون عند الدفع للحصول على خصم على أول طلب لك!</p>
    <div style="text-align: center;">
      <a href="#" class="btn">تسوق الآن</a>
    </div>
    <hr class="divider">
    <p style="font-size: 13px; color: #9ca3af;">يمكنك زيارة حسابك لإدارة المفضلة، تتبع الطلبات، والمزيد.</p>
  `, 'مرحباً بك في نبض المدينة');

  return { subjectAr: 'مرحباً بك في نبض المدينة! 🎉', subjectEn: 'Welcome to Nabd Al-Madina! 🎉', html };
}

// ─── Order Confirmation ─────────────────────────────────────
export function orderConfirmationTemplate(data: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  estimatedDelivery: string;
}): TemplateResult {
  const itemsRows = data.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:left">${item.price.toFixed(2)} د.ل</td>
    </tr>
  `).join('');

  const discountRow = data.discount ? `
    <div class="info-row">
      <span class="info-label">الخصم</span>
      <span class="info-value" style="color:#10b981">-${data.discount.toFixed(2)} د.ل</span>
    </div>` : '';

  const html = baseLayout(`
    <h2>تم تأكيد طلبك! ✅</h2>
    <p>مرحباً ${data.customerName}، تم استلام طلبك بنجاح وسيتم معالجته قريباً.</p>
    <div class="highlight-box">
      <div class="value">${data.orderNumber}</div>
      <div class="label">رقم الطلب</div>
    </div>
    <table class="order-items">
      <thead>
        <tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:left">السعر</th></tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <div class="info-row"><span class="info-label">المجموع الفرعي</span><span class="info-value">${data.subtotal.toFixed(2)} د.ل</span></div>
    <div class="info-row"><span class="info-label">التوصيل</span><span class="info-value">${data.deliveryFee === 0 ? 'مجاني 🎉' : data.deliveryFee.toFixed(2) + ' د.ل'}</span></div>
    ${discountRow}
    <div class="info-row" style="border-bottom:none;"><span class="info-label" style="font-weight:700;color:#1f2937">الإجمالي</span><span class="order-total">${data.total.toFixed(2)} د.ل</span></div>
    <hr class="divider">
    <p>📅 التوصيل المتوقع: <strong>${data.estimatedDelivery}</strong></p>
    <div style="text-align:center;"><a href="#" class="btn">تتبع الطلب</a></div>
  `, 'تأكيد الطلب');

  return { subjectAr: `تم تأكيد طلبك #${data.orderNumber} ✅`, subjectEn: `Order Confirmed #${data.orderNumber} ✅`, html };
}

// ─── Order Shipped ──────────────────────────────────────────
export function orderShippedTemplate(data: {
  orderNumber: string;
  trackingNumber: string;
  carrierName: string;
  estimatedDelivery: string;
  customerName: string;
}): TemplateResult {
  const html = baseLayout(`
    <h2>تم شحن طلبك! 📦</h2>
    <p>مرحباً ${data.customerName}، طلبك في الطريق إليك!</p>
    <div class="highlight-box">
      <div class="value">${data.trackingNumber}</div>
      <div class="label">رقم التتبع</div>
    </div>
    <div class="info-row"><span class="info-label">رقم الطلب</span><span class="info-value">${data.orderNumber}</span></div>
    <div class="info-row"><span class="info-label">شركة الشحن</span><span class="info-value">${data.carrierName}</span></div>
    <div class="info-row"><span class="info-label">التوصيل المتوقع</span><span class="info-value">${data.estimatedDelivery}</span></div>
    <div style="text-align:center;margin-top:16px;"><a href="#" class="btn">تتبع الشحنة</a></div>
  `, 'تم شحن طلبك');

  return { subjectAr: `تم شحن طلبك #${data.orderNumber} 📦`, subjectEn: `Order Shipped #${data.orderNumber} 📦`, html };
}

// ─── Order Delivered ────────────────────────────────────────
export function orderDeliveredTemplate(data: {
  orderNumber: string;
  customerName: string;
  reviewLink?: string;
}): TemplateResult {
  const html = baseLayout(`
    <h2>تم توصيل طلبك! ✨</h2>
    <p>مرحباً ${data.customerName}، تم توصيل طلبك بنجاح. نتمنى أن تنال المنتجات إعجابك!</p>
    <div class="highlight-box">
      <div class="value">${data.orderNumber}</div>
      <div class="label">رقم الطلب</div>
    </div>
    <p>رأيك يهمنا! شاركنا تقييمك لتساعد الآخرين في الاختيار.</p>
    <div style="text-align:center;"><a href="${data.reviewLink || '#'}" class="btn">قيّم المنتج ⭐</a></div>
    <hr class="divider">
    <p style="font-size:13px;color:#9ca3af;">هل واجهت أي مشكلة؟ <a href="#" style="color:#10b981">تواصل معنا</a></p>
  `, 'تم توصيل طلبك');

  return { subjectAr: `تم توصيل طلبك #${data.orderNumber} ✨`, subjectEn: `Order Delivered #${data.orderNumber} ✨`, html };
}

// ─── OTP ────────────────────────────────────────────────────
export function otpTemplate(data: {
  code: string;
  purpose: string;
  expiryMinutes: number;
}): TemplateResult {
  const html = baseLayout(`
    <h2>رمز التحقق 🔐</h2>
    <p>استخدم الرمز التالي لـ${data.purpose}:</p>
    <div class="highlight-box">
      <div class="value" style="letter-spacing:8px;font-size:36px;">${data.code}</div>
      <div class="label">صالح لمدة ${data.expiryMinutes} دقيقة</div>
    </div>
    <p style="font-size:13px;color:#ef4444;">⚠️ لا تشارك هذا الرمز مع أي شخص. لن يطلب منك فريق نبض المدينة هذا الرمز أبداً.</p>
    <hr class="divider">
    <p style="font-size:13px;color:#9ca3af;">إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
  `, 'رمز التحقق');

  return { subjectAr: 'رمز التحقق الخاص بك', subjectEn: 'Your Verification Code', html };
}

// ─── Password Reset ─────────────────────────────────────────
export function passwordResetTemplate(data: {
  resetLink: string;
  expiryMinutes: number;
}): TemplateResult {
  const html = baseLayout(`
    <h2>إعادة تعيين كلمة المرور 🔑</h2>
    <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. اضغط على الزر أدناه لإنشاء كلمة مرور جديدة:</p>
    <div style="text-align:center;">
      <a href="${data.resetLink}" class="btn">إعادة تعيين كلمة المرور</a>
    </div>
    <p style="font-size:13px;color:#6b7280;">هذا الرابط صالح لمدة ${data.expiryMinutes} دقيقة فقط.</p>
    <hr class="divider">
    <p style="font-size:13px;color:#9ca3af;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة. كلمة المرور الحالية لن تتغير.</p>
  `, 'إعادة تعيين كلمة المرور');

  return { subjectAr: 'إعادة تعيين كلمة المرور 🔑', subjectEn: 'Password Reset 🔑', html };
}

// ─── Payment Confirmed ──────────────────────────────────────
export function paymentConfirmedTemplate(data: {
  orderNumber: string;
  amount: number;
  paymentMethod: string;
  customerName: string;
}): TemplateResult {
  const html = baseLayout(`
    <h2>تم تأكيد الدفع! 💳</h2>
    <p>مرحباً ${data.customerName}، تم استلام دفعتك بنجاح.</p>
    <div class="highlight-box">
      <div class="value">${data.amount.toFixed(2)} د.ل</div>
      <div class="label">المبلغ المدفوع</div>
    </div>
    <div class="info-row"><span class="info-label">رقم الطلب</span><span class="info-value">${data.orderNumber}</span></div>
    <div class="info-row"><span class="info-label">طريقة الدفع</span><span class="info-value">${data.paymentMethod}</span></div>
    <div class="info-row"><span class="info-label">حالة الدفع</span><span class="info-value" style="color:#10b981">✅ مدفوع</span></div>
    <hr class="divider">
    <p>سيتم معالجة طلبك قريباً. شكراً لتسوقك معنا!</p>
  `, 'تأكيد الدفع');

  return { subjectAr: `تم تأكيد الدفع للطلب #${data.orderNumber} 💳`, subjectEn: `Payment Confirmed for Order #${data.orderNumber} 💳`, html };
}

// ─── Wallet Deposit ─────────────────────────────────────────
export function walletDepositTemplate(data: {
  amount: number;
  newBalance: number;
  customerName: string;
}): TemplateResult {
  const html = baseLayout(`
    <h2>تم إيداع الرصيد! 💰</h2>
    <p>مرحباً ${data.customerName}، تم إضافة رصيد إلى محفظتك بنجاح.</p>
    <div class="highlight-box">
      <div class="value">+${data.amount.toFixed(2)} د.ل</div>
      <div class="label">المبلغ المضاف</div>
    </div>
    <div class="info-row"><span class="info-label">الرصيد الجديد</span><span class="info-value" style="color:#059669;font-weight:700">${data.newBalance.toFixed(2)} د.ل</span></div>
    <hr class="divider">
    <div style="text-align:center;"><a href="#" class="btn">تسوق الآن</a></div>
  `, 'إيداع رصيد');

  return { subjectAr: `تم إيداع ${data.amount.toFixed(2)} د.ل في محفظتك 💰`, subjectEn: `${data.amount.toFixed(2)} LYD Deposited to Your Wallet 💰`, html };
}

// ─── Promo ──────────────────────────────────────────────────
export function promoTemplate(data: {
  title: string;
  message: string;
  ctaLink?: string;
  ctaText?: string;
  discountCode?: string;
}): TemplateResult {
  const codeSection = data.discountCode ? `
    <div class="highlight-box">
      <div class="value" style="letter-spacing:4px;font-size:24px;">${data.discountCode}</div>
      <div class="label">كود الخصم</div>
    </div>` : '';

  const ctaButton = data.ctaLink ? `
    <div style="text-align:center;"><a href="${data.ctaLink}" class="btn">${data.ctaText || 'تسوق الآن'}</a></div>` : '';

  const html = baseLayout(`
    <h2>${data.title} 🎁</h2>
    <p>${data.message}</p>
    ${codeSection}
    ${ctaButton}
    <hr class="divider">
    <p style="font-size:13px;color:#9ca3af;">العروض لفترة محدودة وقد تنتهي في أي وقت.</p>
  `, data.title);

  return { subjectAr: data.title, subjectEn: data.title, html };
}

// ─── Template Router ────────────────────────────────────────
export function renderTemplate(
  template: EmailTemplate,
  data: Record<string, any>
): TemplateResult {
  switch (template) {
    case 'welcome':
      return welcomeTemplate(data as Parameters<typeof welcomeTemplate>[0]);
    case 'order_confirmation':
      return orderConfirmationTemplate(data as Parameters<typeof orderConfirmationTemplate>[0]);
    case 'order_shipped':
      return orderShippedTemplate(data as Parameters<typeof orderShippedTemplate>[0]);
    case 'order_delivered':
      return orderDeliveredTemplate(data as Parameters<typeof orderDeliveredTemplate>[0]);
    case 'otp':
      return otpTemplate(data as Parameters<typeof otpTemplate>[0]);
    case 'password_reset':
      return passwordResetTemplate(data as Parameters<typeof passwordResetTemplate>[0]);
    case 'payment_confirmed':
      return paymentConfirmedTemplate(data as Parameters<typeof paymentConfirmedTemplate>[0]);
    case 'wallet_deposit':
      return walletDepositTemplate(data as Parameters<typeof walletDepositTemplate>[0]);
    case 'promo':
      return promoTemplate(data as Parameters<typeof promoTemplate>[0]);
    default:
      throw new Error(`Unknown email template: ${template}`);
  }
}

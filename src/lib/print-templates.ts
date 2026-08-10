/**
 * Print Templates — HTML template generators for City Pulse (نبض المدينة)
 *
 * Each function returns a complete HTML string ready to be passed into
 * `printContent()` from `print-service.ts`. All templates are bilingual
 * (Arabic/English) and use inline CSS only (no external stylesheets).
 *
 * IMPORTANT: These functions are async because QR code and barcode
 * generation require DOM APIs that may need async processing.
 */

import {
  generateQRCode,
  generateBarcode,
  generateBarcodeDataURL,
  formatCurrency,
  formatDate,
  formatDateTime,
  STORE_INFO,
  STORE_LOGO_SVG,
  getStoreLogoDataURL,
} from './print-service';

// ─── Shared Types ─────────────────────────────────────────────

interface OrderItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  quantity: number;
  total: number;
  image?: string | null;
  sku?: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  notes?: string | null;
  createdAt: string;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  user: {
    id: string;
    name: string | null;
    phone: string;
  };
  items: OrderItem[];
  address?: {
    address: string;
    city: string;
    area: string | null;
  } | null;
  shipment?: {
    trackingNumber: string | null;
    carrier?: {
      nameAr: string;
      nameEn: string;
    } | null;
    weight?: number | null;
  } | null;
}

interface ProductData {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  price: number;
  comparePrice?: number | null;
  category?: {
    nameAr: string;
    nameEn: string;
  } | null;
  mainImage?: string | null;
  badges?: string | null; // JSON array string
}

interface ReportData {
  titleAr: string;
  titleEn: string;
  dateRange?: { from: string; to: string } | null;
  summaryStats: { labelAr: string; labelEn: string; value: string }[];
  tableHeaders: { key: string; labelAr: string; labelEn: string }[];
  tableRows: Record<string, string>[];
  generatedAt: string;
}

// ─── Helper: Logo HTML ────────────────────────────────────────

function getLogoHTML(size: number = 60): string {
  const logoUrl = getStoreLogoDataURL();
  return `<img src="${logoUrl}" alt="${STORE_INFO.nameAr}" width="${size}" height="${size}" style="display:inline-block; vertical-align:middle;" />`;
}

// ─── Helper: Payment method label ─────────────────────────────

function getPaymentMethodLabel(method: string, lang: string): string {
  const methods: Record<string, { ar: string; en: string }> = {
    cod: { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery' },
    card: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
    bank_transfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
    wallet: { ar: 'المحفظة', en: 'Wallet' },
  };
  const m = methods[method];
  return m ? (lang === 'ar' ? m.ar : m.en) : method;
}

// ─── Helper: Order status label ───────────────────────────────

function getStatusLabel(status: string, lang: string): string {
  const statuses: Record<string, { ar: string; en: string }> = {
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    confirmed: { ar: 'مؤكد', en: 'Confirmed' },
    processing: { ar: 'قيد المعالجة', en: 'Processing' },
    shipped: { ar: 'تم الشحن', en: 'Shipped' },
    delivered: { ar: 'تم التسليم', en: 'Delivered' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    refunded: { ar: 'مسترد', en: 'Refunded' },
  };
  const s = statuses[status];
  return s ? (lang === 'ar' ? s.ar : s.en) : status;
}

// ─── 1. Invoice Template (A4 Laser) ──────────────────────────

/**
 * Generate a professional tax invoice for A4 laser printing.
 * Includes store header, customer info, items table, totals, QR code, and watermark.
 */
export async function generateInvoiceHTML(order: OrderData, language: 'ar' | 'en' = 'ar'): Promise<string> {
  const isAr = language === 'ar';
  const qrData = `${order.orderNumber}|${order.total}|${order.createdAt}`;
  const qrCodeDataURL = await generateQRCode(qrData);

  const isDelivered = order.status === 'delivered';
  const watermarkHTML = isDelivered
    ? `<div class="watermark">${isAr ? 'مدفوع' : 'PAID'}</div>`
    : '';

  const customerName = order.user.name || order.user.phone;
  const customerPhone = order.user.phone;
  const customerAddress = order.address
    ? `${order.address.address}${order.address.area ? ', ' + order.address.area : ''}, ${order.address.city}`
    : (isAr ? 'غير محدد' : 'N/A');

  const itemsRows = order.items.map((item, index) => `
    <tr>
      <td style="text-align:center;">${index + 1}</td>
      <td>${isAr ? item.nameAr : item.nameEn}</td>
      <td style="text-align:center;">${item.sku || '—'}</td>
      <td style="text-align:center;">${item.quantity}</td>
      <td style="text-align:left;">${formatCurrency(item.price)}</td>
      <td style="text-align:left; font-weight:bold;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const taxRate = 0;
  const taxAmount = 0;
  const grandTotal = order.total;

  return `
    ${watermarkHTML}

    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:3px solid #1a1a2e;">
      <div style="display:flex; align-items:center; gap:12px;">
        ${getLogoHTML(55)}
        <div>
          <div style="font-size:20px; font-weight:bold; color:#1a1a2e;">${STORE_INFO.nameAr}</div>
          <div style="font-size:14px; color:#666;">${STORE_INFO.nameEn}</div>
          <div style="font-size:11px; color:#888; margin-top:4px;">${STORE_INFO.addressAr} | ${STORE_INFO.phone}</div>
        </div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:18px; font-weight:bold; color:#1a1a2e;">${isAr ? 'فاتورة ضريبية' : 'Tax Invoice'}</div>
        <div style="font-size:11px; color:#888;">${isAr ? 'فاتورة ضريبية / Tax Invoice' : 'Tax Invoice / فاتورة ضريبية'}</div>
      </div>
    </div>

    <!-- Invoice Info -->
    <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
      <div>
        <table style="width:auto; border:none;">
          <tr><td style="border:none; padding:3px 8px 3px 0; font-weight:bold; color:#555;">${isAr ? 'رقم الفاتورة:' : 'Invoice No:'}</td><td style="border:none; padding:3px 0;">${order.orderNumber}</td></tr>
          <tr><td style="border:none; padding:3px 8px 3px 0; font-weight:bold; color:#555;">${isAr ? 'التاريخ:' : 'Date:'}</td><td style="border:none; padding:3px 0;">${formatDate(order.createdAt, language)}</td></tr>
          <tr><td style="border:none; padding:3px 8px 3px 0; font-weight:bold; color:#555;">${isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'}</td><td style="border:none; padding:3px 0;">${formatDate(order.createdAt, language)}</td></tr>
          <tr><td style="border:none; padding:3px 8px 3px 0; font-weight:bold; color:#555;">${isAr ? 'الحالة:' : 'Status:'}</td><td style="border:none; padding:3px 0;">${getStatusLabel(order.status, language)}</td></tr>
        </table>
      </div>
      <div>
        <div style="font-weight:bold; margin-bottom:6px; color:#1a1a2e;">${isAr ? 'بيانات العميل' : 'Customer Info'}</div>
        <div style="font-size:11px; color:#555;">${isAr ? 'الاسم:' : 'Name:'} ${customerName}</div>
        <div style="font-size:11px; color:#555;">${isAr ? 'الهاتف:' : 'Phone:'} ${customerPhone}</div>
        <div style="font-size:11px; color:#555;">${isAr ? 'العنوان:' : 'Address:'} ${customerAddress}</div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr style="background-color:#1a1a2e; color:#fff;">
          <th style="color:#fff; width:40px; text-align:center;">#</th>
          <th style="color:#fff;">${isAr ? 'المنتج' : 'Product'}</th>
          <th style="color:#fff; width:80px; text-align:center;">SKU</th>
          <th style="color:#fff; width:50px; text-align:center;">${isAr ? 'الكمية' : 'Qty'}</th>
          <th style="color:#fff; width:100px; text-align:left;">${isAr ? 'سعر الوحدة' : 'Unit Price'}</th>
          <th style="color:#fff; width:100px; text-align:left;">${isAr ? 'المجموع' : 'Total'}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex; justify-content:flex-end; margin-top:15px;">
      <table style="width:280px; border:none;">
        <tr>
          <td style="border:none; padding:5px 0; font-weight:bold; color:#555;">${isAr ? 'المجموع الفرعي' : 'Subtotal'}</td>
          <td style="border:none; padding:5px 0; text-align:left;">${formatCurrency(order.subtotal)}</td>
        </tr>
        <tr>
          <td style="border:none; padding:5px 0; font-weight:bold; color:#555;">${isAr ? 'رسوم التوصيل' : 'Shipping'}</td>
          <td style="border:none; padding:5px 0; text-align:left;">${formatCurrency(order.deliveryFee)}</td>
        </tr>
        ${order.discount > 0 ? `
        <tr>
          <td style="border:none; padding:5px 0; font-weight:bold; color:#e94560;">${isAr ? 'الخصم' : 'Discount'}</td>
          <td style="border:none; padding:5px 0; text-align:left; color:#e94560;">-${formatCurrency(order.discount)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="border:none; padding:5px 0; font-weight:bold; color:#555;">${isAr ? 'الضريبة' : 'Tax'} (${taxRate}%)</td>
          <td style="border:none; padding:5px 0; text-align:left;">${formatCurrency(taxAmount)}</td>
        </tr>
        <tr style="border-top:2px solid #1a1a2e;">
          <td style="border:none; border-top:2px solid #1a1a2e; padding:8px 0; font-size:16px; font-weight:bold; color:#1a1a2e;">${isAr ? 'الإجمالي' : 'Grand Total'}</td>
          <td style="border:none; border-top:2px solid #1a1a2e; padding:8px 0; text-align:left; font-size:16px; font-weight:bold; color:#1a1a2e;">${formatCurrency(grandTotal)}</td>
        </tr>
      </table>
    </div>

    <!-- Payment Method -->
    <div style="margin-top:10px; font-size:11px; color:#555;">
      <strong>${isAr ? 'طريقة الدفع:' : 'Payment Method:'}</strong> ${getPaymentMethodLabel(order.paymentMethod, language)}
    </div>

    ${order.notes ? `
    <div style="margin-top:8px; font-size:11px; color:#555;">
      <strong>${isAr ? 'ملاحظات:' : 'Notes:'}</strong> ${order.notes}
    </div>
    ` : ''}

    <!-- QR Code -->
    <div style="margin-top:20px; text-align:center;">
      <img src="${qrCodeDataURL}" alt="QR Code" width="100" height="100" style="display:inline-block;" />
      <div style="font-size:10px; color:#888; margin-top:4px;">${isAr ? 'امسح للتحقق' : 'Scan to verify'}</div>
    </div>

    <!-- Footer -->
    <div style="margin-top:25px; text-align:center; padding-top:15px; border-top:1px solid #ddd; color:#888; font-size:11px;">
      ${isAr ? 'شكراً لتسوقكم معنا' : 'Thank you for shopping with us'}
      <br/>
      ${isAr ? 'Thank you for shopping with us' : 'شكراً لتسوقكم معنا'}
    </div>
  `;
}

// ─── 2. Receipt Template (Thermal 58mm/80mm) ─────────────────

/**
 * Generate a compact thermal receipt for 58mm or 80mm printers.
 * Uses monospace font, simple formatting, no images except QR.
 */
export async function generateReceiptHTML(
  order: OrderData,
  language: 'ar' | 'en' = 'ar',
  width: '58mm' | '80mm' = '80mm'
): Promise<string> {
  const isAr = language === 'ar';
  const isNarrow = width === '58mm';
  const qrData = order.orderNumber;
  const qrCodeDataURL = await generateQRCode(qrData);

  const lineCharCount = isNarrow ? 32 : 48;
  const separator = '─'.repeat(lineCharCount);
  const doubleSeparator = '═'.repeat(lineCharCount);

  const itemsList = order.items.map(item => {
    const name = isAr ? item.nameAr : item.nameEn;
    const line1 = isAr
      ? `  ${name}`
      : `  ${name}`;
    const line2 = isAr
      ? `  ${item.quantity} × ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`
      : `  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`;
    return `${line1}\n${line2}`;
  }).join('\n');

  // Use <pre> for monospace formatting
  return `
    <div style="width:100%;">
      <!-- Store Header -->
      <div class="center bold" style="font-size:${isNarrow ? '13px' : '15px'};">${STORE_INFO.nameAr}</div>
      <div class="center" style="font-size:${isNarrow ? '10px' : '11px'};">${STORE_INFO.nameEn}</div>
      <div class="center" style="font-size:${isNarrow ? '9px' : '10px'};">${STORE_INFO.phone}</div>
      <div class="separator"></div>

      <!-- Receipt Info -->
      <div class="bold">${isAr ? 'إيصال' : 'Receipt'}</div>
      <div>${isAr ? 'رقم:' : 'No:'} ${order.orderNumber}</div>
      <div>${isAr ? 'التاريخ:' : 'Date:'} ${formatDateTime(order.createdAt, language)}</div>
      <div class="separator"></div>

      <!-- Customer -->
      <div>${isAr ? 'العميل:' : 'Customer:'} ${order.user.name || order.user.phone}</div>
      <div>${isAr ? 'الهاتف:' : 'Phone:'} ${order.user.phone}</div>
      <div class="separator"></div>

      <!-- Items -->
      <div class="bold">${isAr ? 'المنتجات:' : 'Items:'}</div>
      <pre style="margin:4px 0; font-family:inherit; font-size:inherit; line-height:inherit; white-space:pre-wrap;">${itemsList}</pre>
      <div class="separator"></div>

      <!-- Totals -->
      <div style="display:flex; justify-content:space-between;">
        <span>${isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
        <span>${formatCurrency(order.subtotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>${isAr ? 'التوصيل' : 'Shipping'}</span>
        <span>${formatCurrency(order.deliveryFee)}</span>
      </div>
      ${order.discount > 0 ? `
      <div style="display:flex; justify-content:space-between; color:#e94560;">
        <span>${isAr ? 'الخصم' : 'Discount'}</span>
        <span>-${formatCurrency(order.discount)}</span>
      </div>
      ` : ''}
      <div class="separator"></div>
      <div style="display:flex; justify-content:space-between; font-size:${isNarrow ? '14px' : '16px'}; font-weight:bold;">
        <span>${isAr ? 'الإجمالي' : 'TOTAL'}</span>
        <span>${formatCurrency(order.total)}</span>
      </div>
      <div class="separator"></div>

      <!-- Payment -->
      <div>${isAr ? 'الدفع:' : 'Payment:'} ${getPaymentMethodLabel(order.paymentMethod, language)}</div>
      <div class="double-separator"></div>

      <!-- QR Code -->
      <div class="center" style="margin:6px 0;">
        <img src="${qrCodeDataURL}" alt="QR" width="${isNarrow ? 80 : 100}" height="${isNarrow ? 80 : 100}" style="display:inline-block;" />
      </div>

      <!-- Footer -->
      <div class="center" style="font-size:${isNarrow ? '9px' : '10px'}; margin-top:4px;">
        ${isAr ? 'شكراً لزيارتكم' : 'Thank you for visiting'}
        <br/>
        ${isAr ? 'Thank you' : 'شكراً لزيارتكم'}
      </div>
    </div>
  `;
}

// ─── 3. Shipping Label Template (100x100mm) ──────────────────

/**
 * Generate a professional shipping label (100x100mm).
 * Includes FROM/TO sections, tracking barcode, QR code, COD info.
 */
export async function generateShippingLabelHTML(
  order: OrderData,
  language: 'ar' | 'en' = 'ar',
  carrier?: { nameAr: string; nameEn: string } | null
): Promise<string> {
  const isAr = language === 'ar';
  const trackingNumber = order.shipment?.trackingNumber || order.orderNumber;
  const barcodeSVG = await generateBarcode(trackingNumber);
  const qrData = trackingNumber;
  const qrCodeDataURL = await generateQRCode(qrData);

  const isCOD = order.paymentMethod === 'cod';
  const customerName = order.user.name || order.user.phone;
  const customerAddress = order.address
    ? `${order.address.address}${order.address.area ? ', ' + order.address.area : ''}`
    : (isAr ? 'غير محدد' : 'N/A');
  const customerCity = order.address?.city || (isAr ? 'غير محدد' : 'N/A');

  const carrierName = carrier
    ? (isAr ? carrier.nameAr : carrier.nameEn)
    : (order.shipment?.carrier ? (isAr ? order.shipment.carrier.nameAr : order.shipment.carrier.nameEn) : '');

  const weight = order.shipment?.weight;

  return `
    <div style="width:100mm; height:auto; padding:5mm; box-sizing:border-box; font-family:'Segoe UI', Tahoma, sans-serif; direction:rtl;">
      <!-- FROM Section -->
      <div style="border:2px solid #1a1a2e; border-radius:6px; padding:8px; margin-bottom:8px;">
        <div style="background-color:#1a1a2e; color:#fff; padding:3px 10px; border-radius:3px; display:inline-block; font-size:11px; font-weight:bold; margin-bottom:6px;">
          ${isAr ? 'من / FROM' : 'FROM / من'}
        </div>
        <div style="font-size:13px; font-weight:bold;">${STORE_INFO.nameAr} - ${STORE_INFO.nameEn}</div>
        <div style="font-size:11px; color:#555;">${STORE_INFO.addressAr}</div>
        <div style="font-size:11px; color:#555;">${STORE_INFO.phone}</div>
      </div>

      <!-- TO Section -->
      <div style="border:2px solid #e94560; border-radius:6px; padding:8px; margin-bottom:8px;">
        <div style="background-color:#e94560; color:#fff; padding:3px 10px; border-radius:3px; display:inline-block; font-size:11px; font-weight:bold; margin-bottom:6px;">
          ${isAr ? 'إلى / TO' : 'TO / إلى'}
        </div>
        <div style="font-size:14px; font-weight:bold;">${customerName}</div>
        <div style="font-size:12px; color:#333;">${order.user.phone}</div>
        <div style="font-size:12px; color:#555;">${customerAddress}</div>
        <div style="font-size:12px; font-weight:bold; color:#333;">${customerCity}</div>
      </div>

      <!-- Tracking Number -->
      <div style="text-align:center; margin:10px 0;">
        <div style="font-size:10px; color:#888; margin-bottom:4px;">${isAr ? 'رقم التتبع' : 'Tracking Number'}</div>
        <div style="font-size:22px; font-weight:bold; letter-spacing:2px; color:#1a1a2e;">${trackingNumber}</div>
      </div>

      <!-- Barcode -->
      <div style="text-align:center; margin:8px 0;">
        ${barcodeSVG}
      </div>

      <!-- QR Code + Info Row -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-top:8px;">
        <div style="text-align:center;">
          <img src="${qrCodeDataURL}" alt="QR" width="70" height="70" style="display:inline-block;" />
        </div>
        <div style="text-align:left; font-size:10px; color:#555;">
          <div><strong>${isAr ? 'الطلب:' : 'Order:'}</strong> ${order.orderNumber}</div>
          ${carrierName ? `<div><strong>${isAr ? 'الناقل:' : 'Carrier:'}</strong> ${carrierName}</div>` : ''}
          ${weight ? `<div><strong>${isAr ? 'الوزن:' : 'Weight:'}</strong> ${weight} kg</div>` : ''}
        </div>
      </div>

      <!-- COD Badge -->
      ${isCOD ? `
      <div style="text-align:center; margin-top:8px; padding:6px; background-color:#fff3cd; border:2px solid #ffc107; border-radius:4px;">
        <div style="font-size:14px; font-weight:bold; color:#856404;">COD: ${formatCurrency(order.total)}</div>
        <div style="font-size:9px; color:#856404;">${isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</div>
      </div>
      ` : ''}

      <!-- Fragile Warning (placeholder — can be enabled per order) -->
    </div>
  `;
}

// ─── 4. Barcode Label Template (50x30mm) ─────────────────────

/**
 * Generate a small product barcode label (50x30mm).
 * Compact layout for label printers: name, SKU barcode, price.
 */
export async function generateBarcodeLabelHTML(
  product: ProductData,
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  const isAr = language === 'ar';
  const barcodeSVG = await generateBarcode(product.sku);

  const productName = isAr ? product.nameAr : product.nameEn;
  // Truncate name to fit label
  const truncatedName = productName.length > 25 ? productName.substring(0, 25) + '…' : productName;

  return `
    <div style="width:50mm; height:30mm; padding:2mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; align-items:center; overflow:hidden;">
      <!-- Product Name -->
      <div class="product-name" style="font-size:9px; width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:center;">
        ${truncatedName}
      </div>

      <!-- Barcode -->
      <div style="transform:scale(0.6); transform-origin:center; margin:-5px 0;">
        ${barcodeSVG}
      </div>

      <!-- SKU -->
      <div style="font-size:7px; color:#888;">${product.sku}</div>

      <!-- Price -->
      <div class="price" style="font-size:14px; font-weight:bold; margin-top:1px;">
        ${formatCurrency(product.price)}
      </div>
    </div>
  `;
}

// ─── 5. QR Code Label Template (50x50mm) ─────────────────────

/**
 * Generate a product QR code label (50x50mm).
 * Includes product name, QR code (encoding product ID), and price.
 */
export async function generateQRCodeLabelHTML(
  product: ProductData,
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  const isAr = language === 'ar';
  const productName = isAr ? product.nameAr : product.nameEn;
  const qrData = product.id; // Encode product ID or URL
  const qrCodeDataURL = await generateQRCode(qrData);

  return `
    <div style="width:50mm; height:50mm; padding:3mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
      <!-- Product Name -->
      <div style="font-size:11px; font-weight:bold; margin-bottom:4px; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        ${productName}
      </div>

      <!-- QR Code -->
      <div style="margin:4px 0;">
        <img src="${qrCodeDataURL}" alt="QR" width="80" height="80" style="display:inline-block;" />
      </div>

      <!-- Price -->
      <div style="font-size:16px; font-weight:bold; color:#1a1a2e; margin-top:4px;">
        ${formatCurrency(product.price)}
      </div>
    </div>
  `;
}

// ─── 6. Product Label Template (100x60mm) ────────────────────

/**
 * Generate a full product label (100x60mm).
 * Includes name (Arabic + English), category, barcode, QR code, price,
 * compare-at price strikethrough, and badges.
 */
export async function generateProductLabelHTML(
  product: ProductData,
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  const isAr = language === 'ar';
  const barcodeSVG = await generateBarcode(product.sku);
  const qrCodeDataURL = await generateQRCode(product.id);

  const category = product.category
    ? (isAr ? product.category.nameAr : product.category.nameEn)
    : '';

  // Parse badges
  let badges: string[] = [];
  try {
    if (product.badges) {
      badges = JSON.parse(product.badges);
    }
  } catch { /* ignore */ }

  const badgeHTML = badges.map(badge => {
    const colors: Record<string, string> = {
      new: 'background:#10b981; color:#fff;',
      sale: 'background:#e94560; color:#fff;',
      bestseller: 'background:#f59e0b; color:#fff;',
    };
    const style = colors[badge] || 'background:#6b7280; color:#fff;';
    const labels: Record<string, { ar: string; en: string }> = {
      new: { ar: 'جديد', en: 'NEW' },
      sale: { ar: 'تخفيض', en: 'SALE' },
      bestseller: { ar: 'الأكثر مبيعاً', en: 'BESTSELLER' },
    };
    const label = labels[badge] ? (isAr ? labels[badge].ar : labels[badge].en) : badge.toUpperCase();
    return `<span style="${style} padding:1px 6px; border-radius:3px; font-size:8px; font-weight:bold; margin-left:3px;">${label}</span>`;
  }).join('');

  const hasComparePrice = product.comparePrice && product.comparePrice > product.price;

  return `
    <div style="width:100mm; height:60mm; padding:3mm; box-sizing:border-box; display:flex; flex-direction:column; justify-content:space-between; overflow:hidden;">
      <!-- Top Row: Name + Category + Badges -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <div style="font-size:13px; font-weight:bold;">${product.nameAr}</div>
            <div style="font-size:11px; color:#555;">${product.nameEn}</div>
          </div>
          <div style="text-align:left;">
            ${category ? `<div style="font-size:9px; color:#888;">${category}</div>` : ''}
            <div>${badgeHTML}</div>
          </div>
        </div>
      </div>

      <!-- Middle Row: Barcode + QR -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin:3px 0;">
        <div style="flex:1; text-align:center;">
          <div style="transform:scale(0.7); transform-origin:center;">
            ${barcodeSVG}
          </div>
          <div style="font-size:8px; color:#888; margin-top:-4px;">${product.sku}</div>
        </div>
        <div style="text-align:center; margin:0 5px;">
          <img src="${qrCodeDataURL}" alt="QR" width="50" height="50" style="display:inline-block;" />
        </div>
      </div>

      <!-- Bottom Row: Price -->
      <div style="text-align:center; padding-top:3px; border-top:1px solid #ddd;">
        <span style="font-size:20px; font-weight:bold; color:#1a1a2e;">
          ${formatCurrency(product.price)}
        </span>
        ${hasComparePrice ? `
        <span style="font-size:12px; color:#999; text-decoration:line-through; margin-right:8px;">
          ${formatCurrency(product.comparePrice!)}
        </span>
        ` : ''}
      </div>
    </div>
  `;
}

// ─── 7. Report Template (A4 Laser) ───────────────────────────

/**
 * Generate a professional financial/sales report for A4 printing.
 * Includes store header, report title, summary stats, data table, and timestamp.
 */
export async function generateReportHTML(
  reportData: ReportData,
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  const isAr = language === 'ar';

  const title = isAr ? reportData.titleAr : reportData.titleEn;
  const dateRangeText = reportData.dateRange
    ? `${formatDate(reportData.dateRange.from, language)} — ${formatDate(reportData.dateRange.to, language)}`
    : '';

  const summaryCards = reportData.summaryStats.map(stat => `
    <div style="flex:1; min-width:120px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:6px; padding:12px; text-align:center; margin:4px;">
      <div style="font-size:11px; color:#888;">${isAr ? stat.labelAr : stat.labelEn}</div>
      <div style="font-size:18px; font-weight:bold; color:#1a1a2e; margin-top:4px;">${stat.value}</div>
    </div>
  `).join('');

  const headerCells = reportData.tableHeaders.map(h =>
    `<th style="background-color:#1a1a2e; color:#fff; padding:8px 10px; text-align:right;">${isAr ? h.labelAr : h.labelEn}</th>`
  ).join('');

  const dataRows = reportData.tableRows.map((row, i) => {
    const cells = reportData.tableHeaders.map(h =>
      `<td style="padding:6px 10px; border-bottom:1px solid #eee; text-align:right;">${row[h.key] || '—'}</td>`
    ).join('');
    const bgColor = i % 2 === 0 ? '#fff' : '#f9f9f9';
    return `<tr style="background-color:${bgColor};">${cells}</tr>`;
  }).join('');

  return `
    <!-- Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; padding-bottom:15px; border-bottom:3px solid #1a1a2e;">
      <div style="display:flex; align-items:center; gap:12px;">
        ${getLogoHTML(50)}
        <div>
          <div style="font-size:20px; font-weight:bold; color:#1a1a2e;">${STORE_INFO.nameAr}</div>
          <div style="font-size:14px; color:#666;">${STORE_INFO.nameEn}</div>
        </div>
      </div>
      <div style="text-align:left;">
        <div style="font-size:18px; font-weight:bold; color:#1a1a2e;">${title}</div>
        ${dateRangeText ? `<div style="font-size:12px; color:#888; margin-top:4px;">${dateRangeText}</div>` : ''}
      </div>
    </div>

    <!-- Summary Stats -->
    <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px;">
      ${summaryCards}
    </div>

    <!-- Data Table -->
    <table>
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>

    <!-- Generated Timestamp -->
    <div style="margin-top:30px; text-align:center; font-size:10px; color:#aaa; border-top:1px solid #eee; padding-top:10px;">
      ${isAr ? 'تم إنشاء التقرير:' : 'Report generated:'} ${formatDateTime(reportData.generatedAt, language)}
      <br/>
      ${STORE_INFO.nameAr} — ${STORE_INFO.nameEn}
    </div>
  `;
}

// ─── Re-export types for convenience ─────────────────────────

export type { OrderData, ProductData, ReportData, OrderItem };

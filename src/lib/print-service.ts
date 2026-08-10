/**
 * Print Service — Core printing utility for City Pulse (نبض المدينة)
 *
 * Handles QR code generation, barcode generation, print window management,
 * and currency/date formatting for print templates.
 *
 * IMPORTANT: This module requires a browser environment (DOM) for barcode
 * generation and the print window functionality. It should be used on the
 * client side only.
 */

import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

// ─── Types ────────────────────────────────────────────────────

export type PrintMode = 'laser-a4' | 'thermal-58mm' | 'thermal-80mm' | 'label';

export type PrintTemplate =
  | 'invoice'
  | 'receipt'
  | 'shipping-label'
  | 'barcode'
  | 'qr-code'
  | 'product-label'
  | 'report';

export interface PrintOptions {
  mode: PrintMode;
  template: PrintTemplate;
  title: string;
  language?: 'ar' | 'en';
  copies?: number;
}

// ─── Store Info ───────────────────────────────────────────────

export const STORE_INFO = {
  nameAr: 'نبض المدينة',
  nameEn: 'City Pulse',
  addressAr: 'طرابلس، ليبيا',
  addressEn: 'Tripoli, Libya',
  phone: '+218-XX-XXXXXXX',
  email: 'info@citypulse.ly',
  website: 'www.citypulse.ly',
} as const;

// ─── QR Code Generation ───────────────────────────────────────

/**
 * Generate a QR code as a base64 data URL string.
 * Uses the `qrcode` package.
 */
export async function generateQRCode(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('QR code generation failed:', error);
    // Return a minimal 1x1 white pixel placeholder
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  }
}

// ─── Barcode Generation ───────────────────────────────────────

/**
 * Generate a barcode as an SVG string using JsBarcode (CODE128 format).
 * Requires a browser environment with DOM support.
 */
export async function generateBarcode(data: string, format: string = 'CODE128'): Promise<string> {
  try {
    // Create an SVG element for barcode rendering
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    JsBarcode(svgNode, data, {
      format,
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 14,
      margin: 5,
      background: '#FFFFFF',
      lineColor: '#000000',
    });

    // Serialize the SVG to string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgNode);
    return svgString;
  } catch (error) {
    console.error('Barcode generation failed:', error);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><text x="10" y="40" font-size="12">Barcode Error</text></svg>`;
  }
}

/**
 * Generate a barcode as a base64 data URL using canvas.
 * Requires a browser environment with HTMLCanvasElement support.
 */
export async function generateBarcodeDataURL(data: string, format: string = 'CODE128'): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, data, {
      format,
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 14,
      margin: 5,
      background: '#FFFFFF',
      lineColor: '#000000',
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode data URL generation failed:', error);
    // Fallback: generate SVG barcode and wrap as data URL
    const svgBarcode = await generateBarcode(data, format);
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgBarcode)));
  }
}

// ─── Currency Formatting ──────────────────────────────────────

/**
 * Format a number as Libyan Dinar currency string.
 * Example: formatCurrency(1234.5) → "1,234.50 د.ل"
 */
export function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} د.ل`;
}

// ─── Date Formatting ──────────────────────────────────────────

/**
 * Format a date string in Arabic or English.
 * Arabic: "١٥ يناير ٢٠٢٥"
 * English: "January 15, 2025"
 */
export function formatDate(date: string, lang: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  if (lang === 'ar') {
    return d.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a date with time in Arabic or English.
 */
export function formatDateTime(date: string, lang: string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return date;

  if (lang === 'ar') {
    return d.toLocaleDateString('ar-LY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Print CSS Styles ─────────────────────────────────────────

/**
 * Get print-specific CSS styles based on print mode.
 * These styles are injected as inline `<style>` into the print window.
 */
export function getPrintCSS(mode: PrintMode): string {
  const baseCSS = `
    @page {
      margin: 0;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
    }
  `;

  switch (mode) {
    case 'laser-a4':
      return `
        ${baseCSS}
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #1a1a1a;
          direction: rtl;
          background: #fff;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px 12px;
          border: 1px solid #ddd;
          text-align: right;
        }
        th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .page-break {
          page-break-after: always;
        }
        .no-break {
          page-break-inside: avoid;
        }
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 80px;
          color: rgba(0, 128, 0, 0.1);
          font-weight: bold;
          pointer-events: none;
          z-index: 9999;
        }
      `;

    case 'thermal-58mm':
      return `
        ${baseCSS}
        @page {
          size: 58mm auto;
          margin: 2mm;
        }
        body {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          direction: rtl;
          width: 54mm;
          max-width: 54mm;
          background: #fff;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .left { text-align: left; }
        .bold { font-weight: bold; }
        .separator {
          border-top: 1px dashed #000;
          margin: 4px 0;
          padding-top: 4px;
        }
        .double-separator {
          border-top: 2px dashed #000;
          margin: 4px 0;
          padding-top: 4px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 1px 0;
          vertical-align: top;
        }
      `;

    case 'thermal-80mm':
      return `
        ${baseCSS}
        @page {
          size: 80mm auto;
          margin: 3mm;
        }
        body {
          font-family: 'Courier New', 'Lucida Console', monospace;
          font-size: 11px;
          line-height: 1.4;
          color: #000;
          direction: rtl;
          width: 74mm;
          max-width: 74mm;
          background: #fff;
        }
        .center { text-align: center; }
        .right { text-align: right; }
        .left { text-align: left; }
        .bold { font-weight: bold; }
        .separator {
          border-top: 1px dashed #000;
          margin: 5px 0;
          padding-top: 5px;
        }
        .double-separator {
          border-top: 2px dashed #000;
          margin: 5px 0;
          padding-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        td {
          padding: 2px 0;
          vertical-align: top;
        }
      `;

    case 'label':
      return `
        ${baseCSS}
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 10px;
          line-height: 1.3;
          color: #000;
          direction: rtl;
          background: #fff;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .price {
          font-size: 18px;
          font-weight: bold;
          text-align: center;
        }
        .product-name {
          font-size: 11px;
          font-weight: bold;
          text-align: center;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .barcode-container {
          text-align: center;
        }
        .barcode-container svg {
          max-width: 100%;
          height: auto;
        }
      `;

    default:
      return baseCSS;
  }
}

// ─── Print Content ────────────────────────────────────────────

/**
 * Print HTML content in a new browser window with proper CSS and RTL support.
 * Opens a print dialog and closes the window after printing.
 *
 * Steps:
 * 1. Create a new window
 * 2. Write HTML content with proper `<html dir="rtl">` for Arabic
 * 3. Include print CSS based on mode
 * 4. Trigger `window.print()` after content loads
 * 5. Close the window after printing
 */
export function printContent(htmlContent: string, options: PrintOptions): void {
  const {
    mode,
    title,
    language = 'ar',
  } = options;

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const lang = language === 'ar' ? 'ar' : 'en';
  const css = getPrintCSS(mode);

  // Create a new window for printing
  const printWindow = window.open('', '_blank', 'width=800,height=600');

  if (!printWindow) {
    console.error('Print window blocked by popup blocker. Please allow popups for this site.');
    alert(language === 'ar'
      ? 'تم حظر نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.'
      : 'Print window blocked. Please allow popups for this site.');
    return;
  }

  // Build the full HTML document
  const fullHTML = `<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${css}</style>
</head>
<body>
  ${htmlContent}
  <script>
    // Wait for content (especially images) to load before printing
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
        // Close the window after a short delay to allow print dialog to appear
        setTimeout(function() {
          window.close();
        }, 500);
      }, 300);
    });
  </script>
</body>
</html>`;

  printWindow.document.write(fullHTML);
  printWindow.document.close();
}

// ─── Store Logo SVG (inline placeholder) ─────────────────────

/**
 * Inline SVG logo for use in print templates.
 * This avoids needing to load external images in the print window.
 */
export const STORE_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="80" height="80">
  <rect width="120" height="120" rx="16" fill="#1a1a2e"/>
  <text x="60" y="48" text-anchor="middle" fill="#e94560" font-size="18" font-weight="bold" font-family="Arial, sans-serif">نبض</text>
  <text x="60" y="72" text-anchor="middle" fill="#ffffff" font-size="18" font-weight="bold" font-family="Arial, sans-serif">المدينة</text>
  <text x="60" y="100" text-anchor="middle" fill="#e94560" font-size="10" font-family="Arial, sans-serif">CITY PULSE</text>
</svg>`;

/**
 * Get store logo as base64 data URL.
 */
export function getStoreLogoDataURL(): string {
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(STORE_LOGO_SVG)));
}

// ─── Print Mode / Template Constants ─────────────────────────

export const PRINT_MODES: Record<PrintMode, { label: string; labelAr: string; width: string }> = {
  'laser-a4': { label: 'Laser A4', labelAr: 'ليزر A4', width: '210mm' },
  'thermal-58mm': { label: 'Thermal 58mm', labelAr: 'حراري 58مم', width: '58mm' },
  'thermal-80mm': { label: 'Thermal 80mm', labelAr: 'حراري 80مم', width: '80mm' },
  'label': { label: 'Label Printer', labelAr: 'طابعة ملصقات', width: '100mm' },
};

export const PRINT_TEMPLATES: Record<PrintTemplate, { label: string; labelAr: string; defaultMode: PrintMode }> = {
  'invoice': { label: 'Tax Invoice', labelAr: 'فاتورة ضريبية', defaultMode: 'laser-a4' },
  'receipt': { label: 'Receipt', labelAr: 'إيصال', defaultMode: 'thermal-80mm' },
  'shipping-label': { label: 'Shipping Label', labelAr: 'ملصق شحن', defaultMode: 'label' },
  'barcode': { label: 'Barcode Label', labelAr: 'ملصق باركود', defaultMode: 'label' },
  'qr-code': { label: 'QR Code Label', labelAr: 'ملصق رمز QR', defaultMode: 'label' },
  'product-label': { label: 'Product Label', labelAr: 'ملصق منتج', defaultMode: 'label' },
  'report': { label: 'Report', labelAr: 'تقرير', defaultMode: 'laser-a4' },
};

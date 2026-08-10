'use client';

import { useState, useMemo } from 'react';
import {
  Printer,
  FileText,
  Receipt,
  Truck,
  Barcode,
  QrCode,
  Package,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { useLanguageStore } from '@/stores/language-store';
import { COLORS } from '@/components/admin/shared/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { type PrintMode, type PrintTemplate, printContent } from '@/lib/print-service';
import {
  generateInvoiceHTML,
  generateReceiptHTML,
  generateShippingLabelHTML,
  generateBarcodeLabelHTML,
  generateQRCodeLabelHTML,
  generateProductLabelHTML,
} from '@/lib/print-templates';

// ─── Types ────────────────────────────────────────────────────

export interface PrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'order' | 'product' | 'batch-orders' | 'batch-products';
  data: any; // Single order, product, or array of orders/products
  /** Pre-selected template (e.g. shipping-label for logistics) */
  defaultTemplate?: PrintTemplate;
}

// ─── Template Config ──────────────────────────────────────────

interface TemplateOption {
  key: PrintTemplate;
  icon: React.ElementType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  color: string;
}

const ORDER_TEMPLATES: TemplateOption[] = [
  {
    key: 'invoice',
    icon: FileText,
    titleAr: 'فاتورة ضريبية',
    titleEn: 'Invoice',
    descAr: 'فاتورة A4 كاملة مع تفاصيل الضريبة',
    descEn: 'Full A4 invoice with tax details',
    color: COLORS.active,
  },
  {
    key: 'receipt',
    icon: Receipt,
    titleAr: 'إيصال',
    titleEn: 'Receipt',
    descAr: 'إيصال حراري مختصر',
    descEn: 'Compact thermal receipt',
    color: COLORS.success,
  },
  {
    key: 'shipping-label',
    icon: Truck,
    titleAr: 'ملصق شحن',
    titleEn: 'Shipping Label',
    descAr: 'ملصق شحن مع باركود وتتبع',
    descEn: 'Shipping label with barcode & tracking',
    color: COLORS.purple,
  },
];

const PRODUCT_TEMPLATES: TemplateOption[] = [
  {
    key: 'barcode',
    icon: Barcode,
    titleAr: 'ملصق باركود',
    titleEn: 'Barcode Label',
    descAr: 'ملصق باركود صغير مع السعر',
    descEn: 'Small barcode label with price',
    color: COLORS.active,
  },
  {
    key: 'qr-code',
    icon: QrCode,
    titleAr: 'ملصق QR',
    titleEn: 'QR Label',
    descAr: 'ملصق رمز QR للمنتج',
    descEn: 'QR code product label',
    color: COLORS.success,
  },
  {
    key: 'product-label',
    icon: Package,
    titleAr: 'ملصق المنتج',
    titleEn: 'Product Label',
    descAr: 'ملصق كامل مع الاسم والباركود والسعر',
    descEn: 'Full label with name, barcode & price',
    color: COLORS.purple,
  },
];

// ─── Print Mode Config ────────────────────────────────────────

interface PrintModeOption {
  key: PrintMode;
  labelAr: string;
  labelEn: string;
  sublabelAr: string;
  sublabelEn: string;
}

const PRINT_MODES: PrintModeOption[] = [
  {
    key: 'laser-a4',
    labelAr: 'ليزر A4',
    labelEn: 'Laser A4',
    sublabelAr: 'للفواتير والتقارير',
    sublabelEn: 'For invoices & reports',
  },
  {
    key: 'thermal-58mm',
    labelAr: 'حراري 58mm',
    labelEn: 'Thermal 58mm',
    sublabelAr: 'للإيصالات الصغيرة',
    sublabelEn: 'For small receipts',
  },
  {
    key: 'thermal-80mm',
    labelAr: 'حراري 80mm',
    labelEn: 'Thermal 80mm',
    sublabelAr: 'للإيصالات الكبيرة',
    sublabelEn: 'For larger receipts',
  },
  {
    key: 'label',
    labelAr: 'ملصق',
    labelEn: 'Label',
    sublabelAr: 'للشحن والباركود و QR',
    sublabelEn: 'For shipping, barcode & QR',
  },
];

// ─── Default mode per template ────────────────────────────────

const TEMPLATE_DEFAULT_MODE: Record<PrintTemplate, PrintMode> = {
  invoice: 'laser-a4',
  receipt: 'thermal-80mm',
  'shipping-label': 'label',
  barcode: 'label',
  'qr-code': 'label',
  'product-label': 'label',
  report: 'laser-a4',
};

// ─── PrintDialog Component ────────────────────────────────────

export function PrintDialog({
  open,
  onOpenChange,
  type,
  data,
  defaultTemplate,
}: PrintDialogProps) {
  const { t, language } = useLanguageStore();
  const isRTL = language === 'ar';

  const templates = useMemo(() => {
    if (type === 'order' || type === 'batch-orders') return ORDER_TEMPLATES;
    return PRODUCT_TEMPLATES;
  }, [type]);

  const [selectedTemplate, setSelectedTemplate] = useState<PrintTemplate>(
    defaultTemplate || ORDER_TEMPLATES[0].key
  );
  const [selectedMode, setSelectedMode] = useState<PrintMode>(
    TEMPLATE_DEFAULT_MODE[defaultTemplate || ORDER_TEMPLATES[0].key]
  );
  const [copies, setCopies] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset state when dialog opens with new data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const tpl = defaultTemplate || templates[0].key;
      setSelectedTemplate(tpl);
      setSelectedMode(TEMPLATE_DEFAULT_MODE[tpl]);
      setCopies(1);
      setIsGenerating(false);
    }
    onOpenChange(newOpen);
  };

  // When template changes, auto-select the default mode
  const handleTemplateChange = (tpl: PrintTemplate) => {
    setSelectedTemplate(tpl);
    setSelectedMode(TEMPLATE_DEFAULT_MODE[tpl]);
  };

  // Dialog title
  const getDialogTitle = () => {
    if (type === 'order') {
      return isRTL ? 'طباعة الفاتورة' : 'Print Invoice';
    }
    if (type === 'batch-orders') {
      return isRTL ? 'طباعة متعددة للطلبات' : 'Batch Print Orders';
    }
    if (type === 'product') {
      return isRTL ? 'طباعة ملصق المنتج' : 'Print Product Label';
    }
    return isRTL ? 'طباعة متعددة للمنتجات' : 'Batch Print Products';
  };

  // Handle print execution
  const handlePrint = async () => {
    if (!data) return;
    setIsGenerating(true);

    try {
      const items = Array.isArray(data) ? data : [data];
      const lang = isRTL ? 'ar' : 'en';

      // For batch, generate HTML for each item and concatenate
      const htmlParts: string[] = [];

      for (const item of items) {
        let html = '';

        switch (selectedTemplate) {
          case 'invoice':
            html = await generateInvoiceHTML(item, lang);
            break;
          case 'receipt':
            html = await generateReceiptHTML(item, lang, selectedMode === 'thermal-58mm' ? '58mm' : '80mm');
            break;
          case 'shipping-label':
            html = await generateShippingLabelHTML(item, lang);
            break;
          case 'barcode':
            html = await generateBarcodeLabelHTML(item, lang);
            break;
          case 'qr-code':
            html = await generateQRCodeLabelHTML(item, lang);
            break;
          case 'product-label':
            html = await generateProductLabelHTML(item, lang);
            break;
          default:
            html = await generateInvoiceHTML(item, lang);
        }

        if (html) {
          htmlParts.push(html);
          // Add page break between items for batch printing
          if (items.length > 1 && htmlParts.length < items.length) {
            htmlParts.push('<div style="page-break-after: always;"></div>');
          }
        }
      }

      const fullHTML = htmlParts.join('');

      if (fullHTML) {
        printContent(fullHTML, {
          mode: selectedMode,
          template: selectedTemplate,
          title: getDialogTitle(),
          language: lang,
          copies: copies,
        });

        // Close dialog after print window opens
        setTimeout(() => {
          onOpenChange(false);
        }, 500);
      }
    } catch (error) {
      console.error('Print generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
          color: COLORS.text,
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="flex items-center gap-2"
            style={{ color: COLORS.text }}
          >
            <Printer className="h-5 w-5" style={{ color: COLORS.purple }} />
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription style={{ color: COLORS.muted }}>
            {isRTL ? 'اختر القالب ووضع الطباعة ثم اطبع' : 'Select a template and print mode, then print'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* ─── Template Selection ─── */}
          <div className="space-y-3">
            <Label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.muted }}
            >
              {isRTL ? 'نوع القالب' : 'Template Type'}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = selectedTemplate === tpl.key;
                return (
                  <button
                    key={tpl.key}
                    onClick={() => handleTemplateChange(tpl.key)}
                    className="p-3 rounded-xl border-2 text-start transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      backgroundColor: isSelected ? `${tpl.color}10` : COLORS.bg,
                      borderColor: isSelected ? tpl.color : COLORS.border,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${tpl.color}20`,
                          color: tpl.color,
                        }}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isSelected ? tpl.color : COLORS.text }}
                      >
                        {isRTL ? tpl.titleAr : tpl.titleEn}
                      </span>
                    </div>
                    <p
                      className="text-[11px] leading-tight"
                      style={{ color: COLORS.muted }}
                    >
                      {isRTL ? tpl.descAr : tpl.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Print Mode Selection ─── */}
          <div className="space-y-3">
            <Label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.muted }}
            >
              {t('print.selectPrintMode')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {PRINT_MODES.map((mode) => {
                const isSelected = selectedMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    onClick={() => setSelectedMode(mode.key)}
                    className="px-4 py-2 rounded-lg border-2 text-start transition-all duration-200 min-w-[120px]"
                    style={{
                      backgroundColor: isSelected ? `${COLORS.purple}15` : COLORS.bg,
                      borderColor: isSelected ? COLORS.purple : COLORS.border,
                    }}
                  >
                    <div
                      className="text-sm font-medium"
                      style={{ color: isSelected ? COLORS.purple : COLORS.text }}
                    >
                      {isRTL ? mode.labelAr : mode.labelEn}
                    </div>
                    <div
                      className="text-[10px]"
                      style={{ color: COLORS.muted }}
                    >
                      {isRTL ? mode.sublabelAr : mode.sublabelEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── Number of Copies ─── */}
          <div className="space-y-3">
            <Label
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.muted }}
            >
              {t('print.copies')}
            </Label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCopies((c) => Math.max(1, c - 1))}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.border,
                  color: COLORS.text,
                }}
                disabled={copies <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div
                className="w-16 h-9 rounded-lg border flex items-center justify-center text-lg font-bold"
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.purple,
                  color: COLORS.purple,
                }}
              >
                {copies}
              </div>
              <button
                onClick={() => setCopies((c) => Math.min(20, c + 1))}
                className="w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: COLORS.bg,
                  borderColor: COLORS.border,
                  color: COLORS.text,
                }}
                disabled={copies >= 20}
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-xs" style={{ color: COLORS.muted }}>
                {isRTL ? '(1 - 20)' : '(1–20)'}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isGenerating}
            style={{
              borderColor: COLORS.border,
              color: COLORS.text,
              backgroundColor: 'transparent',
            }}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={isGenerating}
            className="gap-2"
            style={{
              backgroundColor: COLORS.purple,
              color: '#fff',
              border: 'none',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('print.generating')}
              </>
            ) : (
              <>
                <Printer className="h-4 w-4" />
                {t('print.printNow')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export const dynamic = "force-dynamic";

// ─── ZAI Singleton (reuse across requests) ───
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// ─── System Prompt — Bilingual E-commerce Assistant ───
const SYSTEM_PROMPT_AR = `أنت مساعد ذكي لمتجر "نبض المدينة" (City Pulse) الإلكتروني في ليبيا. دورك مساعدة العملاء بكل احترافية ولطف.

معلومات المتجر:
- الاسم: نبض المدينة | City Pulse
- العملة: دينار ليبي (د.ل)
- منطقة التوصيل: ليبيا (معظم المناطق)
- رسوم التوصيل: 8-20 د.ل حسب المنطقة
- مدة التوصيل: 2-5 أيام عمل
- طرق الدفع: الدفع عند الاستلام (نقدي)، التحويل البنكي، المحفظة الإلكترونية
- سياسة الإرجاع: خلال 14 يومًا بشرط الحالة الأصلية
- ساعات خدمة العملاء: 9 صباحًا - 9 مساءً بتوقيت ليبيا (السبت-الخميس)
- المتجر الإلكتروني متاح 24/7

قواعد مهمة:
1. أجب دائمًا بالعربية إذا كان سؤال العميل بالعربية
2. أجب بالإنجليزية إذا كان سؤال العميل بالإنجليزية
3. كن مختصرًا ومفيدًا - لا تكتب ردودًا طويلة جدًا (3-4 أسطر كحد أقصى)
4. إذا سُئلت عن شيء لا تعرفه، اعتذر بلطف واقترح التواصل مع خدمة العملاء
5. استخدم العملة الليبية (د.ل) دائمًا
6. لا تخترع معلومات غير موجودة أعلاه
7. كن ودودًا واحترافيًا`;

const SYSTEM_PROMPT_EN = `You are a smart assistant for "City Pulse" (نبض المدينة), an e-commerce store in Libya. Your role is to help customers professionally and kindly.

Store Information:
- Name: City Pulse | نبض المدينة
- Currency: Libyan Dinar (LYD)
- Delivery area: Libya (most regions)
- Delivery fees: 8-20 LYD depending on area
- Delivery time: 2-5 business days
- Payment methods: Cash on Delivery, Bank Transfer, E-Wallet
- Return policy: Within 14 days in original condition
- Customer service hours: 9 AM - 9 PM Libya time (Sat-Thu)
- Online store available 24/7

Important rules:
1. Always respond in Arabic if the customer writes in Arabic
2. Respond in English if the customer writes in English
3. Be concise and helpful - keep responses short (3-4 lines max)
4. If asked about something you don't know, apologize and suggest contacting customer service
5. Always use Libyan Dinar (LYD)
6. Do not make up information not provided above
7. Be friendly and professional`;

// ─── Fallback Responses (when AI is unavailable) ───
const fallbackResponses: { keywords: string[]; replyAr: string; replyEn: string }[] = [
  {
    keywords: ['تتبع', 'تتبعي', 'طلبي', 'طلبات', 'اين', 'أين', 'وصل', 'واصلت', 'حالة', 'order', 'track', 'tracking', 'where'],
    replyAr: 'لتتبع طلبك، اذهب إلى "طلباتي" في حسابك. ستجد حالة الطلب وتفاصيل الشحن. هل تريد مساعدة أخرى؟',
    replyEn: 'To track your order, go to "My Orders" in your account. You\'ll find the order status and shipping details. Need anything else?',
  },
  {
    keywords: ['توصيل', 'شحن', 'تسليم', 'منطقة', 'مناطق', 'رسوم', 'كم يوم', 'delivery', 'shipping'],
    replyAr: 'التوصيل لمعظم مناطق ليبيا. الرسوم: 8-20 د.ل حسب المنطقة. المدة: 2-5 أيام عمل.',
    replyEn: 'Delivery across most of Libya. Fees: 8-20 LYD depending on area. Time: 2-5 business days.',
  },
  {
    keywords: ['إرجاع', 'ارجاع', 'استرجاع', 'استرجع', 'رجوع', 'replace', 'return', 'refund', 'راجع'],
    replyAr: 'يمكنك الإرجاع خلال 14 يومًا بالحالة الأصلية. اذهب لـ"طلباتي" واختر "إرجاع". الاسترداد خلال 5-7 أيام عمل.',
    replyEn: 'You can return within 14 days in original condition. Go to "My Orders" and select "Return". Refund in 5-7 business days.',
  },
  {
    keywords: ['دفع', 'مبلغ', 'بطاقة', 'تحويل', 'نقدي', 'كاش', 'محفظة', 'pay', 'payment', 'card', 'cash'],
    replyAr: 'طرق الدفع: نقدي عند الاستلام، تحويل بنكي، ومحفظة إلكترونية. يمكنك شحن محفظتك من "محفظتي".',
    replyEn: 'Payment methods: Cash on delivery, bank transfer, and e-wallet. You can top up your wallet from "My Wallet".',
  },
  {
    keywords: ['منتج', 'منتجات', 'سعر', 'أسعار', 'متوفر', 'مخزون', 'جديد', 'عرض', 'عروض', 'product', 'price'],
    replyAr: 'تصفح المنتجات في الصفحة الرئيسية أو بالفئات. استخدم البحث للعثور على منتج معين!',
    replyEn: 'Browse products on the homepage or by category. Use search to find specific items!',
  },
  {
    keywords: ['ساعات', 'وقت', 'دوام', 'مواعيد', 'متى', 'يفتح', 'يغلق', 'hours', 'schedule', 'open'],
    replyAr: 'المتجر متاح 24/7! خدمة العملاء: 9 صباحًا - 9 مساءً (السبت-الخميس) بتوقيت ليبيا.',
    replyEn: 'Store is available 24/7! Customer service: 9 AM - 9 PM (Sat-Thu) Libya time.',
  },
  {
    keywords: ['تواصل', 'اتصل', 'هاتف', 'واتساب', 'رقم', 'مساعدة', 'شكوى', 'اقتراح', 'contact', 'call', 'help', 'support'],
    replyAr: 'تواصل معنا عبر واتساب أو الهاتف أو نموذج التواصل في صفحة "تواصل معنا". فريقنا سيرد عليك قريبًا!',
    replyEn: 'Contact us via WhatsApp, phone, or the contact form on "Contact Us" page. Our team will respond soon!',
  },
];

const defaultFallbackAr = 'مرحبًا! يمكنني مساعدتك في: تتبع الطلبات، التوصيل، الإرجاع، الدفع، المنتجات، وأكثر. اكتب استفسارك!';
const defaultFallbackEn = 'Hello! I can help with: order tracking, delivery, returns, payment, products, and more. Type your question!';

// ─── Detect Language ───
function detectLanguage(text: string): 'ar' | 'en' {
  const arabicRegex = /[\u0600-\u06FF]/;
  const arabicChars = text.split('').filter(c => arabicRegex.test(c)).length;
  return arabicChars > text.length * 0.2 ? 'ar' : 'en';
}

// ─── Fallback Keyword Matching ───
function getFallbackResponse(message: string, lang: 'ar' | 'en'): string {
  const normalizedMessage = message.trim().toLowerCase();

  for (const entry of fallbackResponses) {
    const matched = entry.keywords.some((keyword) =>
      normalizedMessage.includes(keyword.toLowerCase())
    );
    if (matched) {
      return lang === 'ar' ? entry.replyAr : entry.replyEn;
    }
  }

  return lang === 'ar' ? defaultFallbackAr : defaultFallbackEn;
}

// ─── POST Handler ───
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language, history } = body as {
      message: string;
      language?: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة', reply: 'الرسالة مطلوبة' },
        { status: 400 }
      );
    }

    const detectedLang = language === 'en' ? 'en' : detectLanguage(message);
    const systemPrompt = detectedLang === 'ar' ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;

    // Build conversation messages for context
    const conversationMessages: { role: 'assistant' | 'user'; content: string }[] = [
      { role: 'assistant', content: systemPrompt },
    ];

    // Add conversation history (last 10 messages max to keep context manageable)
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-10);
      conversationMessages.push(...recentHistory);
    }

    // Add current user message
    conversationMessages.push({ role: 'user', content: message });

    // Try AI-powered response
    try {
      const zai = await getZAI();
      const completion = await zai.chat.completions.create({
        messages: conversationMessages,
        thinking: { type: 'disabled' },
      });

      const aiResponse = completion.choices[0]?.message?.content;

      if (aiResponse && aiResponse.trim().length > 0) {
        return NextResponse.json({
          reply: aiResponse.trim(),
          source: 'ai',
          language: detectedLang,
        });
      }
    } catch (aiError) {
      console.error('[CHAT_AI_ERROR]', aiError);
      // Fall through to keyword-based fallback
    }

    // Fallback: keyword-based responses
    const fallbackReply = getFallbackResponse(message, detectedLang);
    return NextResponse.json({
      reply: fallbackReply,
      source: 'fallback',
      language: detectedLang,
    });

  } catch (error) {
    console.error('[CHAT_POST]', error);
    return NextResponse.json(
      {
        error: 'فشل في معالجة الرسالة',
        reply: 'عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.',
        source: 'error'
      },
      { status: 500 }
    );
  }
}

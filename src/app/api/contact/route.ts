import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, category, subject, message, userId } = body;

    // Validate required fields
    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Name, phone, and message are required' },
        { status: 400 }
      );
    }

    // Validate field lengths
    if (name.length > 200 || phone.length > 30 || message.length > 5000) {
      return NextResponse.json(
        { error: 'Field length exceeded' },
        { status: 400 }
      );
    }

    // Map category key to short category name
    const categoryMap: Record<string, string> = {
      'contact.categoryGeneral': 'general',
      'contact.categoryOrder': 'order',
      'contact.categoryComplaint': 'complaint',
      'contact.categorySuggestion': 'suggestion',
      'contact.categoryTechnical': 'technical',
      'contact.categoryReturn': 'return',
    };

    const categoryValue = categoryMap[category] || 'general';

    // Save to database
    await db.contactMessage.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        category: categoryValue,
        subject: subject?.trim() || null,
        message: message.trim(),
        userId: userId || null,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Contact form submitted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: List contact messages (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const messages = await db.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = await db.contactMessage.count({ where });
    const newCount = await db.contactMessage.count({ where: { status: 'new' } });

    return NextResponse.json({
      messages,
      total,
      newCount,
    });
  } catch (error) {
    console.error('[Contact API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

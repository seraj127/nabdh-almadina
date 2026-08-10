import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/newsletter — Subscribe an email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { success: false, error: 'already_subscribed', message: 'This email is already subscribed' },
          { status: 409 }
        );
      }

      // Reactivate if previously unsubscribed
      await db.newsletterSubscriber.update({
        where: { email: normalizedEmail },
        data: { isActive: true },
      });

      return NextResponse.json(
        { success: true, message: 'Re-subscribed successfully' },
        { status: 200 }
      );
    }

    // Create new subscriber
    await db.newsletterSubscriber.create({
      data: { email: normalizedEmail },
    });

    return NextResponse.json(
      { success: true, message: 'Subscribed successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Newsletter API] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An error occurred, try again' },
      { status: 500 }
    );
  }
}

// DELETE /api/newsletter — Unsubscribe an email
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await db.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'not_found', message: 'Email not found' },
        { status: 404 }
      );
    }

    if (!existing.isActive) {
      return NextResponse.json(
        { success: false, error: 'already_unsubscribed', message: 'Already unsubscribed' },
        { status: 409 }
      );
    }

    await db.newsletterSubscriber.update({
      where: { email: normalizedEmail },
      data: { isActive: false },
    });

    return NextResponse.json(
      { success: true, message: 'Unsubscribed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Newsletter API] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'internal_error', message: 'An error occurred, try again' },
      { status: 500 }
    );
  }
}

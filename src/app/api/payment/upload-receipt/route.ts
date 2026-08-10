import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAuth } from '@/lib/auth-utils';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

// POST /api/payment/upload-receipt
// Upload bank transfer receipt
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;
    const { userId: authUserId } = authResult;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const transactionId = formData.get('transactionId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `receipt_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const receiptUrl = `/uploads/receipts/${fileName}`;

    // Update transaction if ID provided – verify ownership
    if (transactionId) {
      const txn = await db.paymentTransaction.findUnique({
        where: { id: transactionId },
        select: { userId: true },
      });
      if (txn && txn.userId !== authUserId) {
        // Delete the uploaded file since the user doesn't own this transaction
        try { fs.unlinkSync(filePath); } catch {}
        return NextResponse.json(
          { error: 'Forbidden – you can only upload receipts for your own transactions' },
          { status: 403 }
        );
      }
      await db.paymentTransaction.update({
        where: { id: transactionId },
        data: { receiptUrl },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, receiptUrl }, { status: 201 });
  } catch (error) {
    console.error('[Receipt Upload] Error:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}

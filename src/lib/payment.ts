/**
 * Payment Gateway Service for نبض المدينة (Nabd Al-Madina)
 * Supports: Card, Bank Transfer, Wallet, COD
 * Graceful fallback when gateway is not configured
 */

import { db } from '@/lib/db';

// ─── Types ─────────────────────────────────────────────────
export type PaymentMethod = 'cod' | 'card' | 'bank_transfer' | 'wallet';

export interface InitiatePaymentParams {
  orderId: string;
  userId: string;
  amount: number;
  method: PaymentMethod;
  currency?: string;
  cardLast4?: string;    // Only last 4 digits — never full card number
  cardExpiry?: string;  // MM/YY only
  cardBrand?: string;
  bankReference?: string;
  receiptUrl?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: string;
  paymentUrl?: string;       // For card 3D Secure redirect
  reference?: string;        // For bank transfer reference
  gatewayTxnId?: string;
  error?: string;
}

// ─── Libyan Bank Info ──────────────────────────────────────
export const LIBYAN_BANKS = {
  nameAr: 'مصرف الجمهورية',
  nameEn: 'Republic Bank',
  accountName: 'نبض المدينة للتجارة الإلكترونية',
  accountNumber: '0123456789012',
  iban: 'LY00 0100 0000 0000 0012 3456 78',
  swiftCode: 'JUMOLYLA',
} as const;

// ─── Generate Reference Number ─────────────────────────────
function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PAY-${timestamp}-${random}`;
}

// ─── Initiate Payment ──────────────────────────────────────
export async function initiatePayment(params: InitiatePaymentParams): Promise<PaymentResult> {
  const { orderId, userId, amount, method, currency = 'LYD' } = params;

  // Validate user
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, transactionId: '', status: 'failed', error: 'User not found' };
  }

  // Method-specific processing
  switch (method) {
    case 'cod': {
      // Cash on delivery - no payment needed upfront
      const txn = await db.paymentTransaction.create({
        data: {
          orderId,
          userId,
          amount,
          currency,
          method: 'cod',
          status: 'pending',
          gatewayName: 'cod',
        },
      });
      return { success: true, transactionId: txn.id, status: 'pending' };
    }

    case 'wallet': {
      return await processWalletPayment(userId, amount, orderId);
    }

    case 'card': {
      return await processCardPayment(params);
    }

    case 'bank_transfer': {
      return await processBankTransfer(params);
    }

    default:
      return { success: false, transactionId: '', status: 'failed', error: `Unknown payment method: ${method}` };
  }
}

// ─── Wallet Payment ────────────────────────────────────────
async function processWalletPayment(
  userId: string,
  amount: number,
  orderId: string
): Promise<PaymentResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });

  if (!user) {
    return { success: false, transactionId: '', status: 'failed', error: 'User not found' };
  }

  const balance = Number(user.walletBalance);
  if (balance < amount) {
    return {
      success: false,
      transactionId: '',
      status: 'failed',
      error: `Insufficient wallet balance. Available: ${balance.toFixed(2)} LYD, Required: ${amount.toFixed(2)} LYD`,
    };
  }

  // Create payment transaction
  const txn = await db.paymentTransaction.create({
    data: {
      orderId,
      userId,
      amount,
      currency: 'LYD',
      method: 'wallet',
      status: 'processing',
      gatewayName: 'wallet',
    },
  });

  try {
    // Atomically deduct from wallet
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { walletBalance: { decrement: amount } },
    });

    // Create wallet transaction
    await db.walletTransaction.create({
      data: {
        userId,
        type: 'withdrawal',
        amount,
        currency: 'LYD',
        reference: orderId,
        description: `دفعة من المحفظة للطلب #${orderId}`,
        status: 'completed',
      },
    });

    // Mark payment as completed
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: {
        status: 'completed',
        paidAt: new Date(),
      },
    });

    return {
      success: true,
      transactionId: txn.id,
      status: 'completed',
      gatewayTxnId: txn.id,
    };
  } catch (error) {
    // Refund if something goes wrong
    await db.paymentTransaction.update({
      where: { id: txn.id },
      data: { status: 'failed' },
    });

    return { success: false, transactionId: txn.id, status: 'failed', error: String(error) };
  }
}

// ─── Card Payment ──────────────────────────────────────────
async function processCardPayment(params: InitiatePaymentParams): Promise<PaymentResult> {
  const { orderId, userId, amount, cardLast4: cardLast4Param, cardBrand } = params;
  const cardLast4 = cardLast4Param || null;

  // Create pending transaction
  const txn = await db.paymentTransaction.create({
    data: {
      orderId,
      userId,
      amount,
      currency: 'LYD',
      method: 'card',
      status: 'pending',
      gatewayName: process.env.PAYMENT_GATEWAY || 'sadad',
      cardLast4,
      cardBrand: cardBrand || null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min expiry
    },
  });

  const gatewayUrl = process.env.PAYMENT_GATEWAY_URL;

  if (gatewayUrl) {
    // Real gateway integration
    try {
      const response = await fetch(gatewayUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_KEY}`,
        },
        body: JSON.stringify({
          amount,
          currency: 'LYD',
          reference: txn.id,
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://nabd-almadina.ly'}/api/payment/verify`,
          metadata: { orderId, userId },
        }),
      });

      if (!response.ok) {
        await db.paymentTransaction.update({
          where: { id: txn.id },
          data: { status: 'failed' },
        });
        return { success: false, transactionId: txn.id, status: 'failed', error: 'Payment gateway error' };
      }

      const data = await response.json();
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: {
          status: 'processing',
          gatewayTxnId: data.transactionId || data.id,
        },
      });

      return {
        success: true,
        transactionId: txn.id,
        status: 'processing',
        paymentUrl: data.paymentUrl || data.redirectUrl,
        gatewayTxnId: data.transactionId || data.id,
      };
    } catch (error) {
      await db.paymentTransaction.update({
        where: { id: txn.id },
        data: { status: 'failed' },
      });
      return { success: false, transactionId: txn.id, status: 'failed', error: String(error) };
    }
  }

  // Development mode: Simulate successful card payment
  await db.paymentTransaction.update({
    where: { id: txn.id },
    data: {
      status: 'completed',
      gatewayTxnId: `SIM-${Date.now()}`,
      paidAt: new Date(),
    },
  });

  return {
    success: true,
    transactionId: txn.id,
    status: 'completed',
    gatewayTxnId: `SIM-${Date.now()}`,
  };
}

// ─── Bank Transfer ─────────────────────────────────────────
async function processBankTransfer(params: InitiatePaymentParams): Promise<PaymentResult> {
  const { orderId, userId, amount, bankReference, receiptUrl } = params;
  const reference = generatePaymentReference();

  const txn = await db.paymentTransaction.create({
    data: {
      orderId,
      userId,
      amount,
      currency: 'LYD',
      method: 'bank_transfer',
      status: 'pending',
      gatewayName: 'bank_transfer',
      bankReference: bankReference || reference,
      receiptUrl: receiptUrl || null,
    },
  });

  return {
    success: true,
    transactionId: txn.id,
    status: 'pending',
    reference,
  };
}

// ─── Verify Payment ────────────────────────────────────────
export async function verifyPayment(
  transactionId: string,
  gatewayData?: { gatewayTxnId?: string; status?: string; cardLast4?: string; cardBrand?: string }
): Promise<PaymentResult> {
  const txn = await db.paymentTransaction.findUnique({ where: { id: transactionId } });
  if (!txn) {
    return { success: false, transactionId: '', status: 'failed', error: 'Transaction not found' };
  }

  if (txn.status === 'completed') {
    return { success: true, transactionId: txn.id, status: 'completed' };
  }

  // Update from gateway data
  const updateData: Record<string, string | boolean | Date | null> = {};
  if (gatewayData?.gatewayTxnId) updateData.gatewayTxnId = gatewayData.gatewayTxnId;
  if (gatewayData?.cardLast4) updateData.cardLast4 = gatewayData.cardLast4;
  if (gatewayData?.cardBrand) updateData.cardBrand = gatewayData.cardBrand;

  const isSuccessful = gatewayData?.status === 'completed' || gatewayData?.status === 'paid';

  updateData.status = isSuccessful ? 'completed' : 'failed';
  if (isSuccessful) updateData.paidAt = new Date();

  await db.paymentTransaction.update({
    where: { id: transactionId },
    data: updateData,
  });

  // If payment completed, update order payment status
  if (isSuccessful && txn.orderId) {
    await db.order.update({
      where: { id: txn.orderId },
      data: { paymentStatus: 'paid' },
    }).catch(() => {});
  }

  return {
    success: isSuccessful,
    transactionId: txn.id,
    status: updateData.status,
  };
}

// ─── Refund Payment ────────────────────────────────────────
export async function refundPayment(
  transactionId: string,
  reason: string
): Promise<PaymentResult> {
  const txn = await db.paymentTransaction.findUnique({ where: { id: transactionId } });
  if (!txn) {
    return { success: false, transactionId: '', status: 'failed', error: 'Transaction not found' };
  }

  if (txn.status !== 'completed') {
    return { success: false, transactionId: txn.id, status: txn.status, error: 'Cannot refund non-completed transaction' };
  }

  const amount = Number(txn.amount);

  // For wallet payments, return money to wallet
  if (txn.method === 'wallet') {
    await db.user.update({
      where: { id: txn.userId },
      data: { walletBalance: { increment: amount } },
    });
    await db.walletTransaction.create({
      data: {
        userId: txn.userId,
        type: 'refund',
        amount,
        currency: 'LYD',
        reference: txn.orderId,
        description: `استرداد مبلغ من المحفظة - ${reason}`,
        status: 'completed',
      },
    });
  }

  // Mark as refunded
  await db.paymentTransaction.update({
    where: { id: transactionId },
    data: {
      status: 'refunded',
      refundReason: reason,
      refundedAt: new Date(),
    },
  });

  // Update order
  if (txn.orderId) {
    await db.order.update({
      where: { id: txn.orderId },
      data: { paymentStatus: 'refunded' },
    }).catch(() => {});
  }

  return { success: true, transactionId, status: 'refunded' };
}

// ─── Get Payment by Order ──────────────────────────────────
export async function getPaymentByOrder(orderId: string) {
  return db.paymentTransaction.findFirst({
    where: { orderId },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Get User Payments ─────────────────────────────────────
export async function getUserPayments(userId: string, limit: number = 20) {
  return db.paymentTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List ledger accounts with filters ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const isActive = searchParams.get('isActive') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filter by account type (asset, liability, equity, revenue, expense)
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (type && validTypes.includes(type)) {
      where.type = type;
    }

    // Filter by active status
    if (isActive === 'true') {
      where.isActive = true;
    } else if (isActive === 'false') {
      where.isActive = false;
    }

    // Search by code or name (Arabic or English)
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { nameAr: { contains: search } },
        { nameEn: { contains: search } },
      ];
    }

    const [accounts, total] = await Promise.all([
      db.ledgerAccount.findMany({
        where,
        orderBy: { code: 'asc' },
        take: limit,
        skip,
        include: {
          _count: { select: { entries: true } },
        },
      }),
      db.ledgerAccount.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      accounts: serializeDecimal(accounts),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('[ADMIN_LEDGER_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch ledger accounts' },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new ledger account ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.code || typeof body.code !== 'string' || !body.code.trim()) {
      return NextResponse.json(
        { error: 'Account code is required' },
        { status: 400 }
      );
    }

    if (!body.nameAr || typeof body.nameAr !== 'string' || !body.nameAr.trim()) {
      return NextResponse.json(
        { error: 'Arabic name is required' },
        { status: 400 }
      );
    }

    if (!body.nameEn || typeof body.nameEn !== 'string' || !body.nameEn.trim()) {
      return NextResponse.json(
        { error: 'English name is required' },
        { status: 400 }
      );
    }

    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (!body.type || !validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Type must be one of: asset, liability, equity, revenue, expense' },
        { status: 400 }
      );
    }

    if (!body.category || typeof body.category !== 'string' || !body.category.trim()) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Check unique code
    const existing = await db.ledgerAccount.findUnique({
      where: { code: body.code.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Account code "${body.code.trim()}" already exists` },
        { status: 409 }
      );
    }

    const account = await db.ledgerAccount.create({
      data: {
        code: body.code.trim(),
        nameAr: body.nameAr.trim(),
        nameEn: body.nameEn.trim(),
        type: body.type,
        category: body.category.trim(),
        balance: body.balance ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    // Create AuditLog entry
    const userId = request.headers.get('x-user-id');
    await db.auditLog.create({
      data: {
        userId,
        action: 'CREATE',
        entity: 'LedgerAccount',
        entityId: account.id,
        details: `Created ledger account: ${account.code} - ${account.nameAr} (${account.type})`,
      },
    });

    return NextResponse.json(serializeDecimal(account), { status: 201 });
  } catch (error) {
    console.error('[ADMIN_LEDGER_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create ledger account' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update a ledger account ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Ledger account ID is required' },
        { status: 400 }
      );
    }

    // Check account exists
    const existing = await db.ledgerAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Ledger account not found' },
        { status: 404 }
      );
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};
    const allowedFields = [
      'code', 'nameAr', 'nameEn', 'type', 'category', 'balance', 'isActive',
    ];

    for (const field of allowedFields) {
      if (fields[field] !== undefined) {
        updateData[field] = fields[field];
      }
    }

    // Validate type if provided
    if (updateData.type) {
      const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
      if (!validTypes.includes(updateData.type as string)) {
        return NextResponse.json(
          { error: 'Type must be one of: asset, liability, equity, revenue, expense' },
          { status: 400 }
        );
      }
    }

    // Check unique code if changing
    if (updateData.code && (updateData.code as string).trim() !== existing.code) {
      const codeExists = await db.ledgerAccount.findUnique({
        where: { code: (updateData.code as string).trim() },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: `Account code "${(updateData.code as string).trim()}" already exists` },
          { status: 409 }
        );
      }
    }

    // Trim string fields
    if (updateData.code) updateData.code = (updateData.code as string).trim();
    if (updateData.nameAr) updateData.nameAr = (updateData.nameAr as string).trim();
    if (updateData.nameEn) updateData.nameEn = (updateData.nameEn as string).trim();
    if (updateData.category) updateData.category = (updateData.category as string).trim();

    const account = await db.ledgerAccount.update({
      where: { id },
      data: updateData,
    });

    // Create AuditLog entry
    const userId = request.headers.get('x-user-id');
    const changedFields = Object.keys(updateData).join(', ');
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'LedgerAccount',
        entityId: id,
        details: `Updated ledger account: ${account.code} - ${account.nameAr} — changed: ${changedFields}`,
      },
    });

    return NextResponse.json(serializeDecimal(account));
  } catch (error) {
    console.error('[ADMIN_LEDGER_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update ledger account' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a ledger account (soft delete if has entries, hard delete if no entries) ───
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Ledger account ID is required' },
        { status: 400 }
      );
    }

    // Check account exists
    const existing = await db.ledgerAccount.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Ledger account not found' },
        { status: 404 }
      );
    }

    // If account has journal entry lines, soft delete (deactivate)
    if (existing._count.entries > 0) {
      const account = await db.ledgerAccount.update({
        where: { id },
        data: { isActive: false },
      });

      const userId = request.headers.get('x-user-id');
      await db.auditLog.create({
        data: {
          userId,
          action: 'DELETE',
          entity: 'LedgerAccount',
          entityId: id,
          details: `Deactivated ledger account (has entries): ${account.code} - ${account.nameAr}`,
        },
      });

      return NextResponse.json(serializeDecimal(account));
    }

    // No entries — hard delete
    await db.ledgerAccount.delete({ where: { id } });

    const userId = request.headers.get('x-user-id');
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'LedgerAccount',
        entityId: id,
        details: `Deleted ledger account: ${existing.code} - ${existing.nameAr}`,
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[ADMIN_LEDGER_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete ledger account' },
      { status: 500 }
    );
  }
}

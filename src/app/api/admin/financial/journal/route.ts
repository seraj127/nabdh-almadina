import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

/**
 * Auto-generate entry number in format: JE-YYYYMMDD-XXXX
 * Finds the highest existing number for today and increments.
 */
async function generateEntryNumber(): Promise<string> {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePrefix = `JE-${y}${m}${d}`;

  // Find entries with today's prefix to determine the next sequence
  const latest = await db.journalEntry.findFirst({
    where: { entryNumber: { startsWith: datePrefix } },
    orderBy: { entryNumber: 'desc' },
    select: { entryNumber: true },
  });

  let seq = 1;
  if (latest) {
    const parts = latest.entryNumber.split('-');
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `${datePrefix}-${String(seq).padStart(4, '0')}`;
}

// ─── GET: List journal entries with filters ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Filter by status (draft, posted, voided)
    const validStatuses = ['draft', 'posted', 'voided'];
    if (status && validStatuses.includes(status)) {
      where.status = status;
    }

    // Search by entryNumber or description
    if (search) {
      where.OR = [
        { entryNumber: { contains: search } },
        { descriptionAr: { contains: search } },
        { descriptionEn: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const [entries, total] = await Promise.all([
      db.journalEntry.findMany({
        where,
        orderBy: { entryDate: 'desc' },
        take: limit,
        skip,
        include: {
          lines: {
            include: {
              account: {
                select: {
                  id: true,
                  code: true,
                  nameAr: true,
                  nameEn: true,
                  type: true,
                },
              },
            },
            orderBy: { id: 'asc' },
          },
        },
      }),
      db.journalEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      entries: serializeDecimal(entries),
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
    console.error('[ADMIN_JOURNAL_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 }
    );
  }
}

// ─── POST: Create a new journal entry ───
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate: must have at least one description
    const hasArDesc = body.descriptionAr && typeof body.descriptionAr === 'string' && body.descriptionAr.trim();
    const hasEnDesc = body.descriptionEn && typeof body.descriptionEn === 'string' && body.descriptionEn.trim();
    if (!hasArDesc && !hasEnDesc) {
      return NextResponse.json(
        { error: 'At least one description (Arabic or English) is required' },
        { status: 400 }
      );
    }

    // Validate entryDate
    if (!body.entryDate) {
      return NextResponse.json(
        { error: 'Entry date is required' },
        { status: 400 }
      );
    }

    const entryDate = new Date(body.entryDate);
    if (isNaN(entryDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid entry date' },
        { status: 400 }
      );
    }

    // Validate lines
    if (!Array.isArray(body.lines) || body.lines.length === 0) {
      return NextResponse.json(
        { error: 'At least one journal entry line is required' },
        { status: 400 }
      );
    }

    // Validate each line
    for (let i = 0; i < body.lines.length; i++) {
      const line = body.lines[i];
      if (!line.accountId || typeof line.accountId !== 'string') {
        return NextResponse.json(
          { error: `Line ${i + 1}: accountId is required` },
          { status: 400 }
        );
      }

      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;

      if (debit < 0 || credit < 0) {
        return NextResponse.json(
          { error: `Line ${i + 1}: debit and credit must be non-negative` },
          { status: 400 }
        );
      }

      if (debit > 0 && credit > 0) {
        return NextResponse.json(
          { error: `Line ${i + 1}: a line cannot have both debit and credit` },
          { status: 400 }
        );
      }

      if (debit === 0 && credit === 0) {
        return NextResponse.json(
          { error: `Line ${i + 1}: a line must have either debit or credit` },
          { status: 400 }
        );
      }
    }

    // Validate: total debits must equal total credits
    const totalDebits = body.lines.reduce(
      (sum: number, line: { debit?: number | string; credit?: number | string }) => sum + (Number(line.debit) || 0),
      0
    );
    const totalCredits = body.lines.reduce(
      (sum: number, line: { debit?: number | string; credit?: number | string }) => sum + (Number(line.credit) || 0),
      0
    );

    // Use a small epsilon for floating point comparison
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
      return NextResponse.json(
        {
          error: `Total debits (${totalDebits.toFixed(2)}) must equal total credits (${totalCredits.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Verify all account IDs exist
    const accountIds = body.lines.map((line: { accountId: string }) => line.accountId);
    const accounts = await db.ledgerAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true },
    });

    const foundIds = new Set(accounts.map((a) => a.id));
    const missingIds = accountIds.filter((id: string) => !foundIds.has(id));
    if (missingIds.length > 0) {
      return NextResponse.json(
        { error: `Account(s) not found: ${missingIds.join(', ')}` },
        { status: 400 }
      );
    }

    // Auto-generate entry number
    const entryNumber = await generateEntryNumber();

    // Get admin user ID from header if available
    const createdBy = request.headers.get('x-user-id') || null;

    // Create the journal entry with all lines in a transaction
    const entry = await db.journalEntry.create({
      data: {
        entryNumber,
        descriptionAr: hasArDesc ? body.descriptionAr.trim() : null,
        descriptionEn: hasEnDesc ? body.descriptionEn.trim() : null,
        reference: body.reference?.trim() || null,
        entryDate,
        status: 'draft',
        createdBy,
        lines: {
          create: body.lines.map((line: { accountId: string; debit?: number | string; credit?: number | string; description?: string }) => ({
            accountId: line.accountId,
            debit: Number(line.debit) || 0,
            credit: Number(line.credit) || 0,
            description: line.description?.trim() || null,
          })),
        },
      },
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
                type: true,
              },
            },
          },
        },
      },
    });

    // Create AuditLog entry
    await db.auditLog.create({
      data: {
        userId: createdBy,
        action: 'CREATE',
        entity: 'JournalEntry',
        entityId: entry.id,
        details: `Created journal entry: ${entryNumber} — ${totalDebits.toFixed(2)} LYD (${body.lines.length} lines)`,
      },
    });

    return NextResponse.json(serializeDecimal(entry), { status: 201 });
  } catch (error) {
    console.error('[ADMIN_JOURNAL_POST]', error);
    return NextResponse.json(
      { error: 'Failed to create journal entry' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update a journal entry ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }

    // Check entry exists
    const existing = await db.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    // Build update data from allowed fields
    const updateData: Record<string, unknown> = {};

    // Handle status transitions
    if (fields.status !== undefined) {
      const newStatus = fields.status;
      const validStatuses = ['draft', 'posted', 'voided'];

      if (!validStatuses.includes(newStatus)) {
        return NextResponse.json(
          { error: 'Status must be one of: draft, posted, voided' },
          { status: 400 }
        );
      }

      // Validate status transitions
      const currentStatus = existing.status;

      // draft → posted: allowed
      // posted → voided: allowed
      // All other transitions are not allowed
      if (currentStatus === 'draft' && newStatus === 'posted') {
        updateData.status = 'posted';
      } else if (currentStatus === 'posted' && newStatus === 'voided') {
        updateData.status = 'voided';
      } else if (currentStatus === newStatus) {
        // No change — ignore
      } else {
        const allowed = currentStatus === 'draft'
          ? '"posted"'
          : currentStatus === 'posted'
          ? '"voided"'
          : 'none (entry is voided)';
        return NextResponse.json(
          { error: `Cannot change status from "${currentStatus}" to "${newStatus}". Allowed transition: ${allowed}` },
          { status: 400 }
        );
      }
    }

    // Handle description updates
    if (fields.descriptionAr !== undefined) {
      updateData.descriptionAr = typeof fields.descriptionAr === 'string' ? fields.descriptionAr.trim() : null;
    }
    if (fields.descriptionEn !== undefined) {
      updateData.descriptionEn = typeof fields.descriptionEn === 'string' ? fields.descriptionEn.trim() : null;
    }

    // Handle reference update
    if (fields.reference !== undefined) {
      updateData.reference = typeof fields.reference === 'string' ? fields.reference.trim() : null;
    }

    // If status is changing to "posted", update ledger account balances
    if (updateData.status === 'posted') {
      // Use a Prisma transaction to ensure atomicity
      const result = await db.$transaction(async (tx) => {
        // Update the journal entry
        const entry = await tx.journalEntry.update({
          where: { id },
          data: updateData,
          include: {
            lines: {
              include: {
                account: {
                  select: {
                    id: true,
                    code: true,
                    nameAr: true,
                    nameEn: true,
                    type: true,
                  },
                },
              },
            },
          },
        });

        // Update each account's balance
        // Debit increases asset/expense accounts, decreases liability/equity/revenue
        // Credit decreases asset/expense accounts, increases liability/equity/revenue
        for (const line of existing.lines) {
          const account = await tx.ledgerAccount.findUnique({
            where: { id: line.accountId },
          });

          if (!account) continue;

          const debitAmount = Number(line.debit);
          const creditAmount = Number(line.credit);

          // For asset and expense: debit increases balance, credit decreases
          // For liability, equity, revenue: credit increases balance, debit decreases
          let balanceChange = 0;
          if (account.type === 'asset' || account.type === 'expense') {
            balanceChange = debitAmount - creditAmount;
          } else {
            // liability, equity, revenue
            balanceChange = creditAmount - debitAmount;
          }

          await tx.ledgerAccount.update({
            where: { id: line.accountId },
            data: { balance: { increment: balanceChange } },
          });
        }

        return entry;
      });

      // Create AuditLog entry
      const userId = request.headers.get('x-user-id');
      await db.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'JournalEntry',
          entityId: id,
          details: `Posted journal entry: ${existing.entryNumber} — balances updated for ${existing.lines.length} accounts`,
        },
      });

      return NextResponse.json(serializeDecimal(result));
    }

    // If status is changing to "voided", reverse the ledger account balances
    if (updateData.status === 'voided') {
      const result = await db.$transaction(async (tx) => {
        // Update the journal entry
        const entry = await tx.journalEntry.update({
          where: { id },
          data: updateData,
          include: {
            lines: {
              include: {
                account: {
                  select: {
                    id: true,
                    code: true,
                    nameAr: true,
                    nameEn: true,
                    type: true,
                  },
                },
              },
            },
          },
        });

        // Reverse each account's balance (opposite of posting)
        for (const line of existing.lines) {
          const account = await tx.ledgerAccount.findUnique({
            where: { id: line.accountId },
          });

          if (!account) continue;

          const debitAmount = Number(line.debit);
          const creditAmount = Number(line.credit);

          // Reverse the effect: opposite of posting
          let balanceChange = 0;
          if (account.type === 'asset' || account.type === 'expense') {
            balanceChange = -(debitAmount - creditAmount); // reverse
          } else {
            balanceChange = -(creditAmount - debitAmount); // reverse
          }

          await tx.ledgerAccount.update({
            where: { id: line.accountId },
            data: { balance: { increment: balanceChange } },
          });
        }

        return entry;
      });

      // Create AuditLog entry
      const userId = request.headers.get('x-user-id');
      await db.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entity: 'JournalEntry',
          entityId: id,
          details: `Voided journal entry: ${existing.entryNumber} — balances reversed for ${existing.lines.length} accounts`,
        },
      });

      return NextResponse.json(serializeDecimal(result));
    }

    // Simple update (no status change to posted/voided)
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const entry = await db.journalEntry.update({
      where: { id },
      data: updateData,
      include: {
        lines: {
          include: {
            account: {
              select: {
                id: true,
                code: true,
                nameAr: true,
                nameEn: true,
                type: true,
              },
            },
          },
        },
      },
    });

    // Create AuditLog entry
    const userId = request.headers.get('x-user-id');
    const changedFields = Object.keys(updateData).join(', ');
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE',
        entity: 'JournalEntry',
        entityId: id,
        details: `Updated journal entry: ${existing.entryNumber} — changed: ${changedFields}`,
      },
    });

    return NextResponse.json(serializeDecimal(entry));
  } catch (error) {
    console.error('[ADMIN_JOURNAL_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update journal entry' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Delete a journal entry (only draft entries can be deleted) ───
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Journal entry ID is required' },
        { status: 400 }
      );
    }

    // Check entry exists
    const existing = await db.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    // Only draft entries can be deleted
    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft entries can be deleted. Void posted entries instead.' },
        { status: 400 }
      );
    }

    // Delete entry (lines will cascade)
    await db.journalEntry.delete({ where: { id } });

    const userId = request.headers.get('x-user-id');
    await db.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entity: 'JournalEntry',
        entityId: id,
        details: `Deleted draft journal entry: ${existing.entryNumber}`,
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[ADMIN_JOURNAL_DELETE]', error);
    return NextResponse.json(
      { error: 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}

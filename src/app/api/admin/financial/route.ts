import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    // Fetch all active ledger accounts
    const accounts = await db.ledgerAccount.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
    });

    // Calculate totalRevenue = sum of revenue account balances
    const totalRevenue = accounts
      .filter((a) => a.type === 'revenue')
      .reduce((sum, a) => sum + Number(a.balance), 0);

    // Calculate totalExpenses = sum of expense account balances
    const totalExpenses = accounts
      .filter((a) => a.type === 'expense')
      .reduce((sum, a) => sum + Number(a.balance), 0);

    // Net income
    const netIncome = totalRevenue - totalExpenses;

    // Fetch recent 10 posted journal entries with their lines
    const recentEntries = await db.journalEntry.findMany({
      where: { status: 'posted' },
      orderBy: { entryDate: 'desc' },
      take: 10,
      include: {
        lines: {
          include: {
            account: {
              select: {
                code: true,
                nameAr: true,
                nameEn: true,
              },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    // Map accounts to the expected shape
    const mappedAccounts = accounts.map((a) => ({
      id: a.id,
      code: a.code,
      nameAr: a.nameAr,
      nameEn: a.nameEn,
      type: a.type,
      balance: Number(a.balance),
    }));

    // Map recent entries to the expected shape
    const mappedEntries = recentEntries.map((entry) => ({
      id: entry.id,
      entryNumber: entry.entryNumber,
      descriptionAr: entry.descriptionAr ?? '',
      descriptionEn: entry.descriptionEn ?? '',
      reference: entry.reference,
      entryDate: entry.entryDate.toISOString(),
      lines: entry.lines.map((line) => ({
        id: line.id,
        accountCode: line.account.code,
        accountNameAr: line.account.nameAr,
        accountNameEn: line.account.nameEn,
        debit: Number(line.debit),
        credit: Number(line.credit),
      })),
    }));

    const result = {
      totalRevenue,
      totalExpenses,
      netIncome,
      accounts: mappedAccounts,
      recentEntries: mappedEntries,
    };

    return NextResponse.json(serializeDecimal(result));
  } catch (error) {
    console.error('[ADMIN_FINANCIAL_API_ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial data' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

// ─── GET: List all feature flags ordered by key ───
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const flags = await db.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({
      flags: flags.map((flag) => ({
        id: flag.id,
        key: flag.key,
        value: flag.value,
        description: flag.description,
        updatedAt: flag.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[ADMIN_FEATURE_FLAGS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Upsert a feature flag by key ───
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || typeof value !== 'boolean') {
      return NextResponse.json(
        { error: 'key (string) and value (boolean) are required' },
        { status: 400 }
      );
    }

    const flag = await db.featureFlag.upsert({
      where: { key },
      update: {
        value,
        ...(description !== undefined ? { description } : {}),
      },
      create: {
        key,
        value,
        description: description ?? null,
      },
    });

    return NextResponse.json({
      flag: {
        id: flag.id,
        key: flag.key,
        value: flag.value,
        description: flag.description,
        updatedAt: flag.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[ADMIN_FEATURE_FLAGS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}

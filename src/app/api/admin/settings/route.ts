import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-utils';
import { verifySessionToken } from '@/lib/jwt-session';

export const dynamic = "force-dynamic";

// ─── GET: Retrieve all store settings as key-value map ────
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const settings = await db.storeSetting.findMany();

    // Convert array of {key, value} to a flat object, parsing JSON values
    const map: Record<string, unknown> = {};
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_GET]', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Upsert multiple settings at once ──────────────
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, unknown> };

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'settings object is required' },
        { status: 400 }
      );
    }

    // Extract userId from JWT token for audit logging
    const token = request.cookies.get('admin_session')?.value;
    let userId: string | undefined;
    if (token) {
      const payload = await verifySessionToken(token);
      if (payload) {
        userId = payload.userId;
      }
    }

    const keys = Object.keys(settings);

    // Upsert each key-value pair
    const operations = keys.map((key) =>
      db.storeSetting.upsert({
        where: { key },
        create: {
          key,
          value: JSON.stringify(settings[key]),
        },
        update: {
          value: JSON.stringify(settings[key]),
        },
      })
    );

    await Promise.all(operations);

    // Create AuditLog entry
    await db.auditLog.create({
      data: {
        userId,
        action: 'UPDATE_SETTINGS',
        entity: 'StoreSetting',
        details: `Updated store settings: ${keys.join(', ')}`,
      },
    });

    // Return the updated settings map
    const allSettings = await db.storeSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const s of allSettings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error('[ADMIN_SETTINGS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

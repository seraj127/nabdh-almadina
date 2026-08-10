import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;
  try {
    const { searchParams } = request.nextUrl;

    // Parse query params
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 10));
    const search = searchParams.get('search')?.trim() || undefined;
    const role = searchParams.get('role')?.trim() || undefined;

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { email: { contains: search } },
      ];
    }

    // Fetch paginated users with order count
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          loyaltyTier: true,
          loyaltyPoints: true,
          walletBalance: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    // Fetch summary counts by role
    const [totalCustomers, totalAdmins, totalVendors, totalDrivers] =
      await Promise.all([
        db.user.count({ where: { role: 'customer' } }),
        db.user.count({ where: { role: 'admin' } }),
        db.user.count({ where: { role: 'vendor' } }),
        db.user.count({ where: { role: 'driver' } }),
      ]);

    const totalPages = Math.ceil(total / limit);

    // Serialize Decimal fields before returning
    const serializedUsers = serializeDecimal(users);

    return NextResponse.json({
      users: serializedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      summary: {
        totalCustomers,
        totalAdmins,
        totalVendors,
        totalDrivers,
      },
    });
  } catch (error) {
    console.error('[ADMIN_USERS_API]', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users — Update a user
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, name, email, isActive, role, loyaltyTier, walletBalance } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update data — only include fields that are provided
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (isActive !== undefined) data.isActive = isActive;
    if (role !== undefined) data.role = role;
    if (loyaltyTier !== undefined) data.loyaltyTier = loyaltyTier;
    if (walletBalance !== undefined) data.walletBalance = walletBalance;

    const user = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        loyaltyTier: true,
        loyaltyPoints: true,
        walletBalance: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: serializeDecimal(user) });
  } catch (error) {
    console.error('[ADMIN_USERS_PATCH]', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

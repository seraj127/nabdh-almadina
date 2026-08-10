import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { requireAdmin } from '@/lib/auth-utils';
import { verifySessionToken } from '@/lib/jwt-session';

export const dynamic = "force-dynamic";

const VALID_VENDOR_TYPES = ['RETAILER', 'BRAND_OFFICIAL', 'LOCAL_ARTISAN', 'SERVICE_PROVIDER'];

/** Extract userId from JWT cookie or x-user-id header for audit logging */
async function getAuthUserId(request: NextRequest): Promise<string | undefined> {
  const headerId = request.headers.get('x-user-id');
  if (headerId) return headerId;
  const token = request.cookies.get('admin_session')?.value;
  if (token) {
    const payload = await verifySessionToken(token);
    if (payload) return payload.userId;
  }
  return undefined;
}

// ─── GET: Get single vendor with full details ───
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;

    const vendor = await db.vendor.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
            price: true,
            mainImage: true,
            isActive: true,
            stock: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        payouts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get product count
    const productCount = await db.product.count({
      where: { vendorId: id },
    });

    // Get total sales value (sum of order items for this vendor's products)
    const totalSalesResult = await db.orderItem.aggregate({
      _sum: { total: true },
      where: {
        product: { vendorId: id },
        order: { status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] } },
      },
    });

    return NextResponse.json(
      serializeDecimal({
        vendor,
        productCount,
        totalSalesValue: totalSalesResult._sum.total || 0,
      })
    );
  } catch (error) {
    console.error('[ADMIN_VENDORS_GET_ID]', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// ─── PATCH: Update a vendor (ID from URL) ───
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const { nameAr, nameEn, type, commission, phone, email, logo, descriptionAr, descriptionEn, bankInfo, isActive, isVerified } = body;

    // Validate vendor exists
    const existingVendor = await db.vendor.findUnique({ where: { id } });
    if (!existingVendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (nameAr !== undefined) updateData.nameAr = String(nameAr).trim();
    if (nameEn !== undefined) updateData.nameEn = String(nameEn).trim();
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;
    if (logo !== undefined) updateData.logo = logo || null;
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr || null;
    if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn || null;
    if (bankInfo !== undefined) updateData.bankInfo = bankInfo || null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isVerified !== undefined) updateData.isVerified = Boolean(isVerified);

    // Validate type if provided
    if (type !== undefined) {
      if (!VALID_VENDOR_TYPES.includes(type)) {
        return NextResponse.json(
          { error: `Invalid vendor type. Must be one of: ${VALID_VENDOR_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.type = type;
    }

    // Validate commission if provided
    if (commission !== undefined) {
      const commValue = Number(commission);
      if (isNaN(commValue) || commValue < 0 || commValue > 100) {
        return NextResponse.json(
          { error: 'Commission must be between 0 and 100' },
          { status: 400 }
        );
      }
      updateData.commission = commValue;
    }

    // Check if isVerified is being set to true for the first time
    if (isVerified === true && !existingVendor.isVerified) {
      console.log(`[VENDOR_VERIFY] Vendor ${id} (${existingVendor.nameAr}) has been verified for the first time. Notification should be triggered.`);
    }

    // Update vendor
    const updatedVendor = await db.vendor.update({
      where: { id },
      data: updateData,
    });

    // Create audit log
    const changedFields = Object.keys(updateData).join(', ');
    await db.auditLog.create({
      data: {
        userId: await getAuthUserId(request),
        action: 'UPDATE_VENDOR',
        entity: 'Vendor',
        entityId: id,
        details: `Updated vendor fields: ${changedFields}`,
      },
    });

    return NextResponse.json(
      serializeDecimal({ vendor: updatedVendor })
    );
  } catch (error) {
    console.error('[ADMIN_VENDORS_PATCH_ID]', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

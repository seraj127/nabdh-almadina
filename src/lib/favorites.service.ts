import { db } from '@/lib/db';

/**
 * Favorites service — business logic for the favorites feature.
 * Kept separate from the HTTP layer (BE-001) so it is testable without a router.
 */

export interface FavoriteRecord {
  id: string;
  productId: string;
  createdAt: Date;
}

/** List the user's favorites, optionally with full product details. */
export async function listFavorites(userId: string, includeProducts: boolean): Promise<FavoriteRecord[]> {
  const includeObj = includeProducts
    ? {
        product: {
          include: {
            category: {
              select: { id: true, nameAr: true, nameEn: true, slug: true, icon: true },
            },
          },
        },
      }
    : undefined;

  return (await db.favoriteItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: includeObj,
  })) as unknown as FavoriteRecord[];
}

/** Add a product to favorites. Idempotent — repeating the request is a success, never deletes. */
export async function addFavorite(userId: string, productId: string): Promise<{ isFavorite: true; productId: string }> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new FavoriteError('المنتج غير موجود', 404);

  await db.favoriteItem.createMany({
    data: [{ userId, productId }],
    skipDuplicates: true,
  });

  return { isFavorite: true, productId };
}

/** Replace the user's favorites with the given list (full sync). */
export async function replaceFavorites(userId: string, productIds: string[]): Promise<string[]> {
  const incoming = Array.from(new Set(productIds.filter((id): id is string => typeof id === 'string' && id.length > 0)));

  const [existing, products] = await Promise.all([
    db.favoriteItem.findMany({ where: { userId }, select: { id: true, productId: true } }),
    incoming.length > 0
      ? db.product.findMany({ where: { id: { in: incoming }, isActive: true }, select: { id: true } })
      : Promise.resolve([]),
  ]);

  const validIds = new Set(products.map((p) => p.id));
  const effectiveIds = incoming.filter((id) => validIds.has(id));
  const effectiveSet = new Set(effectiveIds);

  const toRemove = existing.filter((e) => !effectiveSet.has(e.productId));
  if (toRemove.length > 0) {
    await db.favoriteItem.deleteMany({
      where: { userId, productId: { in: toRemove.map((e) => e.productId) } },
    });
  }

  const existingIds = new Set(existing.map((e) => e.productId));
  const toAdd = effectiveIds.filter((id) => !existingIds.has(id));
  if (toAdd.length > 0) {
    await db.favoriteItem.createMany({
      data: toAdd.map((productId) => ({ userId, productId })),
    });
  }

  const favorites = await db.favoriteItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { productId: true },
  });
  return favorites.map((f) => f.productId);
}

/** Remove a product from favorites. Idempotent. */
export async function removeFavorite(userId: string, productId: string): Promise<{ deleted: number }> {
  const result = await db.favoriteItem.deleteMany({
    where: { userId, productId },
  });
  return { deleted: result.count };
}

/** Domain error carrying an HTTP status for the route layer. */
export class FavoriteError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'FavoriteError';
  }
}

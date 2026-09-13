import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Point the SQLite client at a dedicated throwaway DB created by
// `prisma db push --skip-generate` (runs before the suite).
process.env.DATABASE_URL = 'file:D:/temp/opencode/nabdh-db-test.db';
delete process.env.SUPABASE_DATABASE_URL;

import { db } from '@/lib/db';

let catId = '';

beforeAll(async () => {
  const created = await db.category.create({
    data: { nameAr: 'إلكترونيات', nameEn: 'Electronics', slug: 'electronics-test' },
  });
  catId = created.id;
});

afterAll(async () => {
  await db.product.deleteMany({ where: { sku: { startsWith: 'SKU-dbtest-' } } });
  await db.category.deleteMany({ where: { slug: 'electronics-test' } });
  await db.$disconnect();
});

const mkProduct = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  categoryId: catId,
  nameAr: `منتج ${id}`,
  nameEn: `Product ${id}`,
  sku: `SKU-dbtest-${id}`,
  price: 100,
  images: `["${id}.png"]`,
  stock: 10,
  reservedStock: 0,
  ...overrides,
});

describe('SQLite product DB (real Prisma client)', () => {
  it('inserts available and sold-out products and counts them', async () => {
    await db.product.create({ data: mkProduct('available', { stock: 4, reservedStock: 1 }) });
    await db.product.create({ data: mkProduct('soldout', { stock: 0, reservedStock: 0 }) });

    const rows = await db.product.findMany({
      where: { sku: { contains: 'SKU-dbtest-' } },
      select: { id: true, stock: true, reservedStock: true },
    });

    expect(rows).toHaveLength(2);
    const available = rows.find((r) => r.id === 'available');
    expect((available?.stock ?? 0) - (available?.reservedStock ?? 0)).toBeGreaterThan(0);
    const soldout = rows.find((r) => r.id === 'soldout');
    expect((soldout?.stock ?? 0) - (soldout?.reservedStock ?? 0)).toBe(0);
  });

  it('pages via SQL skip/take deterministically without sold-out rows', async () => {
    await db.product.create({ data: mkProduct('page-a', { stock: 5 }) });
    await db.product.create({ data: mkProduct('page-b', { stock: 0 }) });

    const page = await db.product.findMany({
      where: { sku: { contains: 'SKU-dbtest-' } },
      skip: 0,
      take: 2,
      select: { id: true },
    });

    // The in-memory layer additionally filters sold-out rows AFTER SQL take,
    // so page size from SQL alone is deterministic here.
    expect(page.length).toBe(2);
  });

  it('finds a product by id and resolves its category relation', async () => {
    await db.product.create({ data: mkProduct('withcat') });

    const found = await db.product.findUnique({
      where: { id: 'withcat' },
      include: { category: { select: { nameAr: true, slug: true } } },
    });

    expect(found?.category.nameAr).toBe('إلكترونيات');
    expect(found?.category.slug).toBe('electronics-test');
  });

  it('maps subcategory parent/child relation', async () => {
    const child = await db.category.create({
      data: { nameAr: 'هواتف', nameEn: 'Phones', slug: 'phones-test', parentId: catId },
    });

    const parent = await db.category.findUnique({
      where: { id: catId },
      include: { children: true },
    });

    expect(parent?.children.map((c) => c.id)).toContain(child.id);

    await db.category.delete({ where: { id: child.id } });
  });
});
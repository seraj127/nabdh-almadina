/**
 * Recursively converts Prisma Decimal fields to plain numbers
 * so they can be safely serialized to JSON in API responses.
 *
 * IMPORTANT: Must be called BEFORE NextResponse.json() because
 * JSON.stringify converts Prisma Decimal to strings by default.
 *
 * Prisma Decimal objects (from decimal.js) have characteristic properties:
 * - `d` (digits array), `e` (exponent), `s` (sign)
 * - Methods like `toNumber()`, `toString()`, `toFixed()`, etc.
 */

function isPrismaDecimal(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value !== 'object') return false;
  if (value instanceof Date) return false;
  if (Array.isArray(value)) return false;

  const obj = value as Record<string, unknown>;
  return (
    'd' in obj &&
    'e' in obj &&
    's' in obj &&
    Array.isArray(obj.d) &&
    typeof obj.e === 'number' &&
    typeof obj.s === 'number'
  );
}

function convertValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;

  // Prisma Decimal → number
  if (isPrismaDecimal(value)) {
    return Number((value as { toNumber: () => number }).toNumber());
  }

  // Date → keep as-is
  if (value instanceof Date) return value;

  // Array → recurse
  if (Array.isArray(value)) {
    return value.map(convertValue);
  }

  // Plain object → recurse
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    result[key] = convertValue((value as Record<string, unknown>)[key]);
  }
  return result;
}

export function serializeDecimal<T>(obj: T): T {
  return convertValue(obj) as T;
}

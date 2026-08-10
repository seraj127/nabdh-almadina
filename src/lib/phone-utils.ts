/**
 * Libyan phone number utilities.
 * Safe for both client and server code (no DB/API imports).
 */

/**
 * Normalize Libyan phone numbers to +2189XXXXXXXX format.
 * Handles spaces, dashes, and common formats (+218, 0-prefix, bare 9...).
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+218')) return cleaned;
  if (cleaned.startsWith('0')) return '+218' + cleaned.substring(1);
  if (/^9\d{8}$/.test(cleaned)) return '+218' + cleaned;
  return cleaned;
}

/**
 * Generate all common Libyan phone format variants from a normalized phone number.
 * Returns [+218911234567, 0911234567, 911234567] for DB search.
 */
export function getPhoneVariants(phone: string): string[] {
  const normalized = normalizePhone(phone);
  const variants = [normalized];
  if (normalized.startsWith('+218')) {
    variants.push('0' + normalized.substring(4));  // +218911234567 → 0911234567
    variants.push(normalized.substring(4));           // +218911234567 → 911234567
  }
  return variants;
}

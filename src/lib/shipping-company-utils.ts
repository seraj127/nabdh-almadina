import { serializeDecimal } from '@/lib/serialize';

/**
 * Serializes a shipping company for an API response without exposing carrier
 * credentials. API keys and secrets are write-only configuration values.
 */
export function serializePublicShippingCompany<T>(company: T): Omit<T, 'apiKey' | 'apiSecret'> {
  const serialized = serializeDecimal(company) as T & { apiKey?: unknown; apiSecret?: unknown };
  delete serialized.apiKey;
  delete serialized.apiSecret;
  return serialized as Omit<T, 'apiKey' | 'apiSecret'>;
}

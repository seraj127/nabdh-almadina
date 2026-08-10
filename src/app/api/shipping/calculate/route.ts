import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializeDecimal } from '@/lib/serialize';
import { getDeliveryFee, getEstimatedDays, getRegionForCity } from '@/lib/delivery-data';
import { getCarrierRates, type RateCalcParams } from '@/lib/shipping-integration';

export const dynamic = "force-dynamic";

// ─── CORS Headers ─────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ─── OPTIONS ──────────────────────────────────────────────
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ─── Shipping result type ─────────────────────────────────
interface ShippingResult {
  companyId: string;
  companyNameAr: string;
  companyNameEn: string;
  fee: number;
  estimatedDays: number;
  trackingSupported: boolean;
  matchType: 'zone-area' | 'zone-city' | 'coverage-all' | 'fallback' | 'carrier-api';
}

// ─── GET: Auto-calculate shipping fee ─────────────────────
// Enhanced with carrier adapter live rate calculation for integrated carriers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region'); // regionId like 'central', 'western', etc.
    const city = searchParams.get('city');
    const area = searchParams.get('area'); // optional
    const weight = parseFloat(searchParams.get('weight') || '1');
    const codAmount = searchParams.get('codAmount') ? parseFloat(searchParams.get('codAmount')!) : undefined;
    const useCarrierApi = searchParams.get('carrierApi') !== 'false'; // default true

    // Validate required params
    if (!region || !city) {
      return NextResponse.json(
        { error: 'Missing required query params: region, city' },
        { status: 400, headers: corsHeaders }
      );
    }

    const candidates: ShippingResult[] = [];

    // ─── Phase 1: Get rates from integrated carriers via API ─────
    if (useCarrierApi) {
      try {
        const carrierRates = await getCarrierRates({
          originCity: 'طرابلس', // Default origin
          destinationCity: city,
          destinationArea: area || undefined,
          weight,
          codAmount,
        });

        for (const rate of carrierRates) {
          if (rate.available) {
            candidates.push({
              companyId: rate.carrierId,
              companyNameAr: rate.carrierNameAr,
              companyNameEn: rate.carrierNameEn,
              fee: rate.fee,
              estimatedDays: rate.estimatedDays,
              trackingSupported: true, // Integrated carriers support tracking
              matchType: 'carrier-api',
            });
          }
        }
      } catch (error) {
        console.error('[shipping/calculate] Carrier API rates failed, falling back to DB:', error);
      }
    }

    // ─── Phase 2: Get rates from ShippingCompany (zone-based) ───
    const companies = await db.shippingCompany.findMany({
      where: { isActive: true },
      include: {
        coverageZones: {
          where: { isActive: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (const company of companies) {
      const serialized = serializeDecimal(company);
      const baseFee = Number(serialized.baseFee);
      const avgDeliveryDays = Number(serialized.avgDeliveryDays);
      const trackingSupported = !!serialized.trackingUrl;

      let matchType: ShippingResult['matchType'] | null = null;
      let fee = baseFee;
      let estimatedDays = avgDeliveryDays;

      // Check for zone-specific matches
      if (company.coverageType === 'all') {
        // Company delivers everywhere
        matchType = 'coverage-all';
        // Still check if there's a zone-specific override
        const zoneMatch = findZoneMatch(company.coverageZones, city, area);
        if (zoneMatch) {
          const serializedZone = serializeDecimal(zoneMatch);
          if (Number(serializedZone.fee) > 0) {
            fee = Number(serializedZone.fee);
          }
          estimatedDays = Number(serializedZone.estimatedDays) || avgDeliveryDays;
          if (zoneMatch.areaName && zoneMatch.areaName === area) {
            matchType = 'zone-area';
          } else {
            matchType = 'zone-city';
          }
        }
      } else {
        // Company has specific coverage — must match a zone
        const zoneMatch = findZoneMatch(company.coverageZones, city, area);
        if (!zoneMatch) {
          continue;
        }

        const serializedZone = serializeDecimal(zoneMatch);
        if (Number(serializedZone.fee) > 0) {
          fee = Number(serializedZone.fee);
        }
        estimatedDays = Number(serializedZone.estimatedDays) || avgDeliveryDays;

        if (zoneMatch.areaName && zoneMatch.areaName === area) {
          matchType = 'zone-area';
        } else {
          matchType = 'zone-city';
        }
      }

      if (!matchType) continue;

      // Only add if not already covered by a carrier API result for the same company
      const alreadyCovered = candidates.some(
        (c) => c.companyId === company.id
      );
      if (!alreadyCovered) {
        candidates.push({
          companyId: company.id,
          companyNameAr: company.nameAr,
          companyNameEn: company.nameEn,
          fee,
          estimatedDays,
          trackingSupported,
          matchType,
        });
      }
    }

    // ─── Phase 3: Select best match ─────────────────────────────
    const priorityOrder: Record<ShippingResult['matchType'], number> = {
      'zone-area': 1,
      'zone-city': 2,
      'carrier-api': 2,
      'coverage-all': 3,
      'fallback': 4,
    };

    // Sort by match priority, then by lowest fee
    candidates.sort((a, b) => {
      const priorityDiff = priorityOrder[a.matchType] - priorityOrder[b.matchType];
      if (priorityDiff !== 0) return priorityDiff;
      return a.fee - b.fee;
    });

    // ─── Phase 4: Return best match or fallback ─────────────────
    if (candidates.length > 0) {
      const best = candidates[0];
      return NextResponse.json(
        {
          result: {
            companyId: best.companyId,
            companyNameAr: best.companyNameAr,
            companyNameEn: best.companyNameEn,
            fee: best.fee,
            estimatedDays: best.estimatedDays,
            trackingSupported: best.trackingSupported,
          },
          alternatives: candidates.slice(1).map((c) => ({
            companyId: c.companyId,
            companyNameAr: c.companyNameAr,
            companyNameEn: c.companyNameEn,
            fee: c.fee,
            estimatedDays: c.estimatedDays,
            trackingSupported: c.trackingSupported,
          })),
          matchType: best.matchType,
        },
        { headers: corsHeaders }
      );
    }

    // ─── Phase 5: Fallback to static delivery-data ──────────────
    const regionData = getRegionForCity(city);
    if (regionData) {
      const fee = getDeliveryFee(city, area || undefined);
      const estimatedDays = getEstimatedDays(city, area || undefined);

      return NextResponse.json(
        {
          result: {
            companyId: null,
            companyNameAr: 'توصيل افتراضي',
            companyNameEn: 'Default Delivery',
            fee,
            estimatedDays,
            trackingSupported: false,
          },
          alternatives: [],
          matchType: 'fallback',
        },
        { headers: corsHeaders }
      );
    }

    // No coverage at all
    return NextResponse.json(
      {
        result: null,
        error: 'No shipping coverage available for this area',
        matchType: null,
      },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[API /shipping/calculate] GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping fee' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ─── Helper: Find the best zone match ────────────────────
function findZoneMatch(
  zones: Array<{
    id: string;
    cityName: string;
    areaName: string | null;
    regionId: string | null;
    fee: number | { toNumber(): number };
    estimatedDays: number;
    isActive: boolean;
  }>,
  city: string,
  area: string | null
): (typeof zones)[0] | null {
  // Priority 1: Exact match on city + area
  if (area) {
    const exactMatch = zones.find(
      (z) => z.cityName === city && z.areaName === area
    );
    if (exactMatch) return exactMatch;
  }

  // Priority 2: City-level match (areaName is null = entire city)
  const cityMatch = zones.find(
    (z) => z.cityName === city && z.areaName === null
  );
  if (cityMatch) return cityMatch;

  // Priority 3: Any zone for this city (even with a different area)
  const anyCityMatch = zones.find((z) => z.cityName === city);
  if (anyCityMatch) return anyCityMatch;

  return null;
}

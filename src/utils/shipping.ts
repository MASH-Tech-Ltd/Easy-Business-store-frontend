/**
 * Compute the shipping cost for a given district/division
 * based on the merchant's configured shipping zones.
 *
 * Matching priority:
 * 1. Zone with a matching district (most specific)
 * 2. Zone with a matching division but no districts specified (wildcard)
 * 3. defaultShippingCost (fallback)
 */
export interface ShippingZone {
  name: string;
  cost: number;
  division: string;
  districts: string[];
}

export function computeShipping(
  division: string,
  district: string,
  zones: ShippingZone[] = [],
  defaultCost = 120
): { cost: number; zoneName: string | null } {
  if (!zones.length) return { cost: defaultCost, zoneName: null };

  // 1. Exact district match
  for (const zone of zones) {
    if (
      zone.division === division &&
      zone.districts.length > 0 &&
      zone.districts.includes(district)
    ) {
      return { cost: zone.cost, zoneName: zone.name };
    }
  }

  // 2. Division match with no specific districts (acts as wildcard for that division)
  for (const zone of zones) {
    if (zone.division === division && zone.districts.length === 0) {
      return { cost: zone.cost, zoneName: zone.name };
    }
  }

  // 3. Global wildcard match (no division, no specific districts)
  for (const zone of zones) {
    if (!zone.division && zone.districts.length === 0) {
      return { cost: zone.cost, zoneName: zone.name };
    }
  }

  // 4. Default fallback
  return { cost: defaultCost, zoneName: null };
}

import { NextRequest, NextResponse } from 'next/server';
import { storefrontFetch } from '@/utils/storefrontFetch';
import { getTenantSlugFromReq } from '@/utils/tenant';

// Max search query length — prevents overly large payloads from being forwarded
const MAX_QUERY_LENGTH = 100;
// Allowed limit values — prevents arbitrary large DB scans
const MAX_LIMIT = 20;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = getTenantSlugFromReq(req);

  // Sanitize and validate query param
  const rawQuery = searchParams.get('query') || searchParams.get('search') || '';
  const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  // Sanitize limit
  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const limit = Math.min(Math.max(1, isNaN(rawLimit) ? 10 : rawLimit), MAX_LIMIT);

  if (!tenantSlug || !query) {
    return NextResponse.json(
      { success: false, message: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/storefront/${encodeURIComponent(tenantSlug)}/products?search=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await storefrontFetch(url);
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch (error) {
    console.error('[Search API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

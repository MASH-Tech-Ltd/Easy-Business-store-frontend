import { NextRequest, NextResponse } from 'next/server';
import { storefrontFetch } from '@/utils/storefrontFetch';
import { getTenantSlugFromReq } from '@/utils/tenant';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const tenantSlug = getTenantSlugFromReq(req);
  const query = searchParams.get('query');
  const limit = searchParams.get('limit') || '10';

  if (!tenantSlug || !query) {
    return NextResponse.json({ success: false, message: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/storefront/${tenantSlug}/products?search=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await storefrontFetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

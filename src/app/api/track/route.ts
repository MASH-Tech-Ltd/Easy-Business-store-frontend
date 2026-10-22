import { NextRequest, NextResponse } from 'next/server';
import { storefrontFetch } from '@/utils/storefrontFetch';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get('id');
  const tenantId = searchParams.get('tenantId');

  if (!id) {
    return NextResponse.json({ success: false, message: 'Missing order ID' }, { status: 400 });
  }

  const phone = searchParams.get('phone');
  if (!phone) {
    return NextResponse.json({ success: false, message: 'Missing phone number' }, { status: 400 });
  }

  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/orders/track/${encodeURIComponent(id)}`);
    url.searchParams.append('phone', phone);
    
    const cfIp = req.headers.get('cf-connecting-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0]?.trim() : null) || realIp || '';
    
    const originalHost = req.headers.get('host') || '';
    const userAgent = req.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const apiKey = process.env.STOREFRONT_API_KEY || process.env.NEXT_PUBLIC_STOREFRONT_API_KEY;

    const forwardHeaders: Record<string, string> = {
      'Host': originalHost,
      'X-Forwarded-Host': originalHost,
      'User-Agent': userAgent,
    };
    if (apiKey) {
      forwardHeaders['x-storefront-api-key'] = apiKey;
    }
    if (clientIp) {
      forwardHeaders['x-tenant-client-ip'] = clientIp;
    }

    const res = await fetch(url.toString(), {
      headers: forwardHeaders
    });
    const data = await res.json();
    
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('Track Order Proxy Error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

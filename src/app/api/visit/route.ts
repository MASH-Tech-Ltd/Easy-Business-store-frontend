import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headersList = await headers();

    // Read the real client IP from the incoming browser request headers
    // (set by Cloudflare/Nginx before hitting Next.js)
    const cfIp = headersList.get('cf-connecting-ip');
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');

    // Determine the best real IP to forward
    const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0]?.trim() : null) || realIp || '';

    // Build forwarded headers to pass real IP to the backend.
    // Use x-tenant-client-ip (custom header) instead of x-forwarded-for / x-real-ip
    // because Cloudflare overwrites those standard headers on the outbound hop.
    // x-tenant-client-ip is unknown to Cloudflare and passes through unmodified.
    const userAgent = headersList.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    const apiKey = process.env.STOREFRONT_API_KEY || process.env.NEXT_PUBLIC_STOREFRONT_API_KEY;

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    };
    if (apiKey) {
      forwardHeaders['x-storefront-api-key'] = apiKey;
    }
    if (clientIp) {
      forwardHeaders['x-tenant-client-ip'] = clientIp;
    }

    // Forward the request to the real backend, keeping the domain hidden from the client
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/visit`, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      {
        status: 500,
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }
}

export async function GET() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}

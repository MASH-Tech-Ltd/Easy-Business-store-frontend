import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headersList = await headers();

    const cfIp = headersList.get('cf-connecting-ip');
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0]?.trim() : null) || realIp || '';

    const userAgent = headersList.get('user-agent') || 'Mozilla/5.0';
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

    const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${apiBase}/analytics/track`, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({ success: true }));

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Tracking failed silently' },
      {
        status: 200, // Return 200 to prevent client errors
        headers: {
          'X-Robots-Tag': 'noindex, nofollow, noarchive',
        },
      }
    );
  }
}


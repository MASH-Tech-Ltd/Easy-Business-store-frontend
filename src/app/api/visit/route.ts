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
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
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
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

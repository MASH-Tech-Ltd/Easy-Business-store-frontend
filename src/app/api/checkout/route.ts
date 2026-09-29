import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const cfIp = req.headers.get('cf-connecting-ip');
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0]?.trim() : null) || realIp || '';
    
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/orders/create-order`);
    
    // Pass the original host header so the backend tenant middleware can resolve the tenant automatically
    const originalHost = req.headers.get('host') || '';
    
    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Host': originalHost,
      'X-Forwarded-Host': originalHost
    };
    if (clientIp) {
      forwardHeaders['x-tenant-client-ip'] = clientIp;
    }
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Checkout Proxy Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

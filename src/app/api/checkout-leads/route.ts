import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/checkout-leads/track`);
    
    // Pass the original host header so the backend tenant middleware can resolve the tenant automatically
    const originalHost = req.headers.get('host') || '';
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Host': originalHost,
        'X-Forwarded-Host': originalHost
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Checkout Leads Proxy Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

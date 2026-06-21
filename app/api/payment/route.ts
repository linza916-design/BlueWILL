import { NextRequest, NextResponse } from 'next/server';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const FLUTTERWAVE_PUBLIC_KEY = process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, email, name, phone, tx_ref, redirect_url, meta } = body;

    if (!FLUTTERWAVE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Initialize payment with Flutterwave
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_ref: tx_ref || `bw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        currency: 'USD',
        redirect_url: redirect_url || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/payment/callback`,
        customer: {
          email: email,
          name: name || 'BlueWILL User',
          phonenumber: phone || '',
        },
        customizations: {
          title: 'BlueWILL',
          description: meta?.description || 'BlueWILL Premium Subscription',
          logo: 'https://bluewill.com/logo.png',
        },
        meta: meta || {},
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      return NextResponse.json({
        success: true,
        link: data.data.link,
        tx_ref: data.data.tx_ref,
      });
    } else {
      return NextResponse.json(
        { error: data.message || 'Payment initialization failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Verify payment callback
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tx_ref = searchParams.get('tx_ref');
  const transaction_id = searchParams.get('transaction_id');

  if (status === 'successful' && transaction_id) {
    // Verify the transaction
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (data.status === 'success' && data.data.status === 'successful') {
      // Payment verified - in production, update the database
      // Add subscription, add BlueStars, etc.

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings?payment=success`
      );
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings?payment=failed`
  );
}

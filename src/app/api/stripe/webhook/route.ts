import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ received: true, mode: 'demo' });
  try {
    const body = await req.text();
    const event = JSON.parse(body);
    switch (event.type) {
      case 'checkout.session.completed': console.log('[Stripe] Checkout:', event.data.object.id); break;
      case 'customer.subscription.updated': console.log('[Stripe] Sub updated:', event.data.object.id); break;
      case 'customer.subscription.deleted': console.log('[Stripe] Sub cancelled:', event.data.object.id); break;
      case 'invoice.payment_failed': console.log('[Stripe] Payment failed:', event.data.object.id); break;
    }
    return NextResponse.json({ received: true });
  } catch (err: unknown) { return NextResponse.json({ error: String(err) }, { status: 400 }); }
}

import { NextResponse } from 'next/server';

export async function POST() {
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ mode: 'demo', plans: { starter: '$49/mo', pro: '$149/mo' } });
  return NextResponse.json({ message: 'Stripe integration ready' });
}

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';


export async function POST() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return NextResponse.json({ error: "billing_disabled" }, { status: 503 });
  }
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-08-27.basil' });
  const supabase = createServerActionClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // 実運用ではユーザー毎に Stripe Customer を紐づけて保存します。
  // MVP: Checkout 完了時に顧客が作られ、webhookで customer_id を learning_profiles に保存する設計へ。
  // ここでは簡略化し portal を開けない場合がある点は了承。
  return NextResponse.json({ error: 'not_implemented' }, { status: 501 });
}

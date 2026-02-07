import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

export async function POST(req: Request) {
  try {
    // --- Supabase: cookie ベースのSSRクライアント ---
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (all) => {
            all.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    // --- ユーザーの取得（1) クッキー / 2) Bearer の順で試す）---
    let userId: string | null = null;

    // 1) クッキーから
    const { data: cookieUser, error: cookieErr } = await supabase.auth.getUser();
    if (cookieUser?.user) {
      userId = cookieUser.user.id;
    }

    // 2) Authorization: Bearer <access_token> があれば優先
    if (!userId) {
      const auth = req.headers.get('authorization');
      const token = auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7) : null;
      if (token) {
        const { data: bearerUser, error: bearerErr } = await supabase.auth.getUser(token);
        if (bearerUser?.user) userId = bearerUser.user.id;
        if (bearerErr) console.error('[checkout] bearer getUser error', bearerErr);
      }
    }

    if (!userId) {
      console.error('[checkout] unauthorized: Auth session missing');
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // --- Body ---
    let body: { mode: 'payment'|'subscription'; kind: 'credits_1000'|'plan_basic' };
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'invalid json' }, { status: 400 }); }

    const price =
      body.kind === 'credits_1000' ? process.env.STRIPE_PRICE_CREDITS_1000 :
      body.kind === 'plan_basic'   ? process.env.STRIPE_PRICE_PLAN_BASIC : undefined;
    if (!price) return NextResponse.json({ error: 'invalid price' }, { status: 400 });

    // --- Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      mode: body.mode,                         // 'payment' or 'subscription'
      line_items: [{ price, quantity: 1 }],    // price は .env の固定 price_...（myproductの値ではない）
      success_url: `${process.env.STRIPE_BILLING_PORTAL_RETURN_URL}?success=1`,
      cancel_url: `${process.env.STRIPE_BILLING_PORTAL_RETURN_URL}?canceled=1`,
      client_reference_id: userId,             // 保険：ここにもユーザーID
      metadata: {
        user_id: userId,                       // Webhookで残高を付ける相手を特定
        kind: body.kind                        // 'credits_1000' | 'plan_basic'
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (e: any) {
    console.error('[checkout] unhandled error', e);
    return NextResponse.json({ error: 'internal_error', detail: e?.message ?? String(e) }, { status: 500 });
  }
}

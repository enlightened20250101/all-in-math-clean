// src/app/api/billing/webhook/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient as createSbClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

const CREDIT_PACKS: Record<string, number> = { credits_1000: 10_000 };
const MONTHLY_LIMIT_BY_PLAN: Record<string, number> = { basic: 100_000 };

const log  = (...a:any[]) => console.log('[webhook]', ...a);
const elog = (...a:any[]) => console.error('[webhook]', ...a);

export async function POST(req: Request) {
  try {
    const sig = (await headers()).get('stripe-signature')!;
    const raw = await req.text();
    const event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    log('event', event.type);

    const supabase = createSbClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // Service Role（サーバ専用）
    );

    if (event.type === 'checkout.session.completed') {
      const s0 = event.data.object as Stripe.Checkout.Session;
      const session = await stripe.checkout.sessions.retrieve(s0.id, { expand: ['line_items', 'subscription'] });

      const priceId = (session.line_items?.data?.[0]?.price as Stripe.Price | undefined)?.id ?? null;
      const userId  = (session.metadata?.user_id as string) || (session.client_reference_id as string) || null;

      let kind: 'credits_1000' | 'plan_basic' | null = null;
      const kindMeta = session.metadata?.kind as any;
      if (kindMeta === 'credits_1000' || kindMeta === 'plan_basic') kind = kindMeta;
      if (!kind) {
        if (session.mode === 'payment' && priceId === process.env.STRIPE_PRICE_CREDITS_1000) kind = 'credits_1000';
        if (session.mode === 'subscription') kind = 'plan_basic';
      }

      log('session', { id: session.id, mode: session.mode, priceId, userId, kind });
      if (!userId || !kind) {
        elog('missing userId/kind');
        return NextResponse.json({ ok: true });
      }

      if (kind === 'credits_1000') {
        const add = CREDIT_PACKS[kind] ?? 0;
        const { data: prof, error: selErr } = await supabase
          .from('learning_profiles')
          .select('credits')
          .eq('user_id', userId)
          .maybeSingle();
        if (selErr) elog('select profiles error', selErr);

        const next = (prof?.credits ?? 0) + add;
        const { error: upsertErr } = await supabase
          .from('learning_profiles')
          .upsert({ user_id: userId, credits: next });
        if (upsertErr) elog('upsert profiles error', upsertErr);
        else log('credits added', { userId, add, next });
      }

      if (kind === 'plan_basic') {
        const limit = MONTHLY_LIMIT_BY_PLAN.basic ?? 0;
        const renew = new Date(); renew.setMonth(renew.getMonth() + 1);
        const { error: upsertErr } = await supabase
          .from('learning_profiles')
          .upsert({
            user_id: userId,
            plan: 'basic',
            plan_price_id: process.env.STRIPE_PRICE_PLAN_BASIC ?? null,
            plan_renews_on: renew.toISOString().slice(0, 10),
            monthly_quota_limit: limit,
            monthly_quota_used: 0,
          });
        if (upsertErr) elog('upsert plan error', upsertErr);
        else log('plan activated', { userId, limit });
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e:any) {
    elog('error', e?.message ?? e, e?.stack);
    return NextResponse.json({ error: 'webhook_error', detail: e?.message ?? String(e) }, { status: 400 });
  }
}

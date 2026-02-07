export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { buildIntegralLinear, buildDerivativeSin, saveProblem } from "@/server/learning/generator";

export async function POST(req: NextRequest) {
  try {
    const sb = await await supabaseServerReadOnly();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:"auth" }, { status:401 });

    const { kind, skillId, params } = await req.json().catch(()=> ({}));
    if (!skillId || !kind) return NextResponse.json({ ok:false, error:"kind/skillId required" }, { status:400 });

    let built: any;
    if (kind === "integral_linear") built = await buildIntegralLinear(params||{});
    else if (kind === "derivative_sin") built = await buildDerivativeSin(params||{});
    else return NextResponse.json({ ok:false, error:"unsupported kind" }, { status:400 });

    const saved = await saveProblem({
      userId: user.id,
      skillId,
      kind: built.kind,
      body_md: built.body_md,
      payload: built.payload,
      seed: built.seed,
    });

    return NextResponse.json({ ok:true, problem: saved });
  } catch (e:any) {
    // Supabase の error オブジェクトも文字列化
    const msg = typeof e?.message === "string" ? e.message : String(e);
    return NextResponse.json({ ok:false, error: msg }, { status:500 });
  }
}

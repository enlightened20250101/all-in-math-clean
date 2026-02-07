export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { supabaseServerReadOnly } from "@/lib/supabaseServer";
import { buildIntegralLinear, buildDerivativeSin } from "@/server/learning/generator";

export async function POST(req: NextRequest) {
  try {
    const sb = await await supabaseServerReadOnly();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ ok:false, error:"auth" }, { status:401 });

    const { kind, params } = await req.json().catch(()=> ({}));
    if (!kind) return NextResponse.json({ ok:false, error:"kind required" }, { status:400 });

    if (kind === "integral_linear") {
      const built = await buildIntegralLinear(params||{});
      return NextResponse.json({ ok:true, preview: built.body_md });
    }
    if (kind === "derivative_sin") {
      const built = await buildDerivativeSin(params||{});
      return NextResponse.json({ ok:true, preview: built.body_md });
    }
    return NextResponse.json({ ok:false, error:"unsupported kind" }, { status:400 });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e) }, { status:500 });
  }
}

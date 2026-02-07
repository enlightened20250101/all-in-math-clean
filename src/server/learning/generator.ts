import { supabaseServerAction } from "@/lib/supabaseServer";

const VERIFY = process.env.NEXT_PUBLIC_VERIFY_BASE || "http://localhost:8000";

async function post<T=any>(path: string, body: any): Promise<T> {
  const r = await fetch(`${VERIFY}${path}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(`verify ${path} ${r.status}: ${txt}`);
  return JSON.parse(txt);
}

/** =============== builders（検証まで。保存はしない） =============== */

export async function buildIntegralLinear(params: { a?: number; b?: number }) {
  const a = params.a ?? randInt(-5, 5, { exclude: [0] });
  const b = params.b ?? randInt(-10, 10);
  const body_md = [
    "次を不定積分せよ：",
    "",
    `$$\\int (${a}x ${fmtSigned(b)})\\,dx$$`,
  ].join("\n");
  const integrand = `(${a}*x + ${b})`;
  const expected = `${a/2}*x**2 + ${b}*x + C`;

  const v = await post("/verify_integral", { integrand, expected, var: "x" });
  if (!v?.ok) throw new Error("verify_integral failed");

  return {
    kind: "integral" as const,
    body_md,
    payload: { integrand, var: "x" },
    seed: { a, b },
  };
}

export async function buildDerivativeSin(params: { k?: number }) {
  const k = params.k ?? randInt(2, 6);
  const body_md = [
    "次を微分せよ：",
    "",
    `$$\\frac{d}{dx}\\,\\sin(${k}x)$$`,
  ].join("\n");
  const func_latex = `\\sin(${k}x)`;
  const expected_latex = `${k}\\cos(${k}x)`;

  const v = await post("/verify_derivative", { func_latex, variable: "x", expected_latex });
  if (!v?.ok) throw new Error("verify_derivative failed");

  return {
    kind: "derivative" as const,
    body_md,
    payload: { func_latex, var: "x" },
    seed: { k },
  };
}

/** =============== 保存ラッパ =============== */

export async function saveProblem(input: {
  userId: string;
  skillId: string;
  kind: "integral" | "derivative";
  body_md: string;
  payload: Record<string, any>;
  seed: Record<string, any>;
}) {
  const sb = await await supabaseServerAction();
  const { data, error } = await sb
    .from("problems")
    .insert({
      skill_id: input.skillId,
      body_md: input.body_md,
      kind: input.kind,
      payload: input.payload,
      source: "gen:v1",
      seed: JSON.stringify(input.seed),
      author: input.userId,             // ★ RLS の with check を満たす
    })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** utils */
function fmtSigned(n: number) { return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`; }
function randInt(lo: number, hi: number, opt?: { exclude?: number[] }) {
  const ex = new Set(opt?.exclude || []);
  let v = 0; do { v = Math.floor(Math.random()*(hi-lo+1))+lo; } while(ex.has(v));
  return v;
}
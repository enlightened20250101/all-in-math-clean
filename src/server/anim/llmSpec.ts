// src/server/anim/llmSpec.ts
import { VizSpec, VizSpecSchema } from "@/lib/vizSpec";

/**
 * LLMに vizSpec（設計図JSON）を生成させる。
 * - 成功: VizSpec（zodで検証済み）
 * - 失敗: null（呼び出し側でフォールバック）
 *
 * Few-shot を tangent / riemann / inequality / parabola の4種で拡充。
 * 出力は必ず 1つの JSON オブジェクトのみ（コードフェンス・説明文は禁止）。
 */
export async function tryGenerateVizSpecWithLLM(input: {
  summary?: string;          // 問題要約やセクション要旨
  latex?: string;            // 数式本文（あるなら）
  topic?: string;            // トピック名（任意）
  candidates?: string[];     // 候補preset（例: ["tangent_at_point","riemann_sum_left_right_mid"]）
  maxObjects?: number;       // 出力オブジェクト上限のヒント（保守的に）
}): Promise<VizSpec | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null; // キーがない → LLMスキップ

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const maxObjs = input.maxObjects ?? 16;

  // ── System / Developer ─────────────────────────────────────
  const sys = [
    "You are a Math Visualization Orchestrator for a JSXGraph-based renderer.",
    "Your ONLY task: return a SINGLE JSON object matching the provided schema (vizSpec).",
    "NO code fences, NO prose, NO markdown. Just the JSON.",
    "Prefer small integers or simple rationals. Keep the spec compact and clear.",
    "Keep steps between 2 and 5, and total objects <= " + maxObjs + ".",
  ].join(" ");

  const dev = [
    "The vizSpec JSON MUST validate against the following fields:",
    "- preset: string (choose from realistic presets, or from CANDIDATES if provided).",
    "- params: object with simple scalars/arrays (e.g., {f, x0} or {f, a, b, n, mode}).",
    "- objects: array of allowed types: grid, axes, point, line, segment, circle, vector, text, curve, polygon, region.",
    "- steps: up to 5 steps with reveal/highlight/animate (animate optional).",
    "- notes: optional small array of annotations.",
    "- bbox: [x1, y1, x2, y2] if needed.",
    "",
    "Rules:",
    "1) Use minimal, didactic objects. Avoid redundant labels.",
    "2) For tangent problems:",
    "   - preset: tangent_at_point",
    "   - params: { f: 'x**2'|'sin(x)'|..., x0: number, xRange?: [lo,hi] }",
    "   - Include curve (y=f(x)), the contact point P, and the tangent as a line with expr 'y=m*x+b'.",
    "3) For Riemann sums:",
    "   - preset: riemann_sum_left_right_mid",
    "   - params: { f, a, b, n, mode: 'left'|'right'|'mid' }",
    "   - Draw curve and a few rectangles as polygons (objects type 'polygon').",
    "4) For simple quadratic vertex view:",
    "   - preset: parabola_vertex_shift",
    "   - params: { a, h, k, xRange? }",
    "   - Provide vertex point V, axis line x=h, and curve.",
    "5) For 1D inequalities:",
    "   - preset: inequality_region_1d",
    "   - params: { expr }  // e.g., '(x-2)(x-3) ≤ 0'",
    "   - Show number line (axes), roots as points, and a segment for the solution interval.",
    "6) If CANDIDATES are provided, choose one of them unless clearly unsuitable.",
    "7) Keep within object count <= " + maxObjs + " and steps <= 5.",
  ].join(" ");

  // ── User content ───────────────────────────────────────────
  const user = [
    `SUMMARY:\n${input.summary ?? "(none)"}`,
    input.latex ? `\nLATEX:\n${input.latex}` : "",
    input.topic ? `\nTOPIC:\n${input.topic}` : "",
    input.candidates?.length ? `\nCANDIDATES:\n${input.candidates.join(", ")}` : "",
    "\nREQUIREMENTS:\n- Return ONLY the JSON vizSpec (no code block fences, no explanations).",
  ].join("");

  // ── Few-shot examples（最小・良質・各1件） ──────────────────
  // 1) Tangent
  const exTangent: VizSpec = {
    preset: "tangent_at_point",
    params: { f: "x**2", x0: 1, xRange: [-5, 5] },
    bbox: [-6, 6, 6, -1],
    objects: [
      { type: "grid", id: "grid" },
      { type: "axes", id: "axes" },
      { type: "curve", id: "f", fx: "x**2", xRange: [-5, 5] },
      { type: "point", id: "P", coordsExpr: { fx: "x**2", atX: 1 }, label: "P" },
      { type: "line", id: "tangent", expr: "y=2*x+(-1)" },
      { type: "text", id: "form", pos: [-5.5, 5.5], text: "f(x)=x^2, x0=1" }
    ],
    steps: [
      { reveal: ["grid", "axes"] },
      { reveal: ["f"] },
      { reveal: ["P", "tangent"] }
    ],
    notes: [{ text: "接線の傾きは f'(x0)。", anchor: "P" }]
  };

  // 2) Riemann (mid)
  const exRiemann: VizSpec = {
    preset: "riemann_sum_left_right_mid",
    params: { f: "x**2", a: 0, b: 3, n: 6, mode: "mid" },
    bbox: [-1, 10, 4, -1],
    objects: [
      { type: "grid", id: "grid" },
      { type: "axes", id: "axes" },
      { type: "curve", id: "f", fx: "x**2", xRange: [-0.5, 3.5] },
      // 例として2本（本番は数本～n本でも可：ただし objects 制限に注意）
      { type: "polygon", id: "rect-0", points: [[0,0],[0,0.25],[0.5,0.25],[0.5,0]] },
      { type: "polygon", id: "rect-1", points: [[0.5,0],[0.5,0.5625],[1,0.5625],[1,0]] },
      { type: "text", id: "info", pos: [0, 9.2], text: "Riemann mid, n=6" }
    ],
    steps: [
      { reveal: ["grid", "axes"] },
      { reveal: ["f"] },
      { reveal: ["rect-0", "rect-1"] }
    ]
  };

  // 3) Inequality 1D
  const exIneq1D: VizSpec = {
    preset: "inequality_region_1d",
    params: { expr: "(x-2)(x-3) ≤ 0" },
    bbox: [-1, 1, 7, -1],
    objects: [
      { type: "axes", id: "axes" },
      { type: "text", id: "t", pos: [0, 0.5], text: "(x-2)(x-3) ≤ 0" },
      { type: "point", id: "r1", coords: [2, 0], label: "2" },
      { type: "point", id: "r2", coords: [3, 0], label: "3" },
      { type: "segment", id: "seg", ends: ["r1", "r2"] }
    ],
    steps: [
      { reveal: ["axes", "t"] },
      { reveal: ["r1", "r2", "seg"], highlight: ["seg"] }
    ]
  };

  // 4) Parabola vertex
  const exParabola: VizSpec = {
    preset: "parabola_vertex_shift",
    params: { a: 1, h: 2, k: -1, xRange: [-5, 5] },
    bbox: [-6, 6, 6, -6],
    objects: [
      { type: "grid", id: "grid" },
      { type: "axes", id: "axes" },
      { type: "point", id: "V", coords: [2, -1], label: "V" },
      { type: "line", id: "axis", expr: "x=2", style: "dashed" },
      { type: "curve", id: "curve", fx: "1*(x-(2))**2 + (-1)" },
      { type: "text", id: "form", pos: [-5.5, 5.5], text: "y = (x-2)^2 - 1" }
    ],
    steps: [
      { reveal: ["grid", "axes"] },
      { reveal: ["curve"] },
      { reveal: ["V", "axis"], highlight: ["V", "axis"] }
    ],
    notes: [{ text: "平方完成 y=a(x-h)^2+k。", anchor: "V" }]
  };

  // 例を候補に合わせて提示（少なめに提示して誘導性を高める）
  const exampleBlock = examplesForCandidates(input.candidates ?? []);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: sys },
        { role: "developer", content: dev },
        { role: "user", content: user },
        { role: "developer", content: "Example: tangent\n" + JSON.stringify(exTangent) },
        ...(exampleBlock.includes("riemann_sum_left_right_mid") ? [{ role: "developer", content: "Example: riemann\n" + JSON.stringify(exRiemann) }] : []),
        ...(exampleBlock.includes("inequality_region_1d") ? [{ role: "developer", content: "Example: inequality_1d\n" + JSON.stringify(exIneq1D) }] : []),
        ...(exampleBlock.includes("parabola_vertex_shift") ? [{ role: "developer", content: "Example: parabola_vertex\n" + JSON.stringify(exParabola) }] : []),
        { role: "developer", content: "Return ONLY one JSON object (vizSpec). Do NOT wrap in code fences." }
      ],
      temperature: 0.15,
      max_output_tokens: 1500,
      modality: "text",
      metadata: { purpose: "vizSpec-generation" }
    }),
  });

  if (!response.ok) return null;

  const data = await response.json().catch(() => null);
  const text = extractText(data);
  if (!text) return null;

  // JSON抽出（フェンスなし想定。万一フェンスが来ても最初の{}を拾う）
  const jsonStr = (()=>{
    const m = text.match(/\{[\s\S]*\}/);
    return m ? m[0] : text;
  })();

  try {
    const parsed = JSON.parse(jsonStr);
    const spec = VizSpecSchema.parse(parsed); // Zod 検証
    if (spec.objects && spec.objects.length > maxObjs) {
      spec.objects = spec.objects.slice(0, maxObjs);
    }
    return spec;
  } catch {
    return null;
  }

  // Helpers
  function examplesForCandidates(cands: string[]): string[] {
    if (!cands.length) return ["tangent_at_point","riemann_sum_left_right_mid","inequality_region_1d","parabola_vertex_shift"];
    // 少数のみ見せて過剰誘導を避ける
    const allow = new Set<string>();
    for (const c of cands) {
      if (c === "tangent_at_point") allow.add(c);
      if (c === "riemann_sum_left_right_mid") allow.add(c);
      if (c === "inequality_region_1d") allow.add(c);
      if (c === "parabola_vertex_shift") allow.add(c);
    }
    if (allow.size === 0) return ["tangent_at_point"];
    return Array.from(allow);
  }
}

/** OpenAI Responses API から最終テキストを取り出す簡易抽出 */
function extractText(payload: any): string | null {
  try {
    // 標準的な出力形式（output[0].content[0].text）
    const c = payload?.output?.[0];
    if (c?.content?.[0]?.type === "output_text") {
      return c.content[0].text as string;
    }
    // フォーマット変動時の後方互換
    const txt = JSON.stringify(payload);
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? m[0] : null;
  } catch {
    return null;
  }
}

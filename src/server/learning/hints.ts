// src/server/learning/hints.ts
import { search } from "@/server/rag/search";
type Grading = any;

export async function fromGrading(input: { skillId: string; grading: Grading; userLocale: "ja"|"en" }) {
  const g = input.grading || {};
  let base =
    g.ok ? "良いペース！次へ進もう。" :
    g.kind === "integral" ? "微分して元に戻るかを確かめよう。（+C を忘れない）" :
    g.kind === "derivative" ? "合成関数は“外側×内側の微分”。sin(3x)なら最後に 3。" :
    g.kind === "roots" ? "因数分解か平方完成、または解の公式を検討してみよう。" :
    g.kind === "inequality_set" ? "境界点を求め、数直線で符号を見て区間を決めよう。" :
    g.kind === "steps" ? "途中式のどこかが同値でない可能性。定義へ立ち戻ろう。" :
    "一度小さい数字で同じ手順を試し、形を掴もう。";

  let extra = "";
  try {
    if (!g.ok) {
      const q = `${input.skillId} ${g.kind || ""} ヒント`;
      const res: any = await search(q, { k: 1 });
      const doc = res?.hits?.[0];
      const summary = (doc?.summary || doc?.content || "")
        .toString()
        .split(/。|\.|\n/)
        .filter(Boolean)[0] || "";
      if (summary) extra = ` ${summary.trim()}。`;
    }
  } catch {
    // RAG失敗時は静かにスキップ
  }

  return { message: (base + extra).slice(0, 110) };
}

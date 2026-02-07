"use client";

import Link from "next/link";
import { getTopicById } from "@/lib/course/topics";

export default function SummaryClient({ r }: { r: string }) {
  let result: any = null;
  try {
    result = r ? JSON.parse(decodeURIComponent(r)) : null;
  } catch {}

  function areaLabel(area: string) {
    const labels: Record<string, string> = {
      algebra: "数と式",
      logic: "集合と論理",
      quadratic: "二次関数",
      trigonometry: "三角比",
      geometry: "図形と計量",
      data: "データの分析",
      combinatorics: "場合の数",
      probability: "確率",
      integer: "整数の性質",
      exp_log: "指数・対数",
      calculus: "微分積分",
      polynomial: "多項式",
      identity_inequality: "恒等式・不等式",
      sequence: "数列",
      vector: "ベクトル",
      complex: "複素数",
      conic: "二次曲線",
      limit: "極限",
      continuity: "連続性",
      derivative: "微分",
      integral: "積分",
      area: "面積",
      parametric: "媒介変数",
    };
    return labels[area] ?? area;
  }

  if (!result) {
    return (
      <div className="space-y-3">
        <div className="rounded-[18px] border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-[11px] sm:text-sm text-amber-800 shadow-sm ring-1 ring-amber-200/60">
          結果の表示に失敗しました。
        </div>
        <Link
          href="/course/onboarding/diagnostic"
          className="inline-flex items-center gap-2 text-blue-700 px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
            BK
          </span>
          診断に戻る →
        </Link>
      </div>
    );
  }

  const defaultUnitByCourse: Record<string, string> = {
    hs_ia: "math1",
    hs_iib: "math2",
    ct_iib: "math2",
    ct_iib_sequence: "mathB",
    ct_iib_statistics: "mathB",
    hs_iic: "mathC",
    hs_iii: "math3",
  };

  const topicsHref = result?.courseId
    ? `/course/topics?course=${encodeURIComponent(result.courseId)}&unit=${encodeURIComponent(
        defaultUnitByCourse[result.courseId] ?? "math1"
      )}`
    : "/course/topics";

  const areas = Object.entries(result.areaLevels ?? {});
  const recommendedTopics: string[] = result.recommendedTopics ?? [];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border rounded-2xl p-3 sm:p-5 bg-white/95 ring-1 ring-slate-200/70 shadow-sm">
          <div className="text-[10px] sm:text-sm text-gray-600">正解数</div>
          <div className="text-xl sm:text-2xl font-semibold">
            {result.correct} / {result.total}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
            達成度は /course のおすすめに反映されます
          </div>
        </div>

        <div className="border rounded-2xl p-3 sm:p-5 bg-white/95 ring-1 ring-slate-200/70 shadow-sm">
          <div className="text-[10px] sm:text-sm text-gray-600">推奨コース（goal）</div>
          <div className="text-lg sm:text-xl font-semibold mt-1">{result.recommendedGoal}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
            ※このgoalは既に保存されています
          </div>
        </div>
      </div>

      <div className="border rounded-2xl p-3 sm:p-5 bg-white/95 ring-1 ring-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm sm:text-base font-semibold">分野レベル</div>
          <span className="rounded-full border px-2 py-0.5 text-[10px] sm:text-xs text-slate-500">
            {areas.length} 項目
          </span>
        </div>
        {areas.length === 0 ? (
          <div className="text-[10px] sm:text-xs text-gray-500 mt-2">データがありません</div>
        ) : (
          <ul className="mt-2 grid gap-2 sm:gap-2 sm:grid-cols-2">
            {areas.map(([area, level]) => (
              <li
                key={area}
                className="flex items-center justify-between text-[10px] sm:text-sm border rounded-full px-3 py-1 sm:px-3.5 sm:py-2 bg-slate-50"
              >
                <span className="text-gray-700">{areaLabel(area)}</span>
                <span className="font-semibold">{String(level)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border rounded-2xl p-3 sm:p-5 bg-white/95 ring-1 ring-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm sm:text-base font-semibold">おすすめトピック</div>
          <span className="rounded-full border px-2 py-0.5 text-[10px] sm:text-xs text-slate-500">
            {recommendedTopics.length} 件
          </span>
        </div>
        {recommendedTopics.length === 0 ? (
          <div className="text-[10px] sm:text-xs text-gray-500 mt-2">おすすめはありません</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {recommendedTopics.map((t) => {
              const topic = getTopicById(t);
              return (
                <li
                  key={t}
                  className="text-[10px] sm:text-sm border rounded-full px-3 py-1 sm:px-3.5 sm:py-2 bg-slate-50"
                >
                  {topic ? topic.title : t}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border bg-slate-50/80 p-3 ring-1 ring-slate-200/70 shadow-sm">
        <div className="text-[11px] text-slate-500 mb-2">次の行動</div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Link
            href="/course"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
              HM
            </span>
            コースTOPへ
          </Link>
          <Link
            href={topicsHref}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-50 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
              TP
            </span>
            トピック一覧へ
          </Link>
          <Link
            href="/course/onboarding/diagnostic"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border hover:bg-gray-50 text-[10px] sm:text-sm text-center transition active:scale-[0.98] active:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 w-full"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-slate-50 text-[9px] tracking-wider text-slate-500">
              DX
            </span>
            診断をやり直す
          </Link>
        </div>
      </div>
    </div>
  );
}

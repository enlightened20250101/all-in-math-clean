"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cachedFetchJson } from "@/lib/course/clientFetchCache";
import { useCourseIndex } from "@/lib/course/useCourseIndex";

type Settings = {
  courseId: string;
};

type ReviewSummary = {
  ok: boolean;
  count: number;
};

const COURSE_TIPS: Record<string, string> = {
  hs_ia: "基礎の定着が最優先。復習→新規の順が安定します。",
  hs_iib: "微積と数列が鍵。週1回は復習を入れると定着します。",
  ct_iib: "共通テストは標準問題の精度が勝負。ミスの型を潰すのが最短です。",
  ct_iib_sequence: "共通テスト数列は文章題の読み取りが鍵。式の立て方を丁寧に。",
  ct_iib_statistics: "共通テスト統計は用語と計算の精度が勝負。残差や推定の解釈を確認。",
  hs_iic: "ベクトルと複素数は反復が効果的。要点から。",
  hs_iii: "微積・極限が土台。直前単元の復習から。",
};

export default function CourseTipsClient() {
  const courseIndex = useCourseIndex();
  const courseMap = useMemo(() => new Map(courseIndex.map((course) => [course.courseId, course])), [courseIndex]);
  const [courseId, setCourseId] = useState<Settings["courseId"]>("hs_ia");
  const [reviewCount, setReviewCount] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await cachedFetchJson(
          "course_settings",
          30_000,
          async () => {
            const res = await fetch("/api/course/settings", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok || !json?.ok) throw new Error(json?.error ?? "settings error");
            return json;
          },
          { cooldownMs: 8000 }
        );
        if (!data?.settings?.courseId) return;
        if (ignore) return;
        setCourseId((prev) => (prev === data.settings.courseId ? prev : data.settings.courseId));
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const data = await cachedFetchJson(
          "course_review_summary",
          30_000,
          async () => {
            const res = await fetch("/api/course/review/summary", { cache: "no-store" });
            const json: ReviewSummary = await res.json();
            if (!res.ok || !json?.ok) throw new Error("summary error");
            return json;
          },
          { cooldownMs: 8000 }
        );
        if (!data?.ok) return;
        if (ignore) return;
        setReviewCount((prev) => (prev === (data.count ?? 0) ? prev : data.count ?? 0));
      } catch {
        // ignore
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const tipCourseId = courseMap.get(courseId)?.baseCourseId ?? courseId;
  const label = courseMap.get(courseId)?.title ?? "高校数学";
  const tip = useMemo(() => COURSE_TIPS[tipCourseId] ?? COURSE_TIPS.hs_ia, [tipCourseId]);

  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tips</div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] text-slate-600">
          現在のコース: {label}
        </span>
        <Link href="/course/settings" className="text-[10px] text-slate-500 hover:underline">
          コース設定へ
        </Link>
        <Link href="/course/topics" className="text-[10px] text-slate-500 hover:underline">
          コース変更
        </Link>
        {reviewCount != null ? (
          <Link
            href="/course/review"
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] transition ${
              reviewCount > 0
                ? "border-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200/60"
                : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
            }`}
          >
            {reviewCount > 0 ? `今日の復習: ${reviewCount}件` : "今日の復習はありません"}
          </Link>
        ) : null}
      </div>
      <div className="mt-2 text-[15px] sm:text-base font-semibold">{label} の学習のコツ</div>
      <div className="mt-1 text-[10px] sm:text-sm text-slate-600">{tip}</div>
    </div>
  );
}

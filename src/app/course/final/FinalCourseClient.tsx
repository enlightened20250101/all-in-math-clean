"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PracticeSessionClient from "../practice/session/PracticeSessionClient";

type FinalStartPayload = {
  ok: boolean;
  courseId: string;
  courseName: string;
  baseCourseId: string;
  isCompleted: boolean;
  topicPool: string[];
  total: number;
  passRate: number;
  error?: string;
};

export default function FinalCourseClient() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<FinalStartPayload | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) {
      setError("コースIDが取得できませんでした。");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/course/final/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        const data = (await res.json().catch(() => null)) as FinalStartPayload | null;
        if (!res.ok || !data?.ok) {
          throw new Error(data?.error ?? "final_start_error");
        }
        if (!cancelled) setPayload(data);
      } catch (e) {
        const message = e instanceof Error ? e.message : "取得に失敗しました";
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  const header = useMemo(() => {
    if (!payload) return "修了テスト";
    return `${payload.courseName} 修了テスト`;
  }, [payload]);

  const handleFinalComplete = async (result: { correct: number; total: number; passed: boolean }) => {
    if (!payload || !result.passed || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/course/final/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: payload.courseId,
          correct: result.correct,
          total: result.total,
          passed: result.passed,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error ?? "complete_error");
      setNotice("修了済みコースに移動しました。");
    } catch (e) {
      const message = e instanceof Error ? e.message : "完了更新に失敗しました";
      setNotice(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">修了テストを準備しています…</div>;
  }
  if (error || !payload) {
    return (
      <div className="p-6 space-y-2 text-sm text-slate-600">
        <div>修了テストを開始できませんでした。</div>
        <div className="text-rose-600">{error ?? "unknown error"}</div>
        <Link href="/course" className="text-blue-600 hover:underline">
          コースへ戻る
        </Link>
      </div>
    );
  }

  if (payload.isCompleted) {
    return (
      <div className="p-6 space-y-2 text-sm text-slate-600">
        <div>このコースはすでに修了済みです。</div>
        <Link href="/course" className="text-blue-600 hover:underline">
          コースへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">FINAL TEST</div>
          <h1 className="text-xl font-bold text-slate-900">{header}</h1>
          <p className="text-xs text-slate-500">
            出題数: {payload.total}問 / 合格基準: {Math.round(payload.passRate * 100)}%
          </p>
        </div>
        <Link href="/course" className="text-xs text-blue-600 hover:underline">
          コースへ戻る
        </Link>
      </div>
      {notice ? <div className="text-xs text-emerald-600">{notice}</div> : null}
      <PracticeSessionClient
        topicId={payload.topicPool[0] ?? "final"}
        mode="final"
        maxQuestions={payload.total}
        topicPool={payload.topicPool}
        finalPassRate={payload.passRate}
        onFinalComplete={handleFinalComplete}
      />
      {saving ? <div className="text-xs text-slate-400">完了情報を保存中…</div> : null}
    </div>
  );
}

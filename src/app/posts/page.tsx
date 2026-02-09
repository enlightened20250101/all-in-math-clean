import type { Metadata } from "next";
// app/posts/page.tsx
import Link from "next/link";
import dayjs from "dayjs";
import { supabaseServerPublic } from "@/lib/supabaseServerPublic";
import Pager from "@/components/Pager";
import CopyLinkButton from "@/components/CopyLinkButton";
import LocalSaveButton from "@/components/LocalSaveButton";
import SavedListMarker from "@/components/SavedListMarker";
import TagOverflowDetails from "@/components/TagOverflowDetails";
import InlineMathText from "@/components/InlineMathText";
export const metadata: Metadata = {


};


const PAGE_SIZE = 30;

// 全角→半角 + NFKC、空白/カンマ/読点/スラッシュで分割
function splitTerms(s: string) {
  const z2h = (x: string) =>
    x.replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0)).replace(/　/g, " ");
  const qn = z2h(s).normalize("NFKC");
  return qn.split(/[,\s、，／/]+/u).map((t) => t.trim()).filter(Boolean);
}

function collectTopTags(rows: any[], limit = 8) {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const tags = Array.isArray(r?.tags) ? r.tags : [];
    for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

function isNew(createdAt: string, days = 3) {
  return dayjs().diff(dayjs(createdAt), "day") <= days;
}

 

export default async function PostsIndex({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; level?: string; solved?: string; page?: string; saved?: string; sort?: string; tags?: string }>;
}) {
  const sb = supabaseServerPublic();

  const sp = await searchParams;
  const qRaw = (sp.q || "").trim();
  const level = (sp.level || "").trim().toUpperCase(); // HS/UG/ADV
  const solvedFilter = (sp.solved || "").toLowerCase(); // "", "yes", "no"
  const sort = (sp.sort || "new").toLowerCase();
  const page = Math.max(1, Number(sp.page || "1"));
  const terms = splitTerms(qRaw);
  const savedOnly = sp.saved === "1";
  const forceOpen = sp.tags === "open";
  const hasFilters = !!qRaw || !!level || !!solvedFilter || !!savedOnly || sort !== "new" || forceOpen;
  const qsBase = new URLSearchParams({ q: qRaw, level, solved: solvedFilter, sort, page: String(page) }).toString();
  const levelLabel = level === "HS" ? "高校" : level === "UG" ? "大学基礎" : level === "ADV" ? "専門" : "";
  const filterLabels: string[] = [];
  if (levelLabel) filterLabels.push(`難易度:${levelLabel}`);
  if (solvedFilter === "yes") filterLabels.push("解決のみ");
  if (solvedFilter === "no") filterLabels.push("未解決のみ");
  if (savedOnly) filterLabels.push("保存のみ");
  if (sort === "top") filterLabels.push("人気");
  if (forceOpen) filterLabels.push("タグ展開");
  let serverError: string | null = null;

  // --- 1) 取得 ---
  let rows: any[] = [];
  let statsMap = new Map<number, { answers_count: number; solved: boolean }>();
  let filtered: any[] = [];
  let total = 0;
  let pageRows: any[] = [];
  try {
    if (terms.length) {
      const conds: string[] = [];
      for (const t of terms) {
        const safe = t.replace(/[{},]/g, "");
        conds.push(`title.ilike.%${safe}%`, `body_md.ilike.%${safe}%`, `tags.cs.{${safe}}`);
      }
      // 検索モードは一旦まとめて取り、後で関連度順＆ページ分割
      let q1 = sb.from("posts").select("id,title,tags,level,created_at,body_md").or(conds.join(",")).limit(800);
      if (["HS", "UG", "ADV"].includes(level)) q1 = q1.eq("level", level);
      let { data, error } = await q1;
      if (error) {
        const noTags = conds.filter((c) => !c.startsWith("tags.cs."));
        let q2: any = sb.from("posts").select("id,title,level,created_at,body_md").or(noTags.join(",")).limit(800);
        if (["HS", "UG", "ADV"].includes(level)) q2 = q2.eq("level", level);
        ({ data } = await q2);
      }
      rows = data ?? [];
    } else {
      // 新着/人気（サーバーページング）
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      let q3 = sb.from("posts").select("id,title,tags,level,created_at").range(from, to);
      if (sort === "top") q3 = q3.order("created_at", { ascending: false });
      else q3 = q3.order("created_at", { ascending: false });
      if (["HS", "UG", "ADV"].includes(level)) q3 = q3.eq("level", level);
      const { data, error } = await q3;
      if (error) throw error;
      rows = data ?? [];
    }

    // --- 2) stats JOIN（回答数・解決）---
    const ids = rows.map((r) => r.id);
    if (ids.length) {
      const { data: stats } = await sb.from("posts_stats").select("id,answers_count,solved").in("id", ids);
      if (stats) statsMap = new Map(stats.map((s: any) => [s.id, s]));
    }

    // --- 3) 解決/未解決フィルタ ---
    filtered = rows.filter((r) => {
      const st = statsMap.get(r.id) || { solved: false };
      if (solvedFilter === "yes") return st.solved;
      if (solvedFilter === "no") return !st.solved;
      return true;
    });

    // --- 4) 関連度順 & ページ分割（検索時）---
    pageRows = filtered;
    if (terms.length) {
      const scored = filtered.map((r) => {
        const text = `${r.title || ""} ${(r.tags || []).join(" ")} ${r.body_md || ""}`.toLowerCase();
        const score = terms.reduce((acc, t) => (text.includes(t.toLowerCase()) ? acc + 1 : acc), 0);
        return { ...r, score };
      });
      scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0) || +new Date(b.created_at) - +new Date(a.created_at));
      total = scored.length;
      const start = (page - 1) * PAGE_SIZE;
      pageRows = scored.slice(start, start + PAGE_SIZE);
    } else {
      // 新着/人気モード：合計件数は全件数（簡易）
      const { count } = await sb.from("posts").select("id", { count: "exact", head: true });
      total = count ?? filtered.length;
      pageRows = filtered; // すでにrange済み
      if (sort === "top") {
        const score = (r: any) => {
          const answers = statsMap.get(r.id)?.answers_count ?? 0;
          const ageDays = Math.max(1, dayjs().diff(dayjs(r.created_at), "day") + 1);
          return answers / ageDays;
        };
        pageRows = [...pageRows].sort((a, b) => score(b) - score(a));
      }
    }
  } catch (e: any) {
    serverError = "取得に失敗しました。しばらくして再試行してください。";
    rows = [];
    statsMap = new Map();
    filtered = [];
    total = 0;
    pageRows = [];
  }

  const keywords = terms;

  const pagerQuery = new URLSearchParams({ q: qRaw, level, solved: solvedFilter, sort }).toString();

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Q&A 一覧</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">質問・回答・議論の一覧</div>
        </div>
        <div className="flex flex-wrap gap-2 sm:flex-row sm:items-center">
          <Link href="/posts/new" className="px-3 py-2 rounded bg-black text-white text-xs sm:text-sm w-full sm:w-auto text-center">新規質問</Link>
          <Link href="/posts/unanswered" className="text-xs sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">未回答</Link>
          <Link href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: "no", page: "1" }).toString()}`} className="text-xs sm:text-sm text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">
            未回答のみ
          </Link>
        </div>
      </div>
      {serverError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      {/* 検索＆フィルタ（同ページ） */}
      <form className="grid grid-cols-1 sm:grid-cols-4 gap-2" aria-label="Q&A検索フォーム" role="search" method="get">
        <input
          name="q"
          defaultValue={qRaw}
          className="border px-3 py-2 rounded col-span-2 text-[12px] sm:text-sm"
          placeholder="キーワード（タイトル・本文・タグ／OR）"
          aria-label="Q&A検索"
        />
        <select name="level" defaultValue={level} className="border px-2 py-2 rounded text-[12px] sm:text-sm">
          <option value="">難易度すべて</option>
          <option value="HS">高校</option>
          <option value="UG">大学基礎</option>
          <option value="ADV">専門</option>
        </select>
        <select name="solved" defaultValue={solvedFilter} className="border px-2 py-2 rounded text-[12px] sm:text-sm">
          <option value="">解決/未解決すべて</option>
          <option value="yes">解決のみ</option>
          <option value="no">未解決のみ</option>
        </select>
        <button className="border rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50" aria-label="検索を実行">検索</button>
      </form>
      {qRaw && (
        <Link href="/posts" className="border rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50 text-center w-fit">
          クリア
        </Link>
      )}

      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
        {forceOpen ? (
          <Link href={`/posts?${qsBase}`} className="border rounded px-2 py-1 bg-white hover:bg-gray-50">
            タグを折りたたむ
          </Link>
        ) : (
          <Link href={`/posts?${qsBase}&tags=open`} className="border rounded px-2 py-1 bg-white hover:bg-gray-50">
            タグを一括展開
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
        {sort === "top" ? (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: solvedFilter, sort: "new", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          >
            新着
          </Link>
        ) : (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: solvedFilter, sort: "top", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            人気 🔥
          </Link>
        )}
        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] sm:text-xs">
          {sort === "top" ? "現在: 人気" : "現在: 新着"}
        </span>
        {solvedFilter === "no" ? (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: "", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          >
            すべて
          </Link>
        ) : (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: "no", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          >
            未回答のみ
          </Link>
        )}
        {solvedFilter === "yes" ? (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: "", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          >
            すべて
          </Link>
        ) : (
          <Link
            href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: "yes", page: String(page) }).toString()}`}
            className="border rounded px-2 py-1 bg-white hover:bg-gray-50"
          >
            解決のみ
          </Link>
        )}
        {savedOnly ? (
          <Link href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: solvedFilter, page: String(page) }).toString()}`} className="border rounded px-2 py-1 bg-white hover:bg-gray-50">
            すべて
          </Link>
        ) : (
          <Link href={`/posts?${new URLSearchParams({ q: qRaw, level, solved: solvedFilter, page: String(page), saved: "1" }).toString()}`} className="border rounded px-2 py-1 bg-white hover:bg-gray-50">
            保存のみ
          </Link>
        )}
        {hasFilters && (
          <Link href="/posts" className="border rounded px-2 py-1 bg-white hover:bg-gray-50" aria-label="条件をクリア" role="button">
            条件をクリア
          </Link>
        )}
        {hasFilters && (
          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700" aria-label="フィルタ適用中">
            フィルタ中
          </span>
        )}
      </div>

      <div className="text-[11px] sm:text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1" role="status" aria-live="polite" aria-atomic="true">
        <span>{total === 0 ? "該当なし" : `全${total}件`}</span>
        {total > 0 && (
          <span>
            {(page - 1) * PAGE_SIZE + 1}-{(page - 1) * PAGE_SIZE + pageRows.length}件
          </span>
        )}
        <span>{sort === "top" ? "人気" : "新着"}</span>
        {keywords.length > 0 && <span>キーワード: {keywords.slice(0, 6).join(" / ")}</span>}
        {filterLabels.length > 0 && <span>条件: {filterLabels.join(" / ")}</span>}
      </div>

      {pageRows.length > 0 && (
        <div className="border rounded-lg p-3 bg-white">
          <div className="text-[11px] sm:text-xs text-gray-500">人気タグ（検索ショートカット）</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {collectTopTags(pageRows, 10).map((tag) => (
              <Link
                key={tag}
                href={`/posts?${new URLSearchParams({ q: tag, level, solved: solvedFilter, page: "1" }).toString()}`}
                className="text-[11px] sm:text-xs px-2 py-1 rounded-full border bg-white hover:bg-gray-50"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasFilters && (
        <div className="text-[11px] sm:text-xs text-gray-500">
          <Link href="/posts" className="hover:underline" aria-label="条件をリセット" role="button">条件をリセット</Link>
        </div>
      )}

      <ul id="posts-list" className={`grid gap-3 sm:gap-4 md:gap-5 ${savedOnly ? "saved-only" : ""}`} data-saved-container>
        <SavedListMarker storageKey="saved:posts" containerId="posts-list" />
        {pageRows.map((p: any) => {
          const st = statsMap.get(p.id) || { answers_count: 0, solved: false };
          return (
            <li key={p.id} className="border rounded-xl p-4 bg-white hover:bg-gray-50 transition-shadow hover:shadow-sm" data-saved-item data-saved-id={String(p.id)}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <span className={`text-[11px] sm:text-xs px-2 py-1 rounded mt-1 ${st.solved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {st.solved ? "解決" : "未解決"}
                  </span>
                  {st.answers_count === 0 && (
                    <span className="text-[11px] sm:text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                      未回答
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <Link href={`/posts/${p.id}`} className="font-medium text-[15px] sm:text-base hover:underline">
                      <InlineMathText text={p.title} highlightTerms={keywords} />
                      <span className="saved-badge ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">保存</span>
                      {sort === "top" && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px]">人気</span>
                      )}
                    </Link>
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                      <LocalSaveButton storageKey="saved:posts" value={p.id} />
                      <CopyLinkButton href={`/posts/${p.id}`} />
                    </div>
                  </div>
                  <div className="text-[11px] sm:text-sm text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                    <span>{new Date(p.created_at).toLocaleString()}</span>
                    <span>レベル:{p.level}</span>
                    <span>回答数: {st.answers_count}</span>
                    {typeof p.score === "number" && terms.length > 0 && <span>関連度: {p.score}</span>}
                    {isNew(p.created_at) && <span className="text-emerald-700">NEW</span>}
                  </div>
                  {Array.isArray(p.tags) && p.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                      {p.tags.slice(0, 3).map((tag: string) => (
                        <Link
                          key={tag}
                          href={`/posts?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                          className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          {tag}
                        </Link>
                      ))}
                      <TagOverflowDetails
                        storageKey={`posts:tags-open:${p.id}`}
                        tags={p.tags}
                        hrefBase="/posts"
                        queryKey="q"
                        pageKey="page"
                        forceOpen={forceOpen}
                      />
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-xs">
                    <Link href={`/posts/${p.id}#comments`} className="text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">コメントへ</Link>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {pageRows.length === 0 && (
          <li className="text-[11px] sm:text-sm text-gray-500 py-2 space-y-2" role="status" aria-live="polite">
            <div>該当する質問がありません。</div>
            <Link href="/posts/new" className="text-blue-700 hover:underline">新規質問を作成</Link>
          </li>
        )}
        <li className="text-[11px] sm:text-sm text-gray-500 hidden" data-saved-empty>保存済みの質問がありません。</li>
      </ul>

      <Pager page={page} total={total} pageSize={PAGE_SIZE} hrefBase="/posts" query={pagerQuery} />
    </div>
  );
}

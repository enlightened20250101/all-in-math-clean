import type { Metadata } from "next";
// app/threads/page.tsx
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
  title: "スレッド一覧 | オルマ",
  description:
    "数学の質問・議論スレッドを一覧で検索。タグや並び替えで学習テーマを探せます。",
  openGraph: {
    title: "スレッド一覧 | オルマ",
    description:
      "数学の質問・議論スレッドを一覧で検索。タグや並び替えで学習テーマを探せます。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "スレッド一覧 | オルマ",
    description:
      "数学の質問・議論スレッドを一覧で検索。タグや並び替えで学習テーマを探せます。",
  },
};


const PAGE_SIZE = 20;
type Tab = "hot" | "top7d" | "new";

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

function getThreadRepliesCount(row: any) {
  return (
    row?.replies_count ??
    row?.comments_count ??
    row?.posts_count ??
    row?.replies ??
    row?.count ??
    0
  );
}

function getThreadLastActivity(row: any) {
  return (
    row?.last_post_at ??
    row?.last_reply_at ??
    row?.last_comment_at ??
    row?.updated_at ??
    null
  );
}

 

async function fetchHot(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  const { data: hot } = await sb
    .from("thread_hot")
    .select("thread_id, hot_score")
    .order("hot_score", { ascending: false })
    .range(from, to);

  const ids = (hot ?? []).map((h) => h.thread_id);
  if (!ids.length) return [];
  let rows: any[] | null = null;
  ({ data: rows } = await sb
    .from("threads")
    .select("id,title,slug,created_at,tags")
    .in("id", ids));
  if (!rows) {
    const fb = await sb.from("threads").select("id,title,slug,created_at").in("id", ids);
    rows = fb.data ?? [];
  }
  const map = new Map((rows ?? []).map((r) => [r.id, r]));
  return (hot ?? []).map((h) => ({ ...(map.get(h.thread_id) || {}), score: Number(h.hot_score) })).filter((r) => r?.id);
}

async function fetchTop7d(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  const { data: top } = await sb
    .from("thread_top_7d")
    .select("thread_id, replies_7d, last_post_at")
    .order("replies_7d", { ascending: false })
    .range(from, to);

  const ids = (top ?? []).map((t) => t.thread_id);
  if (!ids.length) return [];
  let rows: any[] | null = null;
  ({ data: rows } = await sb
    .from("threads")
    .select("id,title,slug,created_at,tags")
    .in("id", ids));
  if (!rows) {
    const fb = await sb.from("threads").select("id,title,slug,created_at").in("id", ids);
    rows = fb.data ?? [];
  }
  const map = new Map((rows ?? []).map((r) => [r.id, r]));
  return (top ?? []).map((t) => ({ ...(map.get(t.thread_id) || {}), score: Number(t.replies_7d) })).filter((r) => r?.id);
}

async function fetchNew(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  let rows: any[] | null = null;
  ({ data: rows } = await sb
    .from("threads")
    .select("id,title,slug,created_at,tags")
    .order("created_at", { ascending: false })
    .range(from, to));
  if (!rows) {
    const fb = await sb.from("threads").select("id,title,slug,created_at").order("created_at", { ascending: false }).range(from, to);
    rows = fb.data ?? [];
  }
  return rows ?? [];
}

// 検索：タイトル＋タグ＋“最初の本文（thread_first_posts）”を OR → 関連度順
async function searchThreads(sb: ReturnType<typeof supabaseServerPublic>, q: string, page: number, pageSize: number) {
  const terms = splitTerms(q);
  if (!terms.length) return { total: 0, items: [] as any[] };

  // タイトル/タグでOR
  const conds: string[] = [];
  for (const t of terms) {
    const safe = t.replace(/[{},]/g, "");
    conds.push(`title.ilike.%${safe}%`, `tags.cs.{${safe}}`);
  }
  let byTitleTags: any[] = [];
  let res: any = await sb.from("threads").select("id,title,slug,created_at,tags").or(conds.join(",")).limit(800);
  if (res.error) {
    // タグ列が無い場合にフォールバック
    const noTags = conds.filter((c) => !c.startsWith("tags.cs."));
    res = await sb.from("threads").select("id,title,slug,created_at").or(noTags.join(",")).limit(800);
  }
  byTitleTags = res.data ?? [];

  // 最初の本文（thread_first_posts.view）もOR
  const bodyConds: string[] = [];
  for (const t of terms) bodyConds.push(`body_md.ilike.%${t.replace(/[{},]/g, "")}%`);
  const { data: byBody } = await sb.from("thread_first_posts").select("thread_id, body_md").or(bodyConds.join(",")).limit(800);

  // 統合 & 関連度スコア
  const idSet = new Set<number>(byTitleTags.map((r) => r.id));
  (byBody ?? []).forEach((r: any) => idSet.add(r.thread_id));
  const ids = Array.from(idSet);
  if (!ids.length) return { total: 0, items: [] };

  const { data: refetch } = await sb.from("threads").select("id,title,slug,created_at,tags").in("id", ids);
  const bodyMap = new Map((byBody ?? []).map((r: any) => [r.thread_id, r.body_md || ""]));

  const scored = (refetch ?? []).map((r: any) => {
    const text = `${r.title || ""} ${(r.tags || []).join(" ")} ${bodyMap.get(r.id) || ""}`.toLowerCase();
    const score = terms.reduce((acc, t) => (text.includes(t.toLowerCase()) ? acc + 1 : acc), 0);
    return { ...r, score };
  });
  scored.sort((a, b) => b.score - a.score || +new Date(b.created_at) - +new Date(a.created_at));

  const total = scored.length;
  const start = (page - 1) * pageSize;
  const items = scored.slice(start, start + pageSize);
  return { total, items };
}

export default async function ThreadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; q?: string; saved?: string; tags?: string }>;
}) {
  const sp = await searchParams;
  const tab = (sp.tab || "hot") as Tab;
  const page = Math.max(1, Number(sp.page || "1"));
  const q = (sp.q || "").trim();
  const forceOpen = sp.tags === "open";
  const savedOnly = sp.saved === "1";
  const tabLabelBase = tab === "hot" ? "Hot" : tab === "top7d" ? "週間Top" : "新着";
  const hasFilters = !!q || savedOnly || forceOpen || tab !== "hot";
  const filterLabels: string[] = [];
  if (savedOnly) filterLabels.push("保存のみ");
  if (forceOpen) filterLabels.push("タグ展開");
  if (tab !== "hot") filterLabels.push(`タブ:${tabLabelBase}`);

  const sb = supabaseServerPublic();
  let serverError: string | null = null;

  if (q) {
    let total = 0;
    let items: any[] = [];
    try {
      const result = await searchThreads(sb, q, page, PAGE_SIZE);
      total = result.total;
      items = result.items;
    } catch (e) {
      serverError = "取得に失敗しました。しばらくして再試行してください。";
      total = 0;
      items = [];
    }
    const pagerParams = new URLSearchParams();
    pagerParams.set("q", q);
    if (savedOnly) pagerParams.set("saved", "1");
    const pagerQuery = pagerParams.toString();
    const ids = items.map((t: any) => t.id);
    let statsMap = new Map<number, { count: number; last?: string | null }>();
    if (ids.length && !serverError) {
      try {
        const { data, error } = await sb.from("thread_stats")
          .select("thread_id,replies_count,comments_count,posts_count,replies,count,last_post_at,last_reply_at,last_comment_at,updated_at")
          .in("thread_id", ids);
        if (!error && data) {
          statsMap = new Map(data.map((r: any) => [r.thread_id, { count: getThreadRepliesCount(r), last: getThreadLastActivity(r) }]));
        }
      } catch {
        serverError = serverError ?? "取得に失敗しました。しばらくして再試行してください。";
      }
    }
    const keywords = splitTerms(q);
    const qs = new URLSearchParams({ q, page: String(page) }).toString();
    const startIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endIdx = total === 0 ? 0 : startIdx + items.length - 1;
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">掲示板検索</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">タイトル・タグ・本文（最初の投稿）を横断検索</div>
        </div>
        <Link href="/threads" className="text-[11px] sm:text-sm text-blue-700 hover:underline">⬅ 一覧に戻る</Link>
      </div>
        {serverError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        <form className="flex flex-col gap-2 sm:flex-row" aria-label="スレッド検索フォーム" role="search" method="get">
          <input
            name="q"
            defaultValue={q}
            className="border border-slate-200/80 rounded px-3 py-2 flex-1 text-[12px] sm:text-sm"
            placeholder="タイトル・タグ・本文をOR検索"
            aria-label="スレッド検索"
          />
          <button className="border border-slate-200/80 rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50" aria-label="検索を実行">検索</button>
          {q && (
            <Link href="/threads" className="border border-slate-200/80 rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50 text-center">
              クリア
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          {forceOpen ? (
            <Link href={`/threads?${qs}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              タグを折りたたむ
            </Link>
          ) : (
            <Link href={`/threads?${qs}&tags=open`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              タグを一括展開
            </Link>
          )}
          {hasFilters && (
            <Link href="/threads" className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50" aria-label="条件をクリア" role="button">
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
          {total > 0 && <span>{startIdx}-{endIdx}件</span>}
          {keywords.length > 0 && <span>キーワード: {keywords.slice(0, 6).join(" / ")}</span>}
          {filterLabels.length > 0 && <span>条件: {filterLabels.join(" / ")}</span>}
        </div>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs" role="status" aria-live="polite" aria-atomic="true">
          {savedOnly ? (
            <Link href={`/threads?${new URLSearchParams({ q, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              すべて
            </Link>
          ) : (
            <Link href={`/threads?${new URLSearchParams({ q, page: String(page), saved: "1" }).toString()}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              保存のみ
            </Link>
          )}
        </div>

        {items.length > 0 && (
          <div className="border border-slate-200/80 rounded-lg p-3 bg-white">
            <div className="text-[11px] sm:text-xs text-gray-500">タグで絞り込み</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {collectTopTags(items, 10).map((tag) => (
                <Link
                  key={tag}
                  href={`/threads?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
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
            <Link href="/threads" className="hover:underline" aria-label="条件をリセット" role="button">条件をリセット</Link>
          </div>
        )}

        <ul id="threads-search-list" className={`grid gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 ${savedOnly ? "saved-only" : ""}`} data-saved-container>
          <SavedListMarker storageKey="saved:threads" containerId="threads-search-list" />
          {items.map((t: any) => (
            <li key={t.id} className="border border-slate-200/80 rounded-xl p-4 bg-white hover:bg-gray-50 transition-shadow hover:shadow-sm" data-saved-item data-saved-id={t.slug}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <Link className="font-medium text-[15px] sm:text-base hover:underline" href={`/threads/${t.slug}`}>
                  <InlineMathText text={t.title} highlightTerms={keywords} />
                  <span className="saved-badge ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">保存</span>
                </Link>
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <LocalSaveButton storageKey="saved:threads" value={t.slug} />
                  <CopyLinkButton href={`/threads/${t.slug}`} />
                </div>
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                <span>{dayjs(t.created_at).format("YYYY/MM/DD HH:mm")}</span>
                <span>関連度 {t.score}</span>
                {isNew(t.created_at) && <span className="text-emerald-700">NEW</span>}
                {(() => {
                  const count = statsMap.get(t.id)?.count ?? 0;
                  return count > 0 ? <span>返信 {count}</span> : null;
                })()}
                {(() => {
                  const last = statsMap.get(t.id)?.last;
                  return last ? <span>最終更新 {dayjs(last).format("MM/DD")}</span> : null;
                })()}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-xs">
                <Link href={`/threads/${t.slug}#latest`} className="text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">最新へ</Link>
                <Link href={`/threads/${t.slug}#comments`} className="text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">コメントへ</Link>
              </div>
              {Array.isArray(t.tags) && t.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                  {t.tags.slice(0, 3).map((tag: string) => (
                    <Link
                      key={tag}
                      href={`/threads?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {tag}
                    </Link>
                  ))}
                  <TagOverflowDetails
                    storageKey={`threads:tags-open:${t.id}`}
                    tags={t.tags}
                    hrefBase="/threads"
                    queryKey="q"
                    pageKey="page"
                    forceOpen={forceOpen}
                  />
                </div>
              )}
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-[11px] sm:text-sm text-gray-500 space-y-2" role="status" aria-live="polite">
              <div>該当するスレッドが見つかりませんでした。</div>
              <Link href="/threads/new" className="text-blue-700 hover:underline">新規スレッドを作成</Link>
            </li>
          )}
          <li className="text-[11px] sm:text-sm text-gray-500 hidden" data-saved-empty>保存済みのスレッドがありません。</li>
        </ul>

        <Pager page={page} total={total} pageSize={PAGE_SIZE} hrefBase="/threads" query={pagerQuery} />
      </div>
    );
  }

  // 一覧モード（Hot/週間Top/新着）
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let totalFallback = 0;
  let rows: any[] = [];
  let weeklyTop: any[] = [];
  let statsMap = new Map<number, { count: number; last?: string | null }>();
  try {
    const { count } = await sb.from("threads").select("id", { count: "exact", head: true });
    totalFallback = count ?? 0;
    if (tab === "hot") rows = await fetchHot(sb, from, to);
    else if (tab === "top7d") rows = await fetchTop7d(sb, from, to);
    else rows = await fetchNew(sb, from, to);
    weeklyTop = tab === "top7d" ? [] : await fetchTop7d(sb, 0, 4);
    const ids = rows.map((t: any) => t.id);
    if (ids.length) {
      const { data, error } = await sb.from("thread_stats")
        .select("thread_id,replies_count,comments_count,posts_count,replies,count,last_post_at,last_reply_at,last_comment_at,updated_at")
        .in("thread_id", ids);
      if (!error && data) {
        statsMap = new Map(data.map((r: any) => [r.thread_id, { count: getThreadRepliesCount(r), last: getThreadLastActivity(r) }]));
      }
    }
  } catch {
    serverError = "取得に失敗しました。しばらくして再試行してください。";
    totalFallback = 0;
    rows = [];
    weeklyTop = [];
    statsMap = new Map();
  }

  const tabLabel = tabLabelBase;

  const pagerParams = new URLSearchParams();
  if (tab) pagerParams.set("tab", tab);
  if (savedOnly) pagerParams.set("saved", "1");
  const pagerQuery = pagerParams.toString();

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">Threads</div>
            <h1 className="mt-2 text-xl sm:text-2xl font-semibold">掲示板</h1>
            <div className="text-[11px] sm:text-sm text-white/95 mt-1">質問・相談・共有のスレッド</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
            <Link
              href="/threads/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 border border-white/25 px-5 py-2.5 text-xs sm:text-sm text-white hover:bg-white/25 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                NEW
              </span>
              新規スレッド
            </Link>
            <div className="flex gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap w-full sm:w-auto">
              <Link
                href="/threads?tab=hot"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${
                  tab === "hot" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                Hot
              </Link>
              <Link
                href="/threads?tab=top7d"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${
                  tab === "top7d" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                週間Top
              </Link>
              <Link
                href="/threads?tab=new"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${
                  tab === "new" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
              >
                新着
              </Link>
            </div>
          </div>
        </div>
      </div>
      {serverError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
          {serverError}
        </div>
      ) : null}

      {/* 同ページ検索（q を付けて再読み込み） */}
      <form className="flex flex-col gap-2 sm:flex-row rounded-[28px] border bg-white/90 p-4 sm:p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur" aria-label="スレッド検索フォーム" role="search" method="get">
        <input
          name="q"
          className="border border-slate-200/80 rounded-full px-4 py-2.5 flex-1 text-[12px] sm:text-sm"
          placeholder="🔍 タイトル・タグ・本文（最初の投稿）で検索"
          aria-label="スレッド検索"
        />
        <button className="border border-slate-200/80 rounded-full px-5 py-2.5 text-[12px] sm:text-sm bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto" aria-label="検索を実行">検索</button>
        {q && (
          <Link href="/threads" className="border border-slate-200/80 rounded-full px-5 py-2.5 text-[12px] sm:text-sm bg-white hover:bg-gray-50 text-center transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto">
            クリア
          </Link>
        )}
      </form>

      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
        {forceOpen ? (
          <Link href={`/threads?${new URLSearchParams({ tab, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            タグを折りたたむ
          </Link>
        ) : (
          <Link href={`/threads?${new URLSearchParams({ tab, page: String(page), tags: "open" }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            タグを一括展開
          </Link>
        )}
        {hasFilters && (
          <Link href="/threads" className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner" aria-label="条件をクリア" role="button">
            条件をクリア
          </Link>
        )}
        {hasFilters && (
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700" aria-label="フィルタ適用中">
            フィルタ中
          </span>
        )}
      </div>

      <div className="text-[11px] sm:text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1" role="status" aria-live="polite" aria-atomic="true">
        <span>{tabLabel}</span>
        <span>{totalFallback ?? 0}件</span>
        {totalFallback && totalFallback > 0 && (
          <span>
            {(page - 1) * PAGE_SIZE + 1}-{(page - 1) * PAGE_SIZE + rows.length}件
          </span>
        )}
        {filterLabels.length > 0 && <span>条件: {filterLabels.join(" / ")}</span>}
      </div>

      {weeklyTop.length > 0 && (
        <section className="rounded-[32px] bg-gradient-to-br from-slate-50 via-white to-sky-50 p-[1px] shadow-[0_18px_50px_-32px_rgba(15,23,42,0.25)]">
          <div className="rounded-[31px] bg-white/95 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] sm:text-sm text-gray-600">週間Top</div>
              <Link href="/threads?tab=top7d" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
                もっと見る
              </Link>
            </div>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {weeklyTop.map((t: any) => (
                <li key={t.id} className="border border-slate-200/80 rounded-2xl px-3 py-2.5 bg-white/95 hover:bg-gray-50 transition">
                  <Link href={`/threads/${t.slug}`} className="text-[11px] sm:text-sm font-medium hover:underline">
                    {t.title}
                  </Link>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {dayjs(t.created_at).format("YYYY/MM/DD HH:mm")}
                    {(() => {
                      const count = statsMap.get(t.id)?.count ?? 0;
                      return count > 0 ? <span className="ml-2">返信 {count}</span> : null;
                    })()}
                    {(() => {
                      const last = statsMap.get(t.id)?.last;
                      return last ? <span className="ml-2">最終更新 {dayjs(last).format("MM/DD")}</span> : null;
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <div className="rounded-[28px] border bg-white/95 p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="text-[11px] sm:text-xs text-gray-500">タグで絞り込み</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {collectTopTags(rows, 10).map((tag) => (
              <Link
                key={tag}
                href={`/threads?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                className="text-[11px] sm:text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasFilters && (
        <div className="text-[11px] sm:text-xs text-gray-500">
          <Link href="/threads" className="hover:underline" aria-label="条件をリセット" role="button">条件をリセット</Link>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
        {savedOnly ? (
          <Link href={`/threads?${new URLSearchParams({ tab, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            すべて
          </Link>
        ) : (
          <Link href={`/threads?${new URLSearchParams({ tab, page: String(page), saved: "1" }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            保存のみ
          </Link>
        )}
      </div>

      <ul id="threads-list" className={`grid gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 ${savedOnly ? "saved-only" : ""}`} data-saved-container>
        <SavedListMarker storageKey="saved:threads" containerId="threads-list" />
        {rows.length === 0 && <li className="text-[11px] sm:text-sm text-gray-500">まだスレッドがありません。</li>}
        {rows.map((t: any) => (
          <li key={t.id} className="border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md transition" data-saved-item data-saved-id={t.slug}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <Link href={`/threads/${t.slug}`} className="font-medium text-[15px] sm:text-base hover:underline">
                <InlineMathText text={t.title} />
                <span className="saved-badge ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">保存</span>
              </Link>
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <LocalSaveButton storageKey="saved:threads" value={t.slug} />
                <CopyLinkButton href={`/threads/${t.slug}`} />
              </div>
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
              <span>{dayjs(t.created_at).format("YYYY/MM/DD HH:mm")}</span>
              {"score" in t && <span>🔥 {Number(t.score).toFixed(2)}</span>}
              {isNew(t.created_at) && <span className="text-emerald-700">NEW</span>}
              {(() => {
                const count = statsMap.get(t.id)?.count ?? 0;
                return count > 0 ? <span>返信 {count}</span> : null;
              })()}
              {(() => {
                const last = statsMap.get(t.id)?.last;
                return last ? <span>最終更新 {dayjs(last).format("MM/DD")}</span> : null;
              })()}
            </div>
            <div className="mt-2 grid gap-2 text-[11px] sm:text-xs sm:flex sm:flex-wrap">
              <Link href={`/threads/${t.slug}#latest`} className="text-blue-700 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition active:scale-[0.98] active:shadow-inner text-center w-full sm:w-auto">最新へ</Link>
              <Link href={`/threads/${t.slug}#comments`} className="text-blue-700 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition active:scale-[0.98] active:shadow-inner text-center w-full sm:w-auto">コメントへ</Link>
            </div>
            {Array.isArray(t.tags) && t.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                {t.tags.slice(0, 3).map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/threads?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition active:scale-[0.98] active:shadow-inner"
                  >
                    {tag}
                  </Link>
                ))}
                <TagOverflowDetails
                  storageKey={`threads:tags-open:${t.id}`}
                  tags={t.tags}
                  hrefBase="/threads"
                  queryKey="q"
                  pageKey="page"
                  forceOpen={forceOpen}
                />
              </div>
            )}
          </li>
        ))}
        <li className="text-[11px] sm:text-sm text-gray-500 hidden" data-saved-empty>保存済みのスレッドがありません。</li>
      </ul>

      <Pager page={page} total={totalFallback ?? 0} pageSize={PAGE_SIZE} hrefBase="/threads" query={pagerQuery} />
    </div>
  );
}

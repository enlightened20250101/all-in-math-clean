// app/articles/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import dayjs from "dayjs";
import { supabaseServerPublic } from "@/lib/supabaseServerPublic";
import Pager from "@/components/Pager";
import CopyLinkButton from "@/components/CopyLinkButton";
import LocalSaveButton from "@/components/LocalSaveButton";
import SavedListMarker from "@/components/SavedListMarker";
import TagOverflowDetails from "@/components/TagOverflowDetails";
import InlineMathText from "@/components/InlineMathText";

const PAGE_SIZE = 20;
type Tab = "hot" | "top7d" | "new";

export const metadata: Metadata = {
  title: "数学記事",
  description:
    "オルマの数学記事一覧。高校数学から大学受験まで、解説・証明・考え方を日本語でわかりやすくまとめています。",
  openGraph: {
    title: "数学記事",
    description:
      "オルマの数学記事一覧。高校数学から大学受験まで、解説・証明・考え方を日本語でわかりやすくまとめています。",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "数学記事",
    description:
      "オルマの数学記事一覧。高校数学から大学受験まで、解説・証明・考え方を日本語でわかりやすくまとめています。",
  },
};

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

function getArticleCommentsCount(row: any) {
  return row?.comments_count ?? row?.comment_count ?? row?.count ?? row?.total ?? 0;
}

function getArticleLastActivity(row: any) {
  return row?.last_comment_at ?? row?.last_activity_at ?? row?.updated_at ?? null;
}

 

/* ---------- Hot / Top / New 取得（タグ列が無くても落ちない） ---------- */
async function fetchHot(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  const { data: hot } = await sb
    .from("article_hot")
    .select("article_id, hot_score")
    .order("hot_score", { ascending: false })
    .range(from, to);

  const ids = (hot ?? []).map((h) => h.article_id);
  if (!ids.length) return [];

  let arts: any[] | null = null;
  let err: any = null;
  ({ data: arts, error: err } = await sb
    .from("articles")
    .select("id,title,slug,created_at,tags")
    .in("id", ids));
  if (err) {
    const fb = await sb.from("articles").select("id,title,slug,created_at").in("id", ids);
    arts = fb.data ?? [];
  }
  const map = new Map((arts ?? []).map((a) => [a.id, a]));
  return (hot ?? [])
    .map((h) => ({ ...(map.get(h.article_id) || {}), score: Number(h.hot_score) }))
    .filter((r) => r?.id);
}

async function fetchTop7d(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  const { data: top } = await sb
    .from("article_top_7d")
    .select("article_id, comments_7d, last_comment_at")
    .order("comments_7d", { ascending: false })
    .range(from, to);

  const ids = (top ?? []).map((t) => t.article_id);
  if (!ids.length) return [];

  let arts: any[] | null = null;
  let err: any = null;
  ({ data: arts, error: err } = await sb
    .from("articles")
    .select("id,title,slug,created_at,tags")
    .in("id", ids));
  if (err) {
    const fb = await sb.from("articles").select("id,title,slug,created_at").in("id", ids);
    arts = fb.data ?? [];
  }
  const map = new Map((arts ?? []).map((a) => [a.id, a]));
  return (top ?? [])
    .map((t) => ({ ...(map.get(t.article_id) || {}), score: Number(t.comments_7d) }))
    .filter((r) => r?.id);
}

async function fetchNew(sb: ReturnType<typeof supabaseServerPublic>, from: number, to: number) {
  let rows: any[] | null = null;
  let err: any = null;
  ({ data: rows, error: err } = await sb
    .from("articles")
    .select("id,title,slug,created_at,tags")
    .order("created_at", { ascending: false })
    .range(from, to));
  if (err) {
    const fb = await sb
      .from("articles")
      .select("id,title,slug,created_at")
      .order("created_at", { ascending: false })
      .range(from, to);
    rows = fb.data ?? [];
  }
  return rows ?? [];
}

/* ---------- 検索（タイトル＋本文＋タグの OR）→ 関連度順 ---------- */
async function searchArticles(
  sb: ReturnType<typeof supabaseServerPublic>,
  q: string,
  page: number,
  pageSize: number
) {
  const terms = splitTerms(q);
  if (!terms.length) return { total: 0, items: [] as any[] };

  const conds: string[] = [];
  for (const t of terms) {
    const safe = t.replace(/[{},]/g, "");
    conds.push(`title.ilike.%${safe}%`, `body_mdx.ilike.%${safe}%`, `tags.cs.{${safe}}`);
  }

  // tags ありで試行 → 失敗時は tags を外す
  let res: any = await sb
    .from("articles")
    .select("id,title,slug,created_at,tags,body_mdx")
    .or(conds.join(","))
    .limit(800);
  if (res.error) {
    const noTags = conds.filter((c) => !c.startsWith("tags.cs."));
    res = await sb
      .from("articles")
      .select("id,title,slug,created_at,body_mdx")
      .or(noTags.join(","))
      .limit(800);
  }
  const rows = res.data ?? [];

  const scored = rows.map((a: any) => {
    const text = `${a.title || ""} ${(a.tags || []).join(" ")} ${a.body_mdx || ""}`.toLowerCase();
    const score = terms.reduce((acc, t) => (text.includes(t.toLowerCase()) ? acc + 1 : acc), 0);
    return { ...a, score };
  });

  scored.sort(
    (a: any, b: any) => b.score - a.score || +new Date(b.created_at) - +new Date(a.created_at)
  );

  const total = scored.length;
  const start = (page - 1) * pageSize;
  const items = scored.slice(start, start + pageSize);
  return { total, items };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string; q?: string; saved?: string; tags?: string }>;
}) {
  const sp = await searchParams;
  const tab = (sp.tab || "hot") as Tab;
  const page = Math.max(1, Number(sp.page || "1"));
  const q = (sp.q || "").trim();
  const savedOnly = sp.saved === "1";
  const forceOpen = sp.tags === "open";
  const tabLabelBase = tab === "hot" ? "Hot" : tab === "top7d" ? "週間Top" : "新着";
  const hasFilters = !!q || savedOnly || forceOpen || tab !== "hot";
  const filterLabels: string[] = [];
  if (savedOnly) filterLabels.push("保存のみ");
  if (forceOpen) filterLabels.push("タグ展開");
  if (tab !== "hot") filterLabels.push(`タブ:${tabLabelBase}`);

  const sb = supabaseServerPublic();
  let serverError: string | null = null;

  // 検索モード
  if (q) {
    let total = 0;
    let items: any[] = [];
    try {
      const result = await searchArticles(sb, q, page, PAGE_SIZE);
      total = result.total;
      items = result.items;
    } catch {
      serverError = "取得に失敗しました。しばらくして再試行してください。";
      total = 0;
      items = [];
    }
    const pagerParams = new URLSearchParams();
    pagerParams.set("q", q);
    if (savedOnly) pagerParams.set("saved", "1");
    const pagerQuery = pagerParams.toString();
    const keywords = splitTerms(q);
    const ids = items.map((a: any) => a.id);
    let statsMap = new Map<number, { count: number; last?: string | null }>();
    if (ids.length && !serverError) {
      try {
        const { data, error } = await sb.from("article_comment_stats")
          .select("article_id,comments_count,comment_count,count,total,last_comment_at,last_activity_at,updated_at")
          .in("article_id", ids);
        if (!error && data) {
          statsMap = new Map(data.map((r: any) => [r.article_id, { count: getArticleCommentsCount(r), last: getArticleLastActivity(r) }]));
        }
      } catch {
        serverError = serverError ?? "取得に失敗しました。しばらくして再試行してください。";
      }
    }

    const qs = new URLSearchParams({ q, page: String(page) }).toString();
    const startIdx = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endIdx = total === 0 ? 0 : startIdx + items.length - 1;
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">記事検索</h1>
            <div className="text-[11px] sm:text-sm text-gray-500 mt-1">タイトル・本文・タグを横断検索</div>
          </div>
          <Link href="/articles" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
            ⬅ 一覧に戻る
          </Link>
        </div>
        {serverError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] sm:text-sm text-rose-700">
            {serverError}
          </div>
        ) : null}

        {/* 検索フォーム（同ページ） */}
        <form className="flex flex-col gap-2 sm:flex-row" aria-label="記事検索フォーム" role="search" method="get">
          <input
            name="q"
            defaultValue={q}
            className="border border-slate-200/80 rounded px-3 py-2 flex-1 text-[12px] sm:text-sm"
            placeholder="タイトル・本文・タグ（OR検索・関連度順）"
            aria-label="記事検索"
          />
          <button className="border border-slate-200/80 rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50" aria-label="検索を実行">検索</button>
          {q && (
            <Link href="/articles" className="border border-slate-200/80 rounded px-4 py-2 text-[12px] sm:text-sm bg-white hover:bg-gray-50 text-center">
              クリア
            </Link>
          )}
        </form>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          {forceOpen ? (
            <Link href={`/articles?${qs}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              タグを折りたたむ
            </Link>
          ) : (
            <Link href={`/articles?${qs}&tags=open`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              タグを一括展開
            </Link>
          )}
          {hasFilters && (
            <Link href="/articles" className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50" aria-label="条件をクリア" role="button">
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

        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          {savedOnly ? (
            <Link href={`/articles?${new URLSearchParams({ q, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
              すべて
            </Link>
          ) : (
            <Link href={`/articles?${new URLSearchParams({ q, page: String(page), saved: "1" }).toString()}`} className="border border-slate-200/80 rounded px-2 py-1 bg-white hover:bg-gray-50">
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
                href={`/articles?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
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
          <Link href="/articles" className="hover:underline" aria-label="条件をリセット" role="button">条件をリセット</Link>
        </div>
      )}

        <ul id="articles-search-list" className={`grid gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 ${savedOnly ? "saved-only" : ""}`} data-saved-container>
          <SavedListMarker storageKey="saved:articles" containerId="articles-search-list" />
          {items.map((a: any) => (
            <li key={a.id} className="border border-slate-200/80 rounded-xl p-4 bg-white hover:bg-gray-50 transition-shadow hover:shadow-sm" data-saved-item data-saved-id={a.slug}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <Link href={`/articles/${a.slug}`} className="font-medium text-[15px] sm:text-base hover:underline">
                  <InlineMathText text={a.title} highlightTerms={keywords} />
                  <span className="saved-badge ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">保存</span>
                </Link>
                <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                  <LocalSaveButton storageKey="saved:articles" value={a.slug} />
                  <CopyLinkButton href={`/articles/${a.slug}`} />
                </div>
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                <span>{dayjs(a.created_at).format("YYYY/MM/DD HH:mm")}</span>
                <span>関連度 {a.score}</span>
                {isNew(a.created_at) && <span className="text-emerald-700">NEW</span>}
                {(() => {
                  const count = statsMap.get(a.id)?.count ?? 0;
                  return count > 0 ? <span>コメント {count}</span> : null;
                })()}
                {(() => {
                  const last = statsMap.get(a.id)?.last;
                  return last ? <span>最終更新 {dayjs(last).format("MM/DD")}</span> : null;
                })()}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-xs">
                <Link href={`/articles/${a.slug}#comments`} className="text-blue-700 hover:underline px-2 py-1 rounded bg-slate-50 border border-slate-100">コメントへ</Link>
              </div>
              {Array.isArray(a.tags) && a.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                  {a.tags.slice(0, 3).map((t: string) => (
                    <Link
                      key={t}
                      href={`/articles?${new URLSearchParams({ q: t, page: "1" }).toString()}`}
                      className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {t}
                    </Link>
                  ))}
                  <TagOverflowDetails
                    storageKey={`articles:tags-open:${a.id}`}
                    tags={a.tags}
                    hrefBase="/articles"
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
              <div>該当する記事が見つかりませんでした。</div>
              <Link href="/articles/new" className="text-blue-700 hover:underline">新規記事を作成</Link>
            </li>
          )}
          <li className="text-[11px] sm:text-sm text-gray-500 hidden" data-saved-empty>保存済みの記事がありません。</li>
        </ul>

        <Pager
          page={page}
          total={total}
          pageSize={PAGE_SIZE}
          hrefBase="/articles"
          query={pagerQuery}
        />
      </div>
    );
  }

  // 一覧モード（Hot / 週間Top / 新着）
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let totalFallback = 0;
  let rows: any[] = [];
  let weeklyTop: any[] = [];
  let statsMap = new Map<number, { count: number; last?: string | null }>();
  try {
    const { count } = await sb
      .from("articles")
      .select("id", { count: "exact", head: true });
    totalFallback = count ?? 0;
    if (tab === "hot") rows = await fetchHot(sb, from, to);
    else if (tab === "top7d") rows = await fetchTop7d(sb, from, to);
    else rows = await fetchNew(sb, from, to);
    weeklyTop = tab === "top7d" ? [] : await fetchTop7d(sb, 0, 4);
    const ids = rows.map((a: any) => a.id);
    if (ids.length) {
      const { data, error } = await sb.from("article_comment_stats")
        .select("article_id,comments_count,comment_count,count,total,last_comment_at,last_activity_at,updated_at")
        .in("article_id", ids);
      if (!error && data) {
        statsMap = new Map(data.map((r: any) => [r.article_id, { count: getArticleCommentsCount(r), last: getArticleLastActivity(r) }]));
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
      {/* ヘッダー + タブ + 検索フォーム */}
      <div className="relative overflow-hidden rounded-[28px] border chalkboard text-white p-6 sm:p-7 shadow-xl ring-1 ring-white/10">
        <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-white/6 blur-3xl" />
        <div className="absolute -bottom-24 -left-8 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.28em] text-white/95">Articles</div>
            <h1 className="mt-2 text-xl sm:text-2xl font-semibold">記事</h1>
            <div className="text-[11px] sm:text-sm text-white/95 mt-1">学びのまとめ・解説記事</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
            <Link href="/articles/new" className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 border border-white/25 px-5 py-2.5 text-xs sm:text-sm text-white hover:bg-white/25 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[9px] tracking-wider">
                NEW
              </span>
              新規記事
            </Link>
            <div className="flex gap-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap w-full sm:w-auto">
              <Link
                href="/articles?tab=hot"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${tab === "hot" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
              >
                Hot
              </Link>
              <Link
                href="/articles?tab=top7d"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${tab === "top7d" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
              >
                週間Top
              </Link>
              <Link
                href="/articles?tab=new"
                className={`border px-4 py-2 rounded-full transition active:scale-[0.98] active:shadow-inner ${tab === "new" ? "bg-white text-slate-900 border-white" : "bg-white/10 text-white border-white/20 hover:bg-white/20"}`}
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
      <form className="flex flex-col gap-2 sm:flex-row rounded-[28px] border bg-white/90 p-4 sm:p-5 shadow-sm ring-1 ring-slate-200/70 backdrop-blur" aria-label="記事検索フォーム" role="search" method="get">
        <input
          name="q"
          className="border border-slate-200/80 rounded-full px-4 py-2.5 flex-1 text-[12px] sm:text-sm"
          placeholder="🔍 タイトル・本文・タグで検索（OR・関連度順）"
          aria-label="記事検索"
        />
        <button className="border border-slate-200/80 rounded-full px-5 py-2.5 text-[12px] sm:text-sm bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto" aria-label="検索を実行">検索</button>
        {q && (
          <Link href="/articles" className="border border-slate-200/80 rounded-full px-5 py-2.5 text-[12px] sm:text-sm bg-white hover:bg-gray-50 text-center transition active:scale-[0.98] active:shadow-inner w-full sm:w-auto">
            クリア
          </Link>
        )}
      </form>

      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
        {forceOpen ? (
          <Link href={`/articles?${new URLSearchParams({ tab, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            タグを折りたたむ
          </Link>
        ) : (
          <Link href={`/articles?${new URLSearchParams({ tab, page: String(page), tags: "open" }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            タグを一括展開
          </Link>
        )}
        {hasFilters && (
          <Link href="/articles" className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner" aria-label="条件をクリア" role="button">
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
              <Link href="/articles?tab=top7d" className="text-[11px] sm:text-sm text-blue-700 hover:underline">
                もっと見る
              </Link>
            </div>
            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
              {weeklyTop.map((a: any) => (
                <li key={a.id} className="border border-slate-200/80 rounded-2xl px-3 py-2.5 bg-white/95 hover:bg-gray-50 transition">
                  <Link href={`/articles/${a.slug}`} className="text-[11px] sm:text-sm font-medium hover:underline">
                    {a.title}
                  </Link>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-1">
                    {dayjs(a.created_at).format("YYYY/MM/DD HH:mm")}
                    {(() => {
                      const count = statsMap.get(a.id)?.count ?? 0;
                      return count > 0 ? <span className="ml-2">コメント {count}</span> : null;
                    })()}
                    {(() => {
                      const last = statsMap.get(a.id)?.last;
                      return last ? <span className="ml-2">最終更新 {dayjs(last).format("MM/DD")}</span> : null;
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="flex items-center gap-2 text-[11px] sm:text-xs">
        {savedOnly ? (
          <Link href={`/articles?${new URLSearchParams({ tab, page: String(page) }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            すべて
          </Link>
        ) : (
          <Link href={`/articles?${new URLSearchParams({ tab, page: String(page), saved: "1" }).toString()}`} className="border border-slate-200/80 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 transition active:scale-[0.98] active:shadow-inner">
            保存のみ
          </Link>
        )}
      </div>

      {rows.length > 0 && (
        <div className="rounded-[28px] border bg-white/95 p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="text-[11px] sm:text-xs text-gray-500">タグで絞り込み</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {collectTopTags(rows, 10).map((tag) => (
              <Link
                key={tag}
                href={`/articles?${new URLSearchParams({ q: tag, page: "1" }).toString()}`}
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
          <Link href="/articles" className="hover:underline" aria-label="条件をリセット" role="button">条件をリセット</Link>
        </div>
      )}

      {/* 一覧 */}
      <ul id="articles-list" className={`grid gap-3 sm:gap-4 md:gap-5 sm:grid-cols-2 lg:grid-cols-3 ${savedOnly ? "saved-only" : ""}`} data-saved-container>
        <SavedListMarker storageKey="saved:articles" containerId="articles-list" />
        {rows.length === 0 && (
          <li className="text-[11px] sm:text-sm text-gray-500">まだ記事がありません。</li>
        )}
        {rows.map((a: any) => (
          <li key={a.id} className="border border-slate-200/80 rounded-[28px] p-5 bg-white/95 shadow-sm ring-1 ring-slate-200/70 hover:shadow-md transition" data-saved-item data-saved-id={a.slug}>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <Link href={`/articles/${a.slug}`} className="font-medium text-[15px] sm:text-base hover:underline">
                <InlineMathText text={a.title} />
                <span className="saved-badge ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px]">保存</span>
              </Link>
              <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                <LocalSaveButton storageKey="saved:articles" value={a.slug} />
                <CopyLinkButton href={`/articles/${a.slug}`} />
              </div>
            </div>
            <div className="text-[11px] sm:text-xs text-gray-500 mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
              <span>{dayjs(a.created_at).format("YYYY/MM/DD HH:mm")}</span>
              {"score" in a && (
                <span>🔥 {Number(a.score).toFixed(2)}</span>
              )}
              {isNew(a.created_at) && <span className="text-emerald-700">NEW</span>}
              {(() => {
                const count = statsMap.get(a.id)?.count ?? 0;
                return count > 0 ? <span>コメント {count}</span> : null;
              })()}
              {(() => {
                const last = statsMap.get(a.id)?.last;
                return last ? <span>最終更新 {dayjs(last).format("MM/DD")}</span> : null;
              })()}
            </div>
            <div className="mt-2 grid gap-2 text-[11px] sm:text-xs sm:flex sm:flex-wrap">
              <Link href={`/articles/${a.slug}#comments`} className="text-blue-700 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition active:scale-[0.98] active:shadow-inner text-center w-full sm:w-auto">コメントへ</Link>
            </div>
            {Array.isArray(a.tags) && a.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] sm:text-xs">
                {a.tags.slice(0, 3).map((t: string) => (
                  <Link
                    key={t}
                    href={`/articles?${new URLSearchParams({ q: t, page: "1" }).toString()}`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full hover:bg-gray-200 transition active:scale-[0.98] active:shadow-inner"
                  >
                    {t}
                  </Link>
                ))}
                <TagOverflowDetails
                  storageKey={`articles:tags-open:${a.id}`}
                  tags={a.tags}
                  hrefBase="/articles"
                  queryKey="q"
                  pageKey="page"
                  forceOpen={forceOpen}
                />
              </div>
            )}
          </li>
        ))}
        <li className="text-[11px] sm:text-sm text-gray-500 hidden" data-saved-empty>保存済みの記事がありません。</li>
      </ul>

      <Pager
        page={page}
        total={totalFallback ?? 0}
        pageSize={PAGE_SIZE}
        hrefBase="/articles"
        query={pagerQuery}
      />
    </div>
  );
}

// components/Pager.tsx
import Link from "next/link";

export default function Pager({
  page, total, pageSize, hrefBase, query = "", pageParam = "page",
}: {
  page: number; total: number; pageSize: number;
  hrefBase: string;
  query?: string;
  pageParam?: string;
}) {
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const buildHref = (p: number) => {
    const params = new URLSearchParams(query);
    params.set(pageParam, String(p));
    const q = params.toString();
    return q ? `${hrefBase}?${q}` : hrefBase;
  };
  return (
    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:items-center sm:gap-3">
      {page > 1 && (
        <Link
          className="border rounded px-3 py-1 text-center text-[11px] sm:text-sm bg-white hover:bg-gray-50 w-full sm:w-auto"
          href={buildHref(page - 1)}
        >
          前へ
        </Link>
      )}
      <span className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-left">
        {page}/{maxPage}（全{total}件）
      </span>
      {page < maxPage && (
        <Link
          className="border rounded px-3 py-1 text-center text-[11px] sm:text-sm bg-white hover:bg-gray-50 w-full sm:w-auto"
          href={buildHref(page + 1)}
        >
          次へ
        </Link>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState, useTransition } from "react";
import ReportStatusSelect from "./ReportStatusSelect";
import ReportActionButtons from "./ReportActionButtons";
import { bulkUpdateReportStatus } from "./actions";

type ReportRow = {
  id: number;
  target_type: string;
  target_id: string;
  reason: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  linkHref?: string | null;
  linkLabel?: string | null;
};

type SortKey = created_desc | created_asc | status_open | status_resolved;

export default function AdminReportsTableClient({ rows }: { rows: ReportRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("created_desc");
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [pending, startTransition] = useTransition();

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    switch (sortKey) {
      case created_asc:
        return copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case status_open:
        return copy.sort((a, b) => (a.status === open ? -1 : 1));
      case status_resolved:
        return copy.sort((a, b) => (a.status === resolved ? 1 : -1));
      default:
        return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [rows, sortKey]);

  const selectedIds = [...selected];

  const toggleAll = () => {
    if (selected.size === sortedRows.length) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(sortedRows.map((r) => r.id)));
  };

  const toggleRow = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkUpdate = (status: string) => {
    if (!selectedIds.length || pending) return;
    startTransition(async () => {
      try {
        await bulkUpdateReportStatus(selectedIds, status);
      } finally {
        setSelected(new Set());
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">並び替え</span>
          <select
            className="rounded border px-2 py-1"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="created_desc">新しい順</option>
            <option value="created_asc">古い順</option>
            <option value="status_open">open優先</option>
            <option value="status_resolved">resolved後ろ</option>
          </select>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border px-3 py-1 text-[10px] sm:text-xs"
            onClick={toggleAll}
          >
            {selected.size === sortedRows.length ? 全解除 : 全選択}
          </button>
          <button
            type="button"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] sm:text-xs text-emerald-700 disabled:opacity-50"
            onClick={() => bulkUpdate(resolved)}
            disabled={!selectedIds.length || pending}
          >
            選択を解決
          </button>
          <button
            type="button"
            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] sm:text-xs text-amber-700 disabled:opacity-50"
            onClick={() => bulkUpdate(triage)}
            disabled={!selectedIds.length || pending}
          >
            選択を対応中
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] sm:text-xs text-slate-700 disabled:opacity-50"
            onClick={() => bulkUpdate(ignored)}
            disabled={!selectedIds.length || pending}
          >
            選択を無視
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="min-w-full text-[11px] sm:text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === sortedRows.length && sortedRows.length > 0}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">対象</th>
              <th className="px-3 py-2 text-left">リンク</th>
              <th className="px-3 py-2 text-left">理由</th>
              <th className="px-3 py-2 text-left">報告者</th>
              <th className="px-3 py-2 text-left">日時</th>
              <th className="px-3 py-2 text-left">状態</th>
              <th className="px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleRow(r.id)}
                  />
                </td>
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">
                  <div className="text-[10px] text-slate-400">{r.target_type}</div>
                  <div className="font-mono text-[11px]">{r.target_id}</div>
                </td>
                <td className="px-3 py-2">
                  {r.linkHref ? (
                    <a className="text-blue-600 underline" href={r.linkHref} target="_blank" rel="noreferrer">
                      {r.linkLabel ?? 対象}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-3 py-2 whitespace-pre-wrap">{r.reason}</td>
                <td className="px-3 py-2 font-mono text-[11px]">{r.created_by ?? "-"}</td>
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <ReportStatusSelect reportId={r.id} initialStatus={r.status} />
                </td>
                <td className="px-3 py-2">
                  <ReportActionButtons reportId={r.id} targetType={r.target_type} targetId={r.target_id} />
                </td>
              </tr>
            ))}
            {sortedRows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-slate-500">
                  通報はまだありません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

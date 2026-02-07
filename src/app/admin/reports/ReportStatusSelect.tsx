"use client";

import { useState, useTransition } from "react";
import { updateReportStatus } from "./actions";

export default function ReportStatusSelect({
  reportId,
  initialStatus,
}: {
  reportId: number;
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded border px-2 py-1 text-[11px] sm:text-xs"
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setStatus(next);
        startTransition(async () => {
          try {
            await updateReportStatus(reportId, next);
          } catch {
            setStatus(initialStatus);
          }
        });
      }}
    >
      <option value="open">open</option>
      <option value="triage">triage</option>
      <option value="resolved">resolved</option>
      <option value="ignored">ignored</option>
    </select>
  );
}

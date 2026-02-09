"use client";

import { useState, useTransition } from "react";
import { updateContactStatus } from "./actions";

export default function ContactStatusSelect({
  messageId,
  initialStatus,
}: {
  messageId: string;
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
            await updateContactStatus(messageId, next);
          } catch {
            setStatus(initialStatus);
          }
        });
      }}
    >
      <option value="new">new</option>
      <option value="in_progress">in_progress</option>
      <option value="done">done</option>
    </select>
  );
}

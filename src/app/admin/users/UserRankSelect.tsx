"use client";

import { useState, useTransition } from "react";
import { updateUserRank } from "./actions";

export default function UserRankSelect({ userId, initialRank }: { userId: string; initialRank: string | null }) {
  const [rank, setRank] = useState(initialRank ?? "user");
  const [pending, startTransition] = useTransition();

  return (
    <select
      className="rounded border px-2 py-1 text-[11px] sm:text-xs"
      value={rank}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setRank(next);
        startTransition(async () => {
          try {
            await updateUserRank(userId, next);
          } catch {
            setRank(initialRank ?? "user");
          }
        });
      }}
    >
      <option value="user">user</option>
      <option value="admin">admin</option>
    </select>
  );
}

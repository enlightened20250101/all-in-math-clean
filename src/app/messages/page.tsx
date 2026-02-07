"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";

type GroupRow = {
  group_id: string;
  groups: { id: string; name: string | null; created_at?: string | null } | null;
};

type MemberRow = {
  group_id: string;
  user_id: string;
  profiles: { display_name: string | null; avatar_url?: string | null } | null;
};

export default function MessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<GroupRow[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchRows = async () => {
    setErr(null);
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setErr("ログインが必要です");
      setLoading(false);
      return;
    }
    setCurrentUserId(user.id);
    const { data, error } = await supabase
      .from("group_members")
      .select("group_id, groups:groups!group_members_group_id_fkey (id, name, created_at)")
      .eq("user_id", user.id);

    if (error) {
      setErr(error.message);
      setLoading(false);
      return;
    }
    const list = ((data || []) as unknown) as GroupRow[];
    setRows(list);

    const dmGroupIds = list
      .filter((r) => r.groups?.name?.startsWith("DM:"))
      .map((r) => r.group_id);
    if (dmGroupIds.length) {
      const { data: mrows } = await supabase
        .from("group_members")
        .select("group_id, user_id, profiles:profiles!group_members_user_id_fkey (display_name, avatar_url)")
        .in("group_id", dmGroupIds);
      setMembers(((mrows || []) as unknown) as MemberRow[]);
    } else {
      setMembers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    const onFocus = () => fetchRows();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const labelMap = useMemo(() => {
    const map = new Map<string, { label: string; avatar?: string | null }>();
    rows.forEach((r) => {
      const name = r.groups?.name || "グループ";
      if (!name.startsWith("DM:")) {
        map.set(r.group_id, { label: name });
        return;
      }
      const candidates = members.filter((m) => m.group_id === r.group_id);
      const other = candidates.find((m) => m.user_id !== currentUserId) || candidates[0];
      if (other?.profiles?.display_name) {
        map.set(r.group_id, {
          label: other.profiles.display_name,
          avatar: other.profiles.avatar_url ?? null,
        });
      } else {
        map.set(r.group_id, { label: "DM" });
      }
    });
    return map;
  }, [rows, members, currentUserId]);

  const content = (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">メッセージ</h1>
          <div className="text-[11px] sm:text-sm text-gray-500 mt-1">DM・グループチャット</div>
        </div>
        <button
          onClick={() => router.push("/groups")}
          className="text-[11px] sm:text-sm text-blue-700 hover:underline"
        >
          グループを見る →
        </button>
      </div>

      {loading ? (
        <div className="text-[11px] sm:text-sm text-gray-600">読み込み中…</div>
      ) : err ? (
        <div className="text-[11px] sm:text-sm text-rose-600">Error: {err}</div>
      ) : rows.length === 0 ? (
        <div className="text-[11px] sm:text-sm text-gray-600">
          まだメッセージがありません。プロフィールからDMを開始できます。
        </div>
      ) : (
        <ul className="grid gap-3">
          {rows.map((r) => {
            const label = labelMap.get(r.group_id)?.label ?? r.groups?.name ?? "グループ";
            const avatar = labelMap.get(r.group_id)?.avatar;
            return (
              <li key={r.group_id} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar || "/avatar-default.png"}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border"
                  />
                  <Link className="font-medium text-sm sm:text-base hover:underline" href={`/groups/${r.group_id}`}>
                    {label}
                  </Link>
                </div>
                <Link className="text-[11px] sm:text-sm text-blue-700 hover:underline" href={`/groups/${r.group_id}`}>
                  開く →
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return <AuthGate>{content}</AuthGate>;
}

'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthGate from '@/components/AuthGate';

type Group = { id: string; name: string; color?: string | null; memberCount?: number; lastActive?: string | null };

const palette = [
  { id: "amber", dot: "bg-amber-400", ring: "ring-amber-200", badge: "border-amber-200 bg-amber-50 text-amber-700" },
  { id: "emerald", dot: "bg-emerald-400", ring: "ring-emerald-200", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { id: "sky", dot: "bg-sky-400", ring: "ring-sky-200", badge: "border-sky-200 bg-sky-50 text-sky-700" },
  { id: "rose", dot: "bg-rose-400", ring: "ring-rose-200", badge: "border-rose-200 bg-rose-50 text-rose-700" },
  { id: "violet", dot: "bg-violet-400", ring: "ring-violet-200", badge: "border-violet-200 bg-violet-50 text-violet-700" },
];

const toneById = new Map(palette.map((p) => [p.id, p]));

const pickTone = (seed: string, color?: string | null) => {
  if (color && toneById.has(color)) return toneById.get(color)!;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return palette[hash % palette.length];
};

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState("sky");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const relativeDate = (iso?: string | null) => {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    if (!Number.isFinite(diff)) return '';
    const sec = Math.max(1, Math.floor(diff / 1000));
    if (sec < 60) return `${sec}秒前`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}分前`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour}時間前`;
    const day = Math.floor(hour / 24);
    if (day < 30) return `${day}日前`;
    return new Date(iso).toLocaleDateString();
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchGroups = async () => {
    setErr(null);
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) {
      setErr('ログインが必要です');
      return;
    }
    const { data, error } = await supabase
      .from('group_members')
      .select('group_id, groups:groups!group_members_group_id_fkey (id, name, color)')
      .eq('user_id', user.id);

    if (error) {
      console.error('groups select error', {
        message: error.message,
        details: (error as any).details,
        hint: (error as any).hint,
        code: (error as any).code,
      });
      setErr(error.message);
      return;
    }
    const list = (data || [])
      .map((row: any) => row.groups)
      .filter(Boolean) as Group[];
    if (list.length === 0) {
      setGroups([]);
      return;
    }

    const groupIds = list.map((g) => g.id);
    const [membersRes, messagesRes] = await Promise.all([
      supabase.from("group_members").select("group_id").in("group_id", groupIds),
      supabase.from("group_messages").select("group_id, created_at").in("group_id", groupIds).order("created_at", { ascending: false }),
    ]);

    const memberCountMap = new Map<string, number>();
    (membersRes.data || []).forEach((m: any) => {
      const key = String(m.group_id);
      memberCountMap.set(key, (memberCountMap.get(key) ?? 0) + 1);
    });

    const lastActiveMap = new Map<string, string>();
    (messagesRes.data || []).forEach((m: any) => {
      const key = String(m.group_id);
      if (!lastActiveMap.has(key)) {
        lastActiveMap.set(key, m.created_at);
      }
    });

    const enriched = list.map((g) => ({
      ...g,
      memberCount: memberCountMap.get(g.id) ?? 1,
      lastActive: lastActiveMap.get(g.id) ?? null,
    }));
    setGroups(enriched);
  };

  // 初回ロード
  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchGroups();
      setLoading(false);
    })();
  }, []);

  // フォーカス時に更新（別タブで作成された時に追従）
  useEffect(() => {
    const onFocus = () => fetchGroups();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const create = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setToast({ message: 'グループ名を入力してください', type: 'error' });
      return;
    }

    setCreating(true);
    try {
      // 認証ユーザー
      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;
      if (!user) {
        setToast({ message: 'ログインが必要です', type: 'error' });
        setCreating(false);
        return;
      }

      // 1) groups へ作成（UUID主キーを返す）
      const { data: g, error: e1 } = await supabase
        .from('groups')
        .insert({ name: trimmed, owner_id: user.id, color })
        .select('id')
        .single();

      if (e1) {
        console.error('groups insert error', {
          message: e1.message,
          details: (e1 as any).details,
          hint: (e1 as any).hint,
          code: (e1 as any).code,
        });
        setToast({ message: e1.message, type: 'error' });
        setCreating(false);
        return;
      }

      // 2) 自分を owner として group_members に追加
      const { error: e2 } = await supabase
        .from('group_members')
        .insert({ group_id: g.id, user_id: user.id, role: 'owner' });

      if (e2) {
        console.error('group_members insert error', {
          message: e2.message,
          details: (e2 as any).details,
          hint: (e2 as any).hint,
          code: (e2 as any).code,
        });
        setToast({ message: `メンバー追加に失敗しました: ${e2.message}`, type: 'error' });
        // 失敗してもグループ自体は作成できているので、先に詳細へ遷移させる判断
      }

      // 入力をクリアして詳細へ遷移
      setName('');
      setColor("sky");
      router.push(`/groups/${g.id}`);
    } finally {
      setCreating(false);
    }
  };

  const content = (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5">
      {toast ? (
        <div
          className={`rounded-md border px-2 py-1 text-xs ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-semibold">グループ</h1>
          <div className="text-[11px] sm:text-sm text-gray-500">学習メンバーとのチャット/共有</div>
        </div>
      </div>

      {/* 作成UI */}
      <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white space-y-3 shadow-sm">
        <div className="text-[11px] sm:text-sm text-gray-600">新しいグループを作成</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            className="border border-slate-200 rounded-lg px-3 py-2 text-[12px] sm:text-sm w-full sm:min-w-[240px] focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="新しいグループ名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') create();
            }}
          />
          <button
            onClick={create}
            disabled={creating}
            className="px-4 py-2 rounded-lg bg-black text-white text-[11px] sm:text-sm disabled:opacity-50 hover:bg-slate-900"
          >
            {creating ? '作成中…' : '作成'}
          </button>
        </div>
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500">
          <span>グループカラー</span>
          <div className="flex items-center gap-2">
            {palette.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setColor(p.id)}
                className={`h-5 w-5 rounded-full ${p.dot} ring-4 ${p.ring} ${
                  color === p.id ? "outline outline-2 outline-slate-400" : ""
                }`}
                aria-label={`color-${p.id}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 一覧 */}
      {loading ? (
        <div className="text-[11px] sm:text-sm text-gray-600">loading…</div>
      ) : err ? (
        <div className="text-[11px] sm:text-sm text-red-600">Error: {err}</div>
      ) : groups.length === 0 ? (
        <div className="text-[11px] sm:text-sm text-gray-600">グループはまだありません。上のフォームから作成できます。</div>
      ) : (
        <ul className="grid gap-3">
          {groups.map((g) => (
            <li key={g.id}>
              {(() => {
                const tone = pickTone(g.id, g.color);
                return (
              <Link
                href={`/groups/${g.id}`}
                className="border border-slate-200 rounded-2xl p-4 bg-white hover:shadow-md transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${tone.dot} ring-4 ${tone.ring}`} />
                    <div className="font-medium text-sm sm:text-base">{g.name}</div>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 flex flex-wrap gap-2">
                    <span>学習メンバーとディスカッション</span>
                    <span className={`rounded-full border px-2 py-0.5 ${tone.badge}`}>
                      メンバー {g.memberCount ?? 1}
                    </span>
                    {g.lastActive ? (
                      <span className="text-slate-400">
                        最終発言 {relativeDate(g.lastActive)}（{new Date(g.lastActive).toLocaleString()}）
                      </span>
                    ) : null}
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400">▶</span>
              </Link>
                );
              })()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return <AuthGate>{content}</AuthGate>;
}

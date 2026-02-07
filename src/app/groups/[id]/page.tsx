'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import AuthGate from '@/components/AuthGate';
import MarkdownEditor from '@/components/MarkdownEditor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ImageUploader from '@/components/ImageUploader';
import ProfileSheet from './ProfileSheet';
import ReportButton from '@/components/ReportButton';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function InviteBox({ groupId }: { groupId: string }) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const createInvite = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('create_group_invite', {
      p_group_id: groupId,
      p_ttl_hours: 168,
      p_max_uses: null,
    });
    if (error) {
      setLoading(false);
      setToast({ message: error.message, type: 'error' });
      return;
    }
    const token = data?.[0]?.token as string | undefined;
    if (!token) {
      setLoading(false);
      setToast({ message: 'token not returned', type: 'error' });
      return;
    }
    const inviteUrl = `${origin}/invite/${token}`;
    setUrl(inviteUrl);
    try { await navigator.clipboard.writeText(inviteUrl); } catch {}
    setLoading(false);
  };

  const revokeInvites = async () => {
    setLoading(true);
    const { error } = await supabase.rpc('revoke_group_invites', {
      p_group_id: groupId,
    });
    if (error) {
      setLoading(false);
      setToast({ message: error.message, type: 'error' });
      return;
    }
    setUrl('');
    setLoading(false);
    setToast({ message: '招待リンクを無効にしました', type: 'success' });
  };

  return (
    <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-[11px] sm:text-sm font-semibold">招待リンクの発行</div>
          <div className="text-[10px] sm:text-xs text-slate-500">メンバー招待用URLを生成</div>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
          owner/adminのみ
        </span>
      </div>
      {toast ? (
        <div
          className={`rounded-md border px-2 py-1 text-[11px] sm:text-xs ${
            toast.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm">
        <button
          onClick={createInvite}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-black text-white text-[11px] sm:text-sm disabled:opacity-50 hover:bg-slate-900"
        >
          {loading ? '発行中…' : '新しい招待リンクを発行'}
        </button>
        <span className="text-[10px] sm:text-xs text-slate-500">
          発行済みのリンクはそのまま利用できます。
        </span>
      </div>
      {url && (
        <div className="text-[11px] sm:text-sm space-y-1">
          <div className="text-slate-500">共有用URL</div>
          <div className="flex flex-wrap items-center gap-2">
            <a className="underline break-all text-blue-700" href={url}>
              {url}
            </a>
            <button
              className="text-[11px] sm:text-xs rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600 hover:text-slate-800"
              onClick={() => navigator.clipboard.writeText(url)}
            >
              コピー
            </button>
            <button
              className="text-[11px] sm:text-xs rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-600 hover:text-rose-700"
              onClick={revokeInvites}
            >
              無効化
            </button>
          </div>
        </div>
      )}
      <p className="text-[10px] sm:text-xs text-gray-500">
        ※ 無効化すると、過去のリンクも利用できなくなります。
      </p>
    </div>
  );
}

type Message = {
  id: number;
  author_id: string;
  body_md: string;
  images: string[];
  created_at: string;
  profiles: { display_name: string | null; avatar_url?: string | null } | null;
};

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return "";
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

const dayKey = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

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

export default function GroupRoomPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const groupId = id; // UUID文字列
  const isInvalidId = useMemo(() => !groupId || !UUID_RE.test(groupId), [groupId]);

  const [msgs, setMsgs] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [images, setImages] = useState<{ url: string; path: string }[]>([]);
  const [isAdminOrOwner, setIsAdminOrOwner] = useState(false);
  const [groupInfo, setGroupInfo] = useState<{ name: string | null; color: string | null } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const highlightMsgId = useMemo(() => {
    const raw = params.get('msg');
    const num = raw ? Number(raw) : NaN;
    return Number.isFinite(num) ? num : null;
  }, [params]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchMessages = useCallback(async () => {
    if (isInvalidId || !groupId) return;
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        id,
        author_id,
        body_md,
        images,
        created_at,
        profiles:profiles!group_messages_author_id_fkey (display_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('messages select error', { message: error.message, details: (error as any).details, hint: (error as any).hint, code: (error as any).code });
      return;
    }
    setMsgs((data as unknown as Message[]) || []);
  }, [groupId, isInvalidId]);

  useEffect(() => {
    if (isInvalidId) return;
    const KEY = 'profile:updated';
    if (localStorage.getItem(KEY)) {
      fetchMessages();
      localStorage.removeItem(KEY);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) { fetchMessages(); localStorage.removeItem(KEY); }
    };
    const onFocus = () => fetchMessages();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchMessages, isInvalidId]);

  useEffect(() => {
    if (isInvalidId || !currentUserId) return;

    fetchMessages();

    const chMsg = supabase
      .channel(`grp-${groupId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          const incoming = payload.new as any;
          setMsgs((prev) => (prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming]));
        }
      )
      .subscribe();

    const chProf = supabase
      .channel(`prof-${currentUserId}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${currentUserId}` },
        (payload) => {
          const dn = (payload.new as any)?.display_name ?? '';
          const av = (payload.new as any)?.avatar_url ?? '';
          setMsgs((prev) =>
            prev.map((m) => (m.author_id === currentUserId ? { ...m, profiles: { display_name: dn, avatar_url: av } } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(chMsg);
      supabase.removeChannel(chProf);
    };
  }, [fetchMessages, groupId, isInvalidId, currentUserId]);

  useEffect(() => {
    if (!highlightMsgId) return;
    const el = document.getElementById(`group-msg-${highlightMsgId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightMsgId, msgs]);

  useEffect(() => {
    if (isInvalidId) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsAdminOrOwner(data?.role === 'owner' || data?.role === 'admin');
    })();
  }, [groupId, isInvalidId]);

  const applyMyProfile = (p: { display_name: string; avatar_url: string }) => {
    if (!currentUserId) return;
    setMsgs((prev) =>
      prev.map((m) => (m.author_id === currentUserId ? { ...m, profiles: { display_name: p.display_name, avatar_url: p.avatar_url } } : m))
    );
    localStorage.setItem('profile:updated', String(Date.now()));
  };

  const appendUnique = (message: Message) => {
    setMsgs((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
  };

  const send = async () => {
    if (sending) return;
    const trimmed = body.trim();
    if (!trimmed && images.length === 0) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setToast({ message: 'ログインが必要です', type: 'error' });
      setSending(false);
      return;
    }

    const { data, error } = await supabase
      .from('group_messages')
      .insert({ group_id: groupId, author_id: user.id, body_md: body, images: images.map(i => i.url) })
      .select('id, author_id, body_md, images, created_at')
      .single();

    if (error) {
      setToast({ message: error.message, type: 'error' });
      setSending(false);
      return;
    }

    const { data: myProfile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    appendUnique({ ...(data as any), profiles: myProfile ?? { display_name: null, avatar_url: null } } as Message);
    setBody(''); setImages([]);
    setSending(false);
  };

  // 無効IDのときは何も描画しない（/404へは飛ばさない）
  if (isInvalidId) return null;

  const tone = pickTone(groupId, groupInfo?.color ?? null);
  const onComposerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (sending) return;
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (isInvalidId || !groupId) return;
    supabase
      .from("groups")
      .select("name,color")
      .eq("id", groupId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setGroupInfo({ name: data.name ?? null, color: data.color ?? null });
          setNameInput(data.name ?? "");
        }
      });
  }, [groupId, isInvalidId]);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-group-settings="true"]')) return;
      setSettingsOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [settingsOpen]);

  useEffect(() => {
    if (!openMenuId) return;
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-msg-menu="true"]')) return;
      setOpenMenuId(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openMenuId]);

  const applyColor = async (next: string) => {
    if (!isAdminOrOwner) return;
    const { error } = await supabase.from("groups").update({ color: next }).eq("id", groupId);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setGroupInfo((prev) => ({ name: prev?.name ?? null, color: next }));
  };

  const applyName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setToast({ message: "グループ名を入力してください", type: "error" });
      return;
    }
    const { error } = await supabase.from("groups").update({ name: trimmed }).eq("id", groupId);
    if (error) {
      setToast({ message: error.message, type: "error" });
      return;
    }
    setGroupInfo((prev) => ({ name: trimmed, color: prev?.color ?? null }));
    setToast({ message: "グループ名を更新しました", type: "success" });
  };

  return (
    <AuthGate>
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${tone.dot} ring-4 ${tone.ring}`} />
              <h1 className="text-xl sm:text-2xl font-semibold">
                {groupInfo?.name ?? "グループチャット"}
              </h1>
            </div>
            <div className="text-[11px] sm:text-sm text-gray-500">メンバーと学習のやり取り</div>
          </div>
          <div className="flex items-center gap-3">
            {isAdminOrOwner ? (
              <div className="relative" data-group-settings="true">
                <button
                  type="button"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="text-[10px] sm:text-xs rounded-full border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:text-slate-900"
                >
                  設定
                </button>
                {settingsOpen ? (
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg z-10 space-y-3">
                    <div className="text-[11px] text-slate-500">グループ設定</div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">グループ名</label>
                      <div className="flex items-center gap-2">
                        <input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-200"
                          placeholder="グループ名"
                        />
                        <button
                          type="button"
                          onClick={applyName}
                          className="rounded-lg bg-black px-2.5 py-1 text-[11px] text-white hover:bg-slate-900"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">グループカラー</label>
                      <div className="flex items-center gap-2">
                        {palette.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => applyColor(p.id)}
                            className={`h-6 w-6 rounded-full ${p.dot} ring-4 ${p.ring} ${
                              groupInfo?.color === p.id ? "outline outline-2 outline-slate-400" : ""
                            }`}
                            aria-label={`color-${p.id}`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-3">
                      <InviteBox groupId={groupId} />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            <button
              onClick={() => setProfileOpen(true)}
              className="text-[11px] sm:text-sm text-blue-700 hover:underline"
            >
              プロフィール編集
            </button>
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white shadow-sm p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] sm:text-sm text-slate-500">
            <span>チャット</span>
            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${tone.badge}`}>グループカラー</span>
          </div>
          <div className="space-y-2">
            {msgs.map((m, idx) => {
            const isMine = currentUserId && m.author_id === currentUserId;
            const name   = m.profiles?.display_name || '名無しさん';
            const avatar = m.profiles?.avatar_url || '';
            const prev = msgs[idx - 1];
            const showDay = idx === 0 || (prev && dayKey(prev.created_at) !== dayKey(m.created_at));

            return (
              <div key={m.id} className="space-y-2">
                {showDay ? (
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-slate-400">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                      {new Date(m.created_at).toLocaleDateString()}
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>
                ) : null}
                <div
                  id={`group-msg-${m.id}`}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${
                    highlightMsgId === m.id ? 'ring-2 ring-amber-300 rounded-xl p-1' : ''
                  }`}
                >
                  {!isMine && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={avatar || '/avatar-default.png'} alt="" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mr-2 mt-1 object-cover border border-slate-200" />
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 space-y-2 border ${
                      isMine
                        ? 'bg-blue-50 text-blue-900 border-blue-100'
                        : 'bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="text-[10px] sm:text-xs font-medium opacity-75">{name}</div>
                    <div className="text-[11px] sm:text-base">
                      <MarkdownRenderer markdown={m.body_md} />
                    </div>
                    {Array.isArray(m.images) && m.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {m.images.map((u, i) => (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img key={i} src={u} alt="" className="w-full h-24 sm:h-28 object-cover rounded-lg border border-slate-200" />
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                      <span>{relativeTime(m.created_at)}</span>
                      <div className="ml-auto relative" data-msg-menu="true">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenMenuId((prev) => (prev === m.id ? null : m.id));
                          }}
                          className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500 hover:text-slate-800"
                          aria-label="message-menu"
                        >
                          ⋯
                        </button>
                        {openMenuId === m.id ? (
                          <div className="absolute right-0 mt-2 w-28 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                            <ReportButton
                              targetType="group_message"
                              targetId={m.id}
                              className="w-full rounded-lg px-2 py-1 text-left text-[10px] text-rose-600 hover:bg-rose-50"
                              label="通報"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-3 sm:p-4 bg-white space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-sm text-gray-600">
            <span>メッセージを書く</span>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-400">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Shift + Enter 改行</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">Ctrl/⌘ + Enter 送信</span>
            </div>
          </div>
          <div
            onKeyDown={onComposerKeyDown}
            className="rounded-xl border border-slate-200 bg-slate-50/60 p-2 focus-within:ring-2 focus-within:ring-blue-200"
          >
            <MarkdownEditor value={body} onChange={setBody} placeholder={'メッセージ（Markdown + TeX）'} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ImageUploader value={images} onChange={setImages} />
            </div>
            <button
              onClick={send}
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-black text-white text-[11px] sm:text-sm hover:bg-slate-900 disabled:opacity-60"
            >
              {sending ? "送信中…" : "送信"}
            </button>
          </div>
        </div>
      </div>

      {currentUserId && (
        <ProfileSheet
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onSaved={applyMyProfile}
          userId={currentUserId}
        />
      )}
    </AuthGate>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Me = { display_name: string | null; avatar_url: string | null } | null;

// 公開版で押し出したい導線だけに絞る
const NAV_ITEMS = [
  { href: '/course',   label: 'コース学習' },
  { href: '/posts',    label: 'Q&A' },
  { href: '/threads',  label: '掲示板' },
  { href: '/articles', label: '記事' },
  { href: '/graphs/new', label: 'グラフ' },
  // ★ /learn 系は一旦 Navbar から外しておく（後でβバッジ付きで復活させてもOK）
];

export default function Navbar() {
  const pathname = usePathname();
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const profileMenuMobileRef = useRef<HTMLDivElement | null>(null);
  const profileMenuDesktopRef = useRef<HTMLDivElement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // プロフィール取得
  const loadProfile = async () => {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr) { console.error(authErr); return; }
    if (!user) { setMe(null); return; }

    const { data: prof, error: selErr } = await supabase
      .from('profiles')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();
    if (selErr) { console.error(selErr); return; }

    if (!prof) {
      const seedName = (user.user_metadata as any)?.name ?? '';
      const { error: insErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, display_name: seedName, avatar_url: '' });
      if (insErr && !insErr.message?.includes('duplicate')) {
        console.warn('profiles insert skipped:', insErr.message);
      }
      const { data: prof2 } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      setMe(prof2 ?? { display_name: null, avatar_url: null });
    } else {
      setMe(prof);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        if (!cancelled) setLoading(false);
        return;
      }
      await loadProfile();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // プロフィール更新フラグ（profile:updated）とフォーカスで再取得
  useEffect(() => {
    const KEY = 'profile:updated';
    if (typeof window !== 'undefined' && localStorage.getItem(KEY)) {
      loadProfile();
      localStorage.removeItem(KEY);
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        loadProfile();
        localStorage.removeItem(KEY);
      }
    };
    const onFocus = () => loadProfile();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (profileMenuMobileRef.current && profileMenuMobileRef.current.contains(target)) return;
      if (profileMenuDesktopRef.current && profileMenuDesktopRef.current.contains(target)) return;
      setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('touchstart', handle);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('touchstart', handle);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const onSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('signOut error', error);
      setToast({ message: 'ログアウトに失敗しました', type: 'error' });
      return;
    }
    localStorage.removeItem('profile:updated');
    window.location.href = '/';
  };

  // ナビ用クラス（現在ページを強調）
  const linkCls = (href: string) => {
    const active =
      pathname === href ||
      (href !== '/' && pathname?.startsWith(href));
    return `px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
      active ? 'bg-gray-900 text-white' : 'hover:bg-gray-100'
    }`;
  };

  // プロフィール編集後の戻り先は「今いるページ or /」
  const nextAfterProfile = encodeURIComponent(pathname || '/');
  const loginHref = `/login?next=${nextAfterProfile}`;

  const profileMenu = (
    <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg overflow-hidden z-20">
      <div className="px-3 py-2 text-xs text-slate-500 border-b">
        {me?.display_name || '未設定'}
      </div>
      <Link
        href="/me"
        className="block px-3 py-2 text-sm hover:bg-slate-50"
      >
        マイページ
      </Link>
      <Link
        href="/messages"
        className="block px-3 py-2 text-sm hover:bg-slate-50"
      >
        メッセージ
      </Link>
      <Link
        href={`/settings/profile?next=${nextAfterProfile}`}
        className="block px-3 py-2 text-sm hover:bg-slate-50"
      >
        プロフィール編集
      </Link>
      <button
        onClick={onSignOut}
        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
      >
        ログアウト
      </button>
    </div>
  );

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* 左：ブランド */}
        <Link href="/" className="font-semibold whitespace-nowrap flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-slate-900 text-[11px] font-semibold text-white sm:hidden">
            AiM
          </span>
          <span className="hidden sm:inline">All in Math</span>
        </Link>

        {/* 中央：ナビリンク（md以上） */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkCls(href)}
              aria-current={pathname === href ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* モバイル：横スクロールナビ */}
        <div className="md:hidden flex items-center gap-2 text-sm overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkCls(href)}>
              {label}
            </Link>
          ))}
        </div>

        {/* 右：プロフィール／ログイン */}
        <div className="flex items-center gap-3 text-sm">
          {loading ? (
            <span className="opacity-60">loading…</span>
          ) : me ? (
            <>
              <div className="relative sm:hidden" ref={profileMenuMobileRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-2 py-1.5 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={me.avatar_url || 'https://placehold.co/28x28?text=%E4%BA%BA'}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/28x28?text=%E4%BA%BA';
                    }}
                    className="w-7 h-7 rounded-full object-cover border"
                  />
                  <span className="text-[10px] text-slate-500">⋯</span>
                </button>
                {menuOpen ? profileMenu : null}
              </div>
              <div className="relative hidden sm:block" ref={profileMenuDesktopRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50 transition"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={me.avatar_url || 'https://placehold.co/28x28?text=%E4%BA%BA'}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/28x28?text=%E4%BA%BA';
                    }}
                    className="w-7 h-7 rounded-full object-cover border"
                  />
                  <span className="text-xs text-slate-700">
                    {me.display_name || '未設定'}
                  </span>
                  <span className="text-[10px] text-slate-400">⌄</span>
                </button>
                {menuOpen ? profileMenu : null}
              </div>
            </>
          ) : (
            <Link
              href={loginHref}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition whitespace-nowrap"
            >
              ログイン / 新規登録
            </Link>
          )}
        </div>
      </div>
      {toast ? (
        <div className="max-w-6xl mx-auto px-4 pb-2">
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
        </div>
      ) : null}
    </nav>
  );
}

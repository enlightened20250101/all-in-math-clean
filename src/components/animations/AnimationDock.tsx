'use client';

import { createContext, useContext, useMemo, useState, Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES } from '@/data/animation_catalog';

// 1) id→コンポーネント の登録（必要に応じて追加）
const REGISTRY: Record<string, any> = {
  'square-completion': dynamic(()=>import('@/components/animations/SquareCompleteStepper'), { ssr:false }),
  'factorization':     dynamic(()=>import('@/components/animations/FactorizationStepper'), { ssr:false }),
  'mean-value-rolle':  dynamic(()=>import('@/components/animations/MeanValueRolleStepper'), { ssr:false }),
  'riemann-integral':  dynamic(()=>import('@/components/animations/RiemannIntegralStepper'), { ssr:false }),
  'integration-tech':  dynamic(()=>import('@/components/animations/IntegrationTechStepper'), { ssr:false }),
  'inequality-region': dynamic(()=>import('@/components/animations/InequalityRegionStepper'), { ssr:false }),
  'vector-2d-3d':      dynamic(()=>import('@/components/animations/Vector2D3DStepper'), { ssr:false }),
  'locus-lab':         dynamic(()=>import('@/components/animations/LocusStepper'), { ssr:false }),
  'line-circle-relation': dynamic(()=>import('@/components/animations/LineCircleRelationStepper'), { ssr:false }),
  'two-circles-relation': dynamic(()=>import('@/components/animations/TwoCirclesRelationStepper'), { ssr:false }),
  'angle-bisector':    dynamic(()=>import('@/components/animations/AngleBisectorStepper'), { ssr:false }),
  'nine-point-circle': dynamic(()=>import('@/components/animations/NinePointCircleStepper'), { ssr:false }),
  'square-completion-proof': dynamic(()=>import('@/components/animations/SquareCompletionProofStepper'), { ssr:false }),
  'factorization-ac-proof': dynamic(()=>import('@/components/animations/FactorizationACProofStepper'), { ssr:false }),
  'diff-squares':  dynamic(()=>import('@/components/animations/DiffSquares_StickyTop'), { ssr:false }),
  'cubes-sumdiff': dynamic(()=>import('@/components/animations/CubesSumDiff_StickyTop'), { ssr:false }),
  'common-factor':    dynamic(()=>import('@/components/animations/CommonFactor_StickyTop'),    { ssr:false }),
  'perfect-square':   dynamic(()=>import('@/components/animations/PerfectSquare_StickyTop'),   { ssr:false }),
  // …必要に応じて追加
};

type DockState = { open:boolean; slug?:string; id?:string; params?:Record<string,any> };
type Ctx = {
  openAnimation: (args:{slug:string; id:string; params?:Record<string,any>})=>void;
  closeAnimation: ()=>void;
};
const AnimDockCtx = createContext<Ctx | null>(null);
export const useAnimationDock = ()=> {
  const ctx = useContext(AnimDockCtx);
  if(!ctx) throw new Error('AnimationDockProvider not mounted');
  return ctx;
};

function AnimationDockProviderInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // 2) URLクエリ（?anim=slug/id&p=base64json）と同期
  const init = useMemo<DockState>(() => {
    const animParam = sp.get('anim') ?? sp.get('anime');  // ← anime もOK
    if (!animParam) return { open: false };
    const [slug, id] = animParam.split('/');
    let params: any = undefined;
    const p = sp.get('p');
    if (p) { try { params = JSON.parse(atob(p)); } catch {} }
    return { open: true, slug, id, params };
  }, [sp]);

  const [dock, setDock] = useState<DockState>(init);

  // ★ 追加：ガードの有効・無効を切り替えるフラグ
  const persistRef = useRef(false);                 // true: anim/p を“粘着保持”する
  const closingRef = useRef(false);                 // true: ユーザーの明示的 close 中
  const closeTimerRef = useRef<number | null>(null); // 既存のデバウンス用

  // ★ “一瞬だけ” anim が外れても猶予してから閉じるようにする（＆明示 close を優先）
  useEffect(() => {
    const nextOpen = init.open && !!init.slug && !!init.id;
    const curOpen  = dock.open && !!dock.slug && !!dock.id;

    // 1) 開く or 更新（slug/id/p が確定している）
    if (nextOpen) {
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      setDock(init);
      return;
    }

    // 2) 明示 close 中は即時閉じる（デバウンス無視）
    if (closingRef.current) {
      if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      setDock({ open:false });
      return;
    }

    // 3) 開いている最中に “一瞬だけ” anim が消えたケース → デバウンスで様子見
    if (curOpen) {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = window.setTimeout(() => {
        const sp2 = new URLSearchParams(window.location.search);
        const stillMissing = !(sp2.get('anim') ?? sp2.get('anime'));
        if (stillMissing) setDock({ open:false });
        if (closeTimerRef.current) { clearTimeout(closeTimerRef.current); closeTimerRef.current = null; }
      }, 150);  // 100〜250ms 程度で調整可
      return;
    }

    // 4) もともと閉じていたなら素直に閉じ状態へ
    setDock(init);
  }, [init, dock.open, dock.slug, dock.id]);

  const openAnimation: Ctx['openAnimation'] = ({slug,id,params})=>{
    const q = new URLSearchParams(sp.toString());
    q.set('anim', `${slug}/${id}`);   // ← “anim”に統一
    q.delete('anime');
    if (params && Object.keys(params).length) q.set('p', btoa(JSON.stringify(params)));
    else q.delete('p');

    // ★ 開くときはガードを有効化
    persistRef.current = true;
    closingRef.current = false;

    router.push(`${pathname}?${q.toString()}`, { scroll:false });
  };

  const closeAnimation = ()=>{
    // ★ 閉じる意思を明示
    persistRef.current = false;   // ← 以後、URL 保持しない
    closingRef.current = true;

    // 小窓は即時閉じる（URL更新が多少遅れてもUIは閉じる）
    setDock({ open:false });

    // URL から anim/anime/p を外す（この時は keepAnim を無効化中）
    const q = new URLSearchParams(sp.toString());
    q.delete('anim'); q.delete('anime'); q.delete('p');
    router.replace(`${pathname}?${q.toString()}`, { scroll:false });

    // 少し後で close フラグ解除（URLが落ち着いたら）
    window.setTimeout(()=>{ closingRef.current = false; }, 200);
  };

  return (
    <AnimDockCtx.Provider value={{ openAnimation, closeAnimation }}>
      {children}
      <AnimationDockUI
        state={dock}
        onClose={closeAnimation}
        persistRef={persistRef}
        closingRef={closingRef}
      />
    </AnimDockCtx.Provider>
  );
}

export function AnimationDockProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading...</div>}>
      <AnimationDockProviderInner>{children}</AnimationDockProviderInner>
    </Suspense>
  );
}

function AnimationDockUI({
  state,
  onClose,
  persistRef,
  closingRef,
}:{
  state: DockState;
  onClose: ()=>void;
  persistRef: React.MutableRefObject<boolean>;
  closingRef: React.MutableRefObject<boolean>;
}) {
  // ★ 追加：小窓開いている“かつ” persistRef が true の間だけ anim/p を温存
  useEffect(() => {
    if (!state.open) return;

    const keepAnimParams = (urlStr: string) => {
      try {
        // 明示 close 中 or 保持オフの時は素通し
        if (!persistRef.current || closingRef.current) return urlStr;

        const cur = new URL(window.location.href);
        const preservedAnim = cur.searchParams.get('anim') || cur.searchParams.get('anime');
        const preservedP    = cur.searchParams.get('p');

        const u = new URL(urlStr, window.location.href);

        if (!u.searchParams.get('anim') && !u.searchParams.get('anime') && preservedAnim) {
          u.searchParams.set('anim', preservedAnim);
          if (preservedP && !u.searchParams.get('p')) u.searchParams.set('p', preservedP);
        }
        return u.toString();
      } catch {
        return urlStr;
      }
    };

    const origReplace = window.history.replaceState.bind(window.history);
    const origPush    = window.history.pushState.bind(window.history);

    // wrap replaceState
    // biome-ignore lint/suspicious/noExplicitAny: next/router がいろいろ渡す可能性があるため
    (window.history as any).replaceState = function (state: any, title: string, url?: string | URL | null) {
      if (typeof url === 'string') return origReplace(state, title, keepAnimParams(url));
      if (url instanceof URL)      return origReplace(state, title, keepAnimParams(url.toString()));
      return origReplace(state, title, url as any);
    };

    // wrap pushState
    // biome-ignore lint/suspicious/noExplicitAny:
    (window.history as any).pushState = function (state: any, title: string, url?: string | URL | null) {
      if (typeof url === 'string') return origPush(state, title, keepAnimParams(url));
      if (url instanceof URL)      return origPush(state, title, keepAnimParams(url.toString()));
      return origPush(state, title, url as any);
    };

    return () => {
      // 解除：元に戻す
      (window.history as any).replaceState = origReplace;
      (window.history as any).pushState = origPush;
    };
  }, [state.open, persistRef, closingRef]);

  if (!state.open || !state.slug || !state.id) return null;
  const Comp = REGISTRY[state.id];
  if (!Comp) return (
    <MiniModal onClose={onClose} title="アニメーションが見つかりません">
      <p className="text-sm text-gray-600">ID: {state.id} は未登録です。</p>
    </MiniModal>
  );

  // 3) カタログ由来の初期 params をマージ（任意）
  const cat = CATEGORIES.find(c=>c.slug===state.slug);
  const tpl = cat?.templates.find(t=>t.id===state.id);
  const mergedParams = { ...(tpl?.params ?? {}), ...(state.params ?? {}) };

  return (
    <MiniModal
      onClose={onClose}
      title={`${tpl?.title ?? state.id}`}
      actions={
        <a
          className="text-xs underline text-gray-600"
          target="_blank" rel="noreferrer"
          href={`/labs/animation/${state.slug}/${state.id}${state.params ? `?p=${encodeURIComponent(btoa(JSON.stringify(state.params)))}`:''}`}
        >新しいタブで開く</a>
      }
    >
      <Suspense fallback={<div className="p-6 text-sm text-gray-500">読み込み中…</div>}>
        {/* Stepper は多くが props なしでもOK。必要なら mergedParams を渡す */}
        <Comp {...mergedParams} />
      </Suspense>
    </MiniModal>
  );
}

/* --- 最小モーダル --- */
function MiniModal({ children, title, onClose, actions }:{
  children: React.ReactNode; title?:string; onClose:()=>void; actions?:React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/30 pointer-events-auto" onClick={onClose}/>
      <div className="relative bg-white rounded-xl shadow-xl w-[min(960px,95vw)] h-[min(640px,90vh)] flex flex-col pointer-events-auto">
        <header className="px-4 py-2 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <div className="flex items-center gap-3">
            {actions}
            <button onClick={onClose} className="text-sm text-gray-600">閉じる</button>
          </div>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

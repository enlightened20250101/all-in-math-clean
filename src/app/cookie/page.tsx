export default function CookiePolicyPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Cookie</div>
        <h1 className="text-xl sm:text-2xl font-semibold">Cookieポリシー</h1>
        <p className="text-sm text-slate-600">
          当サイトにおけるCookie等の利用について説明します。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">1. Cookieの利用目的</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>ログイン状態の保持</li>
          <li>学習履歴や設定の保存</li>
          <li>サービス改善のための分析</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">2. Cookieの無効化</h2>
        <p>
          ブラウザ設定でCookieを無効化できますが、一部機能が利用できない場合があります。
        </p>
      </section>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Terms</div>
        <h1 className="text-xl sm:text-2xl font-semibold">利用規約</h1>
        <p className="text-sm text-slate-600">
          All in Math（以下「当サイト」）の利用条件を定めます。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">1. 適用</h2>
        <p className="text-sm text-slate-700">
          本規約は、当サイトの利用に関する一切の関係に適用されます。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">2. アカウント</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>登録情報は正確に入力してください。</li>
          <li>アカウントの管理責任は利用者にあります。</li>
          <li>不正利用が疑われる場合、当サイトは利用制限を行うことがあります。</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">3. 禁止事項</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>法令または公序良俗に反する行為</li>
          <li>他ユーザーの権利・名誉を侵害する行為</li>
          <li>不正アクセス、過度な負荷を与える行為</li>
          <li>なりすまし、スパム、宣伝目的のみの投稿</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">4. コンテンツ</h2>
        <p className="text-sm text-slate-700">
          利用者が投稿したコンテンツの権利は利用者に帰属しますが、
          当サイトの運営・改善に必要な範囲で当サイトが利用できるものとします。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">5. 免責事項</h2>
        <p className="text-sm text-slate-700">
          当サイトは、提供する情報の正確性・完全性を保証しません。
          利用によって生じた損害について、当サイトは一切の責任を負いません。
        </p>
        <p className="text-sm text-slate-700">
          演習問題・解説・自動採点の結果は参考情報であり、誤りが含まれる可能性があります。
          学習の最終判断は利用者自身で行うものとします。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">6. サービスの変更・停止</h2>
        <p className="text-sm text-slate-700">
          当サイトは事前の通知なく内容の変更または提供停止を行う場合があります。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">7. 規約の変更</h2>
        <p className="text-sm text-slate-700">
          本規約は必要に応じて変更されます。変更後の内容は当ページにて告知します。
        </p>
      </section>
    </div>
  );
}

export default function GuidelinesPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Guidelines</div>
        <h1 className="text-xl sm:text-2xl font-semibold">コミュニティガイドライン</h1>
        <p className="text-sm text-slate-600">
          All in Math を安心して利用できるよう、投稿時の注意点をまとめています。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">基本ルール</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>相手を尊重し、誹謗中傷や差別的な表現は行わない。</li>
          <li>問題の解説は丁寧に、根拠を示して回答する。</li>
          <li>著作権を侵害する投稿（画像・文章の無断転載など）をしない。</li>
          <li>宣伝目的のみの投稿やスパム行為をしない。</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">禁止される投稿例</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>他者の個人情報を含む投稿</li>
          <li>外部サービスへ強制的に誘導する投稿</li>
          <li>不適切な画像・文章を含む投稿</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">違反への対応</h2>
        <p>
          ガイドラインに違反する投稿は削除・アカウント制限等の対応を行う場合があります。
        </p>
      </section>
    </div>
  );
}

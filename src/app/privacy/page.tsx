export default function PrivacyPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Privacy</div>
        <h1 className="text-xl sm:text-2xl font-semibold">プライバシーポリシー</h1>
        <p className="text-sm text-slate-600">
          All in Math（以下「当サイト」）における個人情報の取扱いについて定めます。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">1. 取得する情報</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>アカウント登録時に入力された情報（表示名、メールアドレス等）</li>
          <li>学習履歴・学習状況など当サイト内の利用データ</li>
          <li>投稿・コメント・掲示板の書き込みなどのユーザー生成コンテンツ</li>
          <li>アクセスログ、Cookie、端末情報などの技術情報</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">2. 利用目的</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>学習機能・コミュニティ機能の提供と改善</li>
          <li>不正利用の防止および安全性の確保</li>
          <li>お問い合わせへの対応</li>
          <li>新機能やメンテナンス等の案内</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">3. 第三者提供</h2>
        <p className="text-sm text-slate-700">
          当サイトは、法令に基づく場合を除き、本人の同意なく個人情報を第三者に提供しません。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">4. 外部サービスの利用</h2>
        <p className="text-sm text-slate-700">
          当サイトは、認証・データ保存・アクセス解析等の目的で外部サービスを利用する場合があります。
          これらのサービスに提供される情報は、必要最小限に留めます。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">5. Cookie 等の利用</h2>
        <p className="text-sm text-slate-700">
          当サイトでは利便性向上や分析のため Cookie を使用することがあります。ブラウザ設定により
          Cookie を無効化できますが、一部機能が利用できない場合があります。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">6. 開示・訂正・削除</h2>
        <p className="text-sm text-slate-700">
          ご本人からの開示・訂正・削除のご請求には、合理的な範囲で対応します。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">7. 変更</h2>
        <p className="text-sm text-slate-700">
          本ポリシーの内容は必要に応じて変更されます。変更後の内容は当ページにて告知します。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">8. お問い合わせ</h2>
        <p className="text-sm text-slate-700">
          本ポリシーに関するお問い合わせはお問い合わせページよりご連絡ください。
        </p>
      </section>
    </div>
  );
}

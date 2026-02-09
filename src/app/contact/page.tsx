import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">お問い合わせ</h1>
        <p className="text-sm text-slate-600">
          不具合報告・ご要望・その他のご連絡はこちらからお願いします。
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">お問い合わせ方法</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>お問い合わせ先: <a className="underline" href="mailto:info.manganews@gmail.com">info.manganews@gmail.com</a></li>
          <li>内容によっては返信に数日いただく場合があります。</li>
          <li>学習相談や質問は「知恵袋」や「掲示板」もご利用ください。</li>
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold">メールフォーム</h2>
        <p className="text-sm text-slate-600">
          入力内容は既定のメールアプリで送信されます。
        </p>
        <form
          action="mailto:info.manganews@gmail.com"
          method="post"
          encType="text/plain"
          className="space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">お名前</label>
              <input
                name="name"
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="例）山田 太郎"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600">メールアドレス</label>
              <input
                name="email"
                type="email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="example@email.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">件名</label>
            <input
              name="subject"
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="お問い合わせ件名"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">内容</label>
            <textarea
              name="message"
              rows={5}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="お問い合わせ内容を入力してください"
            />
          </div>
          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-black"
          >
            メールを作成する
          </button>
        </form>
      </section>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">よくあるお問い合わせ</h2>
        <div className="text-sm text-slate-700 space-y-2">
          <p>・ログインできない / パスワードを忘れた</p>
          <p>・学習履歴が反映されない</p>
          <p>・投稿の削除依頼</p>
        </div>
      </section>

      <div className="text-sm text-slate-600">
        <Link href="/terms" className="underline">利用規約</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}

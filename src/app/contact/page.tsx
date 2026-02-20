import Link from "next/link";
import ContactFormClient from "./ContactFormClient";

export default function ContactPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Contact</div>
        <h1 className="text-xl sm:text-2xl font-semibold">お問い合わせ</h1>
        <p className="text-sm text-slate-600">
          不具合報告・ご要望・その他のご連絡はこちらからお願いします。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">お問い合わせ方法</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>
            お問い合わせ先: {" "}
            <a className="underline" href="mailto:info.manganews@gmail.com">
              info.manganews@gmail.com
            </a>
          </li>
          <li>内容によっては返信に数日いただく場合があります。</li>
          <li>学習相談や質問は「知恵袋」や「掲示板」もご利用ください。</li>
        </ul>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-4">
        <h2 className="text-base font-semibold">メールフォーム</h2>
        <p className="text-sm text-slate-600">
          入力内容は送信ボタンでそのまま送信されます。
        </p>
        <ContactFormClient />
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3">
        <h2 className="text-base font-semibold">よくあるお問い合わせ</h2>
        <div className="text-sm text-slate-700 space-y-2">
          <p>・ログインできない / パスワードを忘れた</p>
          <p>・学習履歴が反映されない</p>
          <p>・投稿の削除依頼</p>
        </div>
      </section>

      <div className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm text-sm text-slate-600">
        <Link href="/terms" className="underline">
          利用規約
        </Link>{" "}
        ・{" "}
        <Link href="/privacy" className="underline">
          プライバシーポリシー
        </Link>
      </div>
    </div>
  );
}

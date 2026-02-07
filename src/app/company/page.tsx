import Link from "next/link";

export default function CompanyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">運営者情報</h1>
        <p className="text-sm text-slate-600">
          本ページは公開時に必要な情報をまとめたものです。内容は実運用に合わせて更新してください。
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 text-sm text-slate-700 space-y-2">
        <div><span className="text-slate-500">運営者名：</span>（記入してください）</div>
        <div><span className="text-slate-500">所在地：</span>（記入してください）</div>
        <div><span className="text-slate-500">連絡先：</span>info.manganews@gmail.com</div>
        <div><span className="text-slate-500">事業内容：</span>学習支援サービスの提供</div>
      </section>

      <div className="text-sm text-slate-600">
        <Link href="/contact" className="underline">お問い合わせ</Link> ・{" "}
        <Link href="/terms" className="underline">利用規約</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}

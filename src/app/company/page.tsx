import Link from "next/link";

export default function CompanyPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Company</div>
        <h1 className="text-xl sm:text-2xl font-semibold">運営者情報</h1>
        <p className="text-sm text-slate-600">
          本ページは公開時に必要な情報をまとめたものです。内容は実運用に合わせて更新してください。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 text-sm text-slate-700 shadow-sm space-y-2">
        <div><span className="text-slate-500">運営者名：</span>（記入してください）</div>
        <div><span className="text-slate-500">所在地：</span>（記入してください）</div>
        <div><span className="text-slate-500">連絡先：</span>info.manganews@gmail.com</div>
        <div><span className="text-slate-500">事業内容：</span>学習支援サービスの提供</div>
      </section>

      <div className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm text-sm text-slate-600">
        <Link href="/contact" className="underline">お問い合わせ</Link> ・{" "}
        <Link href="/terms" className="underline">利用規約</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}

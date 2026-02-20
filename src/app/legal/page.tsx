import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Legal</div>
        <h1 className="text-xl sm:text-2xl font-semibold">法的情報</h1>
        <p className="text-sm text-slate-600">
          目的に応じて以下のページをご確認ください。
        </p>
      </header>
      <div className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 text-sm text-slate-700 shadow-sm space-y-2">
        <div>
          <Link href="/tokusho" className="underline">特定商取引法に基づく表記</Link>
        </div>
        <div>
          <Link href="/terms" className="underline">利用規約</Link>
        </div>
        <div>
          <Link href="/privacy" className="underline">プライバシーポリシー</Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">法的情報</h1>
      <p className="text-sm text-slate-600">
        目的に応じて以下のページをご確認ください。
      </p>
      <div className="rounded-2xl border bg-white p-4 sm:p-6 text-sm text-slate-700 space-y-2">
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

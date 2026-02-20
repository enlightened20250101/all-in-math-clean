import Link from "next/link";

export default function TokushoPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Tokusho</div>
        <h1 className="text-xl sm:text-2xl font-semibold">特定商取引法に基づく表記</h1>
        <p className="text-sm text-slate-600">
          有料サービス提供時に必要となる表記です。内容は実運用に合わせて更新してください。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 text-sm text-slate-700 shadow-sm space-y-2">
        <div><span className="text-slate-500">販売事業者名：</span>（記入してください）</div>
        <div><span className="text-slate-500">運営責任者：</span>（記入してください）</div>
        <div><span className="text-slate-500">所在地：</span>（記入してください）</div>
        <div><span className="text-slate-500">お問い合わせ：</span>info.manganews@gmail.com</div>
        <div><span className="text-slate-500">販売価格：</span>各商品ページに記載</div>
        <div><span className="text-slate-500">支払方法：</span>クレジットカード等</div>
        <div><span className="text-slate-500">提供時期：</span>決済完了後、直ちに提供</div>
        <div><span className="text-slate-500">返品・キャンセル：</span>サービスの性質上、原則不可</div>
      </section>

      <div className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm text-sm text-slate-600">
        <Link href="/terms" className="underline">利用規約</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}

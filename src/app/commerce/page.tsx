import Link from "next/link";

export default function CommercePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">特定商取引法に関する情報</h1>
        <p className="text-sm text-slate-600">
          有料サービスを提供する場合に必要となる表記です。
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 text-sm text-slate-700 space-y-2">
        <div><span className="text-slate-500">販売事業者名：</span>（記入してください）</div>
        <div><span className="text-slate-500">運営責任者：</span>（記入してください）</div>
        <div><span className="text-slate-500">所在地：</span>（記入してください）</div>
        <div><span className="text-slate-500">お問い合わせ：</span>info.manganews@gmail.com</div>
        <div><span className="text-slate-500">販売価格：</span>各商品ページに記載</div>
        <div><span className="text-slate-500">支払方法：</span>クレジットカード等</div>
        <div><span className="text-slate-500">提供時期：</span>決済完了後、直ちに提供</div>
        <div><span className="text-slate-500">返品・キャンセル：</span>サービスの性質上、原則不可</div>
      </section>

      <div className="text-sm text-slate-600">
        <Link href="/refund" className="underline">返金・キャンセルポリシー</Link>
      </div>
    </div>
  );
}

export default function RefundPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Refund</div>
        <h1 className="text-xl sm:text-2xl font-semibold">返金・キャンセルポリシー</h1>
        <p className="text-sm text-slate-600">
          デジタルサービスの性質上、原則として返金はできません。
        </p>
      </header>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">1. 返金の原則</h2>
        <p>
          購入後の返金・キャンセルは、サービスの性質上原則として受け付けておりません。
        </p>
      </section>

      <section className="rounded-[20px] border border-slate-300/80 bg-white/95 p-4 sm:p-5 shadow-sm space-y-3 text-sm text-slate-700">
        <h2 className="text-base font-semibold">2. 例外対応</h2>
        <p>
          二重決済や重大な障害等、合理的な理由がある場合は個別に対応します。
        </p>
      </section>
    </div>
  );
}

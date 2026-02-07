export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">返金・キャンセルポリシー</h1>
        <p className="text-sm text-slate-600">
          デジタルサービスの性質上、原則として返金はできません。
        </p>
      </header>

      <section className="space-y-3 text-sm text-slate-700">
        <h2 className="text-lg font-semibold">1. 返金の原則</h2>
        <p>
          購入後の返金・キャンセルは、サービスの性質上原則として受け付けておりません。
        </p>
      </section>

      <section className="space-y-3 text-sm text-slate-700">
        <h2 className="text-lg font-semibold">2. 例外対応</h2>
        <p>
          二重決済や重大な障害等、合理的な理由がある場合は個別に対応します。
        </p>
      </section>
    </div>
  );
}

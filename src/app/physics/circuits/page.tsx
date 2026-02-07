// src/app/physics/circuits/page.tsx
import CircuitStudioClient from "./CircuitStudioClient";

export default function CircuitsPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">電子回路スタジオ（β）</h1>
        <p className="text-sm text-gray-600">
          下のパレットから部品を選んでキャンバスに配置し、「計測」タブで電流や電圧を確認できます。
        </p>
      </header>

      <div className="border rounded-lg bg-white shadow-sm">
        <CircuitStudioClient />
      </div>
    </main>
  );
}

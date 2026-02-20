// src/app/physics/circuits/page.tsx
import CircuitStudioClient from "./CircuitStudioClient";

export default function CircuitsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Circuits</div>
        <h1 className="text-xl sm:text-2xl font-semibold">電子回路スタジオ（β）</h1>
        <p className="text-sm text-slate-600">
          下のパレットから部品を選んでキャンバスに配置し、「計測」タブで電流や電圧を確認できます。
        </p>
      </header>

      <div className="rounded-[20px] border border-slate-300/80 bg-white/95 shadow-sm">
        <CircuitStudioClient />
      </div>
    </div>
  );
}

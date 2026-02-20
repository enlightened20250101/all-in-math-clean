// src/app/physics/page.tsx
import Link from "next/link";

export default function PhysicsTopPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="rounded-[24px] border border-slate-300/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-2">
        <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Physics</div>
        <h1 className="text-xl sm:text-2xl font-semibold">Physics Lab</h1>
        <p className="text-sm text-slate-600">
          電子回路や力学など、物理の世界を図やアニメーションで「さわって」学べる実験エリアです。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {/* 電子回路 */}
        <Link
          href="/physics/circuits"
          className="rounded-[20px] border border-slate-300/80 bg-white/95 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition block"
        >
          <h2 className="text-base sm:text-lg font-semibold">🔌 電子回路スタジオ</h2>
          <p className="text-sm text-slate-600 mt-1">
            自分で回路を組んで、電流・電圧・消費電力をリアルタイムに可視化。
            スマホでも操作しやすいインタラクティブ回路エディタです。
          </p>
          <p className="mt-2 text-xs text-slate-500">
            対応：直列・並列回路（β版）／オームの法則・キルヒホッフの法則
          </p>
        </Link>

        {/* ここに今後「力学」「波」などのカードを増やす */}
        <div className="rounded-[20px] border border-slate-300/80 bg-white/95 p-5 shadow-sm opacity-70">
          <h2 className="text-base sm:text-lg font-semibold">🚧 Coming soon</h2>
          <p className="text-sm text-slate-600 mt-1">
            力学・波動・電磁気など、他の分野の「さわれる可視化」も順次追加予定です。
          </p>
        </div>
      </section>
    </div>
  );
}

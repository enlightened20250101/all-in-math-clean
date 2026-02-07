// src/app/physics/page.tsx
import Link from "next/link";

export default function PhysicsTopPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Physics Lab</h1>
        <p className="text-sm text-gray-600">
          電子回路や力学など、物理の世界を図やアニメーションで「さわって」学べる実験エリアです。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {/* 電子回路 */}
        <Link
          href="/physics/circuits"
          className="border rounded-lg p-4 hover:bg-gray-50 transition block"
        >
          <h2 className="text-lg font-semibold">🔌 電子回路スタジオ</h2>
          <p className="text-sm text-gray-600 mt-1">
            自分で回路を組んで、電流・電圧・消費電力をリアルタイムに可視化。
            スマホでも操作しやすいインタラクティブ回路エディタです。
          </p>
          <p className="mt-2 text-xs text-gray-500">
            対応：直列・並列回路（β版）／オームの法則・キルヒホッフの法則
          </p>
        </Link>

        {/* ここに今後「力学」「波」などのカードを増やす */}
        <div className="border rounded-lg p-4 opacity-60">
          <h2 className="text-lg font-semibold">🚧 Coming soon</h2>
          <p className="text-sm text-gray-600 mt-1">
            力学・波動・電磁気など、他の分野の「さわれる可視化」も順次追加予定です。
          </p>
        </div>
      </section>
    </main>
  );
}

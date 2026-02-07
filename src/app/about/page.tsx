import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">All in Mathematicsについて</h1>
        <p className="text-sm text-slate-600">
          数学学習を継続しやすくするための学習・コミュニティサービスです。
        </p>
      </header>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">できること</h2>
        <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
          <li>コース学習で学習計画とロードマップを可視化</li>
          <li>共通テスト対策の演習と復習管理</li>
          <li>質問投稿・掲示板による学習サポート</li>
        </ul>
      </section>

      <section className="rounded-2xl border bg-white p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">運営方針</h2>
        <p className="text-sm text-slate-700">
          学習の継続性・理解度向上・コミュニティの健全性を重視し、機能改善を継続します。
        </p>
      </section>

      <div className="text-sm text-slate-600">
        <Link href="/contact" className="underline">お問い合わせ</Link> ・{" "}
        <Link href="/terms" className="underline">利用規約</Link> ・{" "}
        <Link href="/privacy" className="underline">プライバシーポリシー</Link>
      </div>
    </div>
  );
}

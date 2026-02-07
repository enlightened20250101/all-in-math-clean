// src/app/labs/animation/page.tsx
import Link from 'next/link';
import { CATEGORIES } from '@/data/animation_catalog';

export default function AnimationHome() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Animation Lab — 単元カタログ</h1>
        <p className="text-sm text-gray-500">観て・触って・腑に落ちる</p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.slug}
            href={`/labs/animation/${cat.slug}`}
            className="group rounded-2xl border p-5 hover:shadow-md transition bg-white"
          >
            <div className="text-3xl mb-3">{cat.thumbnail}</div>
            <div className="font-semibold">{cat.title}</div>
            <div className="text-xs text-gray-500 mt-1">{cat.templates.length} テンプレ</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {cat.templates.slice(0,3).map(t => (
                <span key={t.id} className="text-xs px-2 py-1 rounded-full bg-gray-100">{t.title}</span>
              ))}
              {cat.templates.length > 3 && <span className="text-xs text-gray-400">…</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

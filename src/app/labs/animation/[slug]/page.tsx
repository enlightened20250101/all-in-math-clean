// src/app/labs/animation/[slug]/page.tsx
import Link from 'next/link';
import { CATEGORIES } from '@/data/animation_catalog';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = CATEGORIES.find(c => c.slug === slug);
  if (!cat) return <div>Not found</div>;
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{cat.title} のテンプレ一覧</h1>
        <Link href="/labs/animation" className="text-sm underline">← 戻る</Link>
      </header>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cat.templates.map(t => (
          <Link
            key={t.id}
            href={`/labs/animation/${cat.slug}/${t.id}`}
            className="rounded-2xl border p-5 hover:shadow-md transition bg-white flex flex-col"
          >
            <div className="text-xs text-gray-500">{t.level.toUpperCase()}</div>
            <div className="mt-1 font-semibold">{t.title}</div>
            <div className="text-sm text-gray-600 mt-2 line-clamp-2">{t.description}</div>
            <div className="mt-auto text-xs text-gray-400 pt-4">クリックして開く</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

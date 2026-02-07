import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-xl font-semibold">ページが見つかりません</h1>
      <p className="text-sm text-gray-600 mt-2">URLが正しいか確認してください。</p>
      <Link href="/groups" className="underline mt-4 inline-block">グループ一覧に戻る</Link>
    </div>
  );
}

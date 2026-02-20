import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">All in Math</div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <Link href="/about" className="hover:underline">このサイトについて</Link>
            <Link href="/company" className="hover:underline">運営者情報</Link>
            <Link href="/guidelines" className="hover:underline">ガイドライン</Link>
            <Link href="/contact" className="hover:underline">お問い合わせ</Link>
            <Link href="/tokusho" className="hover:underline">特定商取引法に基づく表記</Link>
            <Link href="/refund" className="hover:underline">返金・キャンセル</Link>
            <Link href="/cookie" className="hover:underline">Cookieポリシー</Link>
            <Link href="/terms" className="hover:underline">利用規約</Link>
            <Link href="/privacy" className="hover:underline">プライバシーポリシー</Link>
          </div>
        </div>
        <div className="text-[10px] text-slate-500">
          © {new Date().getFullYear()} All in Math. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import 'katex/dist/katex.min.css';
import SessionSync from '@/components/SessionSync';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  metadataBase: new URL("https://all-in-math.com"),
  title: {
    default: "オルマ",
    template: "%s | オルマ",
  },
  description:
    "オルマは数学の学習・質問・記事が一体化した日本語向け数学コミュニティ。TeX対応で式も書きやすく、コース学習・掲示板・Q&Aが揃っています。",
  applicationName: "オルマ",
  keywords: [
    "数学",
    "高校数学",
    "数1",
    "数2",
    "数3",
    "数A",
    "数B",
    "数C",
    "共通テスト",
    "受験",
    "質問",
    "解説",
    "掲示板",
    "コミュニティ",
    "TeX",
    "数式",
  ],
  openGraph: {
    title: "オルマ",
    description:
      "数学の学習・質問・記事が一体化した日本語向け数学コミュニティ。TeX対応で数式もスムーズ。",
    type: "website",
    siteName: "オルマ",
    locale: "ja_JP",
    url: "https://all-in-math.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "オルマ",
    description:
      "数学の学習・質問・記事が一体化した日本語向け数学コミュニティ。TeX対応で数式もスムーズ。",
  },
  alternates: {
    canonical: "https://all-in-math.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon" }],
    apple: [{ url: "/apple-icon" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css"
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900">
        <SessionSync />
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

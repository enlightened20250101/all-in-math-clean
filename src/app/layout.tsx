// src/app/layout.tsx
import type { Metadata } from 'next';
import Script from 'next/script';
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
    "オルマは高校数学〜大学受験の学習・質問・解説記事が揃う日本語数学コミュニティ。TeX対応の数式入力で、コース学習とQ&Aを効率化。",
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
      "高校数学〜大学受験の学習・質問・解説記事が揃う日本語数学コミュニティ。TeX対応の数式入力で学習を効率化。",
    type: "website",
    siteName: "オルマ",
    locale: "ja_JP",
    url: "https://all-in-math.com",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "オルマ",
    description:
      "高校数学〜大学受験の学習・質問・解説記事が揃う日本語数学コミュニティ。TeX対応の数式入力で学習を効率化。",
    images: ["/twitter-image"],
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
  const baseUrl = 'https://all-in-math.com';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'オルマ',
    url: baseUrl,
    inLanguage: 'ja-JP',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'オルマ',
      url: baseUrl,
    },
  };
  return (
    <html lang="ja">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/jsxgraph/distrib/jsxgraph.css"
        />
        <Script
          id="ld-web-site"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
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

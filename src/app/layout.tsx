// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import 'katex/dist/katex.min.css';
import SessionSync from '@/components/SessionSync';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: "All in Math",
  description: "数学のことならなんでもお任せ。数学コミュニティ × 記事 × 掲示板。",
  applicationName: "All in Math",
  openGraph: {
    title: "All in Math",
    description: "数学のことならなんでもお任せ。数学コミュニティ × 記事 × 掲示板。",
    type: "website",
    siteName: "All in Math",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "All in Math",
    description: "数学のことならなんでもお任せ。数学コミュニティ × 記事 × 掲示板。",
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

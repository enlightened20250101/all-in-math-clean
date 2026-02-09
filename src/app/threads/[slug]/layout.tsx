import type { Metadata } from "next";
import { supabaseServerPublic } from "@/lib/supabaseServerPublic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const sb = supabaseServerPublic();
  const { slug } = await params;
  const { data } = await sb
    .from("threads")
    .select("title, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!data?.title) {
    return { title: "スレッドが見つかりません" };
  }

  const description = "数学の話題を議論するスレッドです。";
  return {
    title: data.title,
    description,
    openGraph: {
      title: data.title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: data.title,
      description,
    },
  };
}

export default async function ThreadLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = supabaseServerPublic();
  const { data } = await sb
    .from("threads")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();

  const baseUrl = "https://all-in-math.com";
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "スレッド一覧", item: `${baseUrl}/threads` },
      {
        "@type": "ListItem",
        position: 3,
        name: data?.title ?? "スレッド",
        item: `${baseUrl}/threads/${slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      {children}
    </>
  );
}

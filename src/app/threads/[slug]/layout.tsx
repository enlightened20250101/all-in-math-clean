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

export default function ThreadLayout({ children }: { children: React.ReactNode }) {
  return children;
}

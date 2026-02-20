import type { MetadataRoute } from "next";
import { supabaseServerPublic } from "@/lib/supabaseServerPublic";
import { TOPICS } from "@/lib/course/topics";

const baseUrl = "https://all-in-math.com";

const staticRoutes = [
  "",
  "/about",
  "/contact",
  "/company",
  "/legal",
  "/privacy",
  "/terms",
  "/refund",
  "/cookie",
  "/tokusho",
  "/course",
  "/course/writeup",
  "/course/writeup/list",
  "/articles",
  "/threads",
  "/posts",
  "/posts/unanswered",
  "/search",
  "/groups",
  "/graphs",
  "/learn",
  "/login",
  "/auth",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  for (const topic of TOPICS) {
    entries.push({
      url: `${baseUrl}/course/topics/${topic.id}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  try {
    const sb = supabaseServerPublic();
    const [{ data: articles }, { data: threads }, { data: posts }] = await Promise.all([
      sb.from("articles").select("slug, updated_at").order("updated_at", { ascending: false }).limit(500),
      sb.from("threads").select("slug, updated_at").order("updated_at", { ascending: false }).limit(500),
      sb.from("posts").select("id, updated_at").order("updated_at", { ascending: false }).limit(500),
    ]);

    (articles ?? []).forEach((a) => {
      if (!a.slug) return;
      entries.push({
        url: `${baseUrl}/articles/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    (threads ?? []).forEach((t) => {
      if (!t.slug) return;
      entries.push({
        url: `${baseUrl}/threads/${t.slug}`,
        lastModified: t.updated_at ? new Date(t.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    });

    (posts ?? []).forEach((p) => {
      if (!p.id) return;
      entries.push({
        url: `${baseUrl}/posts/${p.id}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  } catch {
    // fallback to static + topics
  }

  return entries;
}

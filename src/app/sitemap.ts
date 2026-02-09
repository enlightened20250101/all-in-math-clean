import type { MetadataRoute } from "next";

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
  "/groups",
  "/graphs",
  "/learn",
  "/login",
  "/auth",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}

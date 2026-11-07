import type { MetadataRoute } from "next";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { pageUrl } from "@/lib/seo";

export const dynamic = "force-static";

interface BlogEntry {
  slug: string;
  updated_at: string;
}

async function getBlogEntries(): Promise<BlogEntry[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("slug,updated_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as BlogEntry[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: pageUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: pageUrl("/products"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: pageUrl("/collaboration"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { url: pageUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: pageUrl("/contact"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const posts = await getBlogEntries();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: pageUrl(`/blog/${post.slug}`),
    lastModified: post.updated_at ? new Date(post.updated_at) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}

import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { BlogListView, type BlogListItem } from "@/components/marketing/BlogListView";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { buildMetadata, pageUrl } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Blog Dessert & Jajanan Viral Sukoharjo & Surakarta",
  description:
    "Artikel, tips, dan kabar terbaru dari Gee Co. tentang dessert, jajanan viral, dan pasokan kue untuk cafe di Sukoharjo dan Surakarta.",
  path: "/blog",
  keywords: [
    "blog dessert sukoharjo",
    "tips jajanan viral",
    "supplier dessert surakarta",
    "Gee Co blog",
  ],
});

async function getPublishedPosts(): Promise<BlogListItem[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image_url,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as BlogListItem[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Blog Gee Co.",
          url: pageUrl("/blog"),
          inLanguage: "id-ID",
          publisher: { "@id": `${pageUrl("/")}#organization` },
          blogPost: posts.map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || undefined,
            url: pageUrl(`/blog/${post.slug}`),
            datePublished: post.published_at ?? undefined,
            image: post.cover_image_url || undefined,
          })),
        }}
      />
      <BlogListView posts={posts} />
    </>
  );
}

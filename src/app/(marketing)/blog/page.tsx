import Link from "next/link";
import type { Metadata } from "next";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description: "Artikel dan kabar terbaru dari Gee Co.",
};

interface PostListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  published_at: string | null;
}

async function getPublishedPosts(): Promise<PostListItem[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("id,slug,title,excerpt,cover_image_url,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) return [];
    return (data ?? []) as PostListItem[];
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Blog</h1>
      <p className="mt-2 text-slate-600">Kabar, tips, dan cerita dari Gee Co.</p>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Belum ada artikel yang diterbitkan.
        </p>
      ) : (
        <ul className="mt-10 space-y-6">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
              >
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : null}
                <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                  {post.title}
                </h2>
                {post.published_at ? (
                  <p className="mt-1 text-xs text-slate-400">{formatDate(post.published_at)}</p>
                ) : null}
                {post.excerpt ? (
                  <p className="mt-2 text-sm text-slate-600">{post.excerpt}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

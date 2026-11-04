import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/Markdown";
import type { BlogPost } from "@/lib/types";

export const dynamicParams = false;

// Dengan `output: export`, rute dinamis wajib menghasilkan minimal satu halaman.
// Saat blog masih kosong kami generate satu halaman "segera hadir" yang otomatis
// hilang begitu artikel pertama diterbitkan.
const PLACEHOLDER_SLUG = "segera-hadir";

async function getPublishedSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data } = await getSupabase().from("blog_posts").select("slug").eq("published", true);
    return (data ?? []).map((row) => (row as { slug: string }).slug);
  } catch {
    return [];
  }
}

async function getPost(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await getSupabase()
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  if (slugs.length === 0) return [{ slug: PLACEHOLDER_SLUG }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug === PLACEHOLDER_SLUG) return { title: "Blog", robots: { index: false } };
  const post = await getPost(slug);
  if (!post) return { title: "Artikel tidak ditemukan" };
  return {
    title: post.title,
    description: post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === PLACEHOLDER_SLUG) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:underline">
          ← Semua artikel
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Blog segera hadir
        </h1>
        <p className="mt-4 text-base text-slate-600">
          Kami sedang menyiapkan artikel pertama. Nantikan kabar dan cerita dari Gee Co.
        </p>
      </div>
    );
  }

  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <Link href="/blog" className="text-sm font-medium text-indigo-600 hover:underline">
        ← Semua artikel
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        {post.title}
      </h1>
      {post.published_at ? (
        <p className="mt-2 text-sm text-slate-400">{formatDate(post.published_at)}</p>
      ) : null}
      {post.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-6 h-auto w-full rounded-xl object-cover"
        />
      ) : null}
      <Markdown content={post.content_md} className="mt-8" />
    </article>
  );
}

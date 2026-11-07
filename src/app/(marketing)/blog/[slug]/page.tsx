import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatDate } from "@/lib/format";
import { Markdown } from "@/components/Markdown";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StructuredData } from "@/components/StructuredData";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
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
  if (!post) return { title: "Artikel tidak ditemukan", robots: { index: false } };
  return buildMetadata({
    title: post.title,
    description: post.excerpt || "Artikel dari Gee Co. Sukoharjo.",
    path: `/blog/${post.slug}`,
    image: post.cover_image_url || undefined,
    type: "article",
    publishedTime: post.published_at ?? post.created_at,
    modifiedTime: post.updated_at,
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (slug === PLACEHOLDER_SLUG) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <Link href="/blog" className="text-sm font-semibold text-pistachio hover:text-pistachio-dark">
          ← Semua artikel
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Blog segera hadir
        </h1>
        <p className="mt-4 text-base text-ink-soft">
          Kami sedang menyiapkan artikel pertama. Nantikan kabar dan cerita dari Gee Co.
        </p>
      </div>
    );
  }

  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <StructuredData
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <article className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <Breadcrumbs
          items={[
            { name: "Beranda", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: post.title, href: `/blog/${post.slug}` },
          ]}
        />
        <Link
          href="/blog"
          className="mt-4 inline-block text-sm font-semibold text-pistachio hover:text-pistachio-dark"
        >
          ← Semua artikel
        </Link>
      <h1 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
        {post.title}
      </h1>
      {post.published_at ? (
        <p className="mt-2 text-xs font-medium uppercase tracking-wider text-ink-soft/70">
          {formatDate(post.published_at)}
        </p>
      ) : null}
      {post.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.cover_image_url}
          alt=""
          className="mt-6 h-auto w-full rounded-2xl object-cover"
        />
      ) : null}
        <Markdown content={post.content_md} className="mt-8" />
        <p className="mt-10 border-t border-line pt-4 text-xs text-ink-soft/70">
          Terakhir diperbarui: {formatDate(post.updated_at)} · Gee Co. Sukoharjo
        </p>
      </article>
    </>
  );
}

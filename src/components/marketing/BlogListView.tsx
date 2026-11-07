"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/language";
import { formatDate } from "@/lib/format";

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
  published_at: string | null;
}

const COPY = {
  id: {
    home: "Beranda",
    blog: "Blog",
    title: "Blog",
    intro: "Tips dessert, cerita dapur, dan kabar terbaru dari Gee Co. Sukoharjo.",
    empty: "Belum ada artikel yang diterbitkan.",
  },
  en: {
    home: "Home",
    blog: "Blog",
    title: "Blog",
    intro: "Dessert tips, kitchen stories, and the latest news from Gee Co. Sukoharjo.",
    empty: "No articles have been published yet.",
  },
};

export function BlogListView({ posts }: { posts: BlogListItem[] }) {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 md:px-8 md:py-20">
      <Breadcrumbs
        items={[
          { name: t.home, href: "/" },
          { name: t.blog, href: "/blog" },
        ]}
      />

      <header className="mt-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">{t.intro}</p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-dashed border-line bg-white/60 p-10 text-center text-sm text-ink-soft">
          {t.empty}
        </p>
      ) : (
        <ul className="mt-10 space-y-5">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-pistachio/30 hover:shadow-md"
              >
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="mb-5 h-48 w-full rounded-2xl object-cover"
                  />
                ) : null}
                <h2 className="font-display text-xl font-semibold text-ink transition group-hover:text-pistachio">
                  {post.title}
                </h2>
                {post.published_at ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-ink-soft/70">
                    {formatDate(post.published_at)}
                  </p>
                ) : null}
                {post.excerpt ? (
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{post.excerpt}</p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

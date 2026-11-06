"use client";

import Link from "next/link";
import { formatDate } from "@/lib/format";
import { canManageBlog, useCurrentProfile } from "@/lib/db/users";
import { useBlogPosts, useDeleteBlogPost } from "@/lib/db/blog";
import { Button, Card, EmptyState, LinkButton, PageHeader } from "@/components/ui";
import { ResponsiveTable } from "@/components/ResponsiveTable";
import { useFeedback } from "@/components/feedback";

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      className={
        published
          ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
          : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
      }
    >
      {published ? "Terbit" : "Draf"}
    </span>
  );
}

export default function AdminBlogPage() {
  const profileQuery = useCurrentProfile();
  const postsQuery = useBlogPosts();
  const deletePost = useDeleteBlogPost();
  const { confirm, notify } = useFeedback();

  if (profileQuery.isLoading) {
    return <Card className="p-6 text-sm text-slate-400">Memeriksa akses…</Card>;
  }

  if (!canManageBlog(profileQuery.data?.role)) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">
          Halaman ini hanya untuk peran <strong>editor</strong> atau <strong>superuser</strong>.
        </p>
      </Card>
    );
  }

  const posts = postsQuery.data ?? [];

  async function remove(id: string, title: string) {
    const ok = await confirm({
      title: "Hapus Artikel",
      message: `Hapus artikel "${title}"? Tindakan ini permanen.`,
      confirmLabel: "Hapus",
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePost.mutateAsync(id);
    } catch (err) {
      notify({
        title: "Gagal menghapus",
        message: err instanceof Error ? err.message : "Gagal menghapus artikel.",
      });
    }
  }

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Tulis dan kelola artikel yang tampil di situs publik."
        actions={
          <LinkButton href="/admin/blog/edit">+ Artikel Baru</LinkButton>
        }
      />

      {postsQuery.isLoading ? (
        <Card className="p-6 text-sm text-slate-400">Memuat artikel…</Card>
      ) : postsQuery.isError ? (
        <Card className="p-6 text-sm text-rose-600">Gagal memuat artikel. Coba muat ulang.</Card>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Belum ada artikel"
          description="Buat artikel pertama Anda. Setelah diterbitkan, situs publik akan dibangun ulang otomatis."
          action={<LinkButton href="/admin/blog/edit">+ Artikel Baru</LinkButton>}
        />
      ) : (
        <Card>
          <ResponsiveTable
            items={posts}
            getKey={(post) => post.id}
            minWidth="min-w-[720px]"
            head={
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Judul</th>
                <th className="px-4 py-3 font-semibold">Slug</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Diperbarui</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            }
            renderCard={(post) => (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-slate-800">
                    {post.title || "(tanpa judul)"}
                  </p>
                  <StatusPill published={post.published} />
                </div>
                {post.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{post.excerpt}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-400">
                  {post.slug || "-"} · Diperbarui {formatDate(post.updated_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.published ? (
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      Lihat
                    </Link>
                  ) : null}
                  <LinkButton href={`/admin/blog/edit?id=${post.id}`} variant="ghost">
                    Edit
                  </LinkButton>
                  <Button variant="ghost" onClick={() => remove(post.id, post.title)}>
                    Hapus
                  </Button>
                </div>
              </>
            )}
            renderRow={(post) => (
              <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{post.title || "(tanpa judul)"}</span>
                  {post.excerpt ? (
                    <span className="mt-0.5 block max-w-md truncate text-xs text-slate-400">
                      {post.excerpt}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{post.slug || "-"}</td>
                <td className="px-4 py-3">
                  <StatusPill published={post.published} />
                </td>
                <td className="px-4 py-3 text-slate-500">{formatDate(post.updated_at)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    {post.published ? (
                      <Link
                        href={`/blog/${post.slug}`}
                        className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                      >
                        Lihat
                      </Link>
                    ) : null}
                    <LinkButton href={`/admin/blog/edit?id=${post.id}`} variant="ghost">
                      Edit
                    </LinkButton>
                    <Button variant="ghost" onClick={() => remove(post.id, post.title)}>
                      Hapus
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        </Card>
      )}
    </div>
  );
}

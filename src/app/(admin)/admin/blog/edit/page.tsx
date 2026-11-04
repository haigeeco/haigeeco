"use client";

import { Suspense, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BlogPost } from "@/lib/types";
import { slugify } from "@/lib/format";
import { canManageBlog, useCurrentProfile } from "@/lib/db/users";
import {
  blankBlogPost,
  triggerDeployHook,
  useBlogPosts,
  useSaveBlogPost,
} from "@/lib/db/blog";
import { uploadPublicAsset } from "@/lib/db/storage";
import { useSettings } from "@/lib/db/settings";
import { Markdown } from "@/components/Markdown";
import { Button, Card, Field, Input, LinkButton, PageHeader, Textarea } from "@/components/ui";

function BlogEditorInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id") ?? "";

  const postsQuery = useBlogPosts();
  const profileQuery = useCurrentProfile();
  const savePost = useSaveBlogPost();
  const deployHookUrl = useSettings().data?.deployHookUrl;

  const [edits, setEdits] = useState<Partial<BlogPost>>({});
  const [slugTouched, setSlugTouched] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const blank = useMemo(() => blankBlogPost(profileQuery.data?.id ?? null), [profileQuery.data?.id]);
  const existing = id ? (postsQuery.data ?? []).find((post) => post.id === id) : undefined;
  const ready = !postsQuery.isLoading && !profileQuery.isLoading;
  const notFound = ready && Boolean(id) && !existing;
  const source = existing ?? (id ? null : blank);
  const form: BlogPost | null = source ? { ...source, ...edits } : null;
  const slugLocked = slugTouched || Boolean(existing);

  function patch(next: Partial<BlogPost>) {
    setEdits((current) => ({ ...current, ...next }));
    setError("");
  }

  async function handleCover(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadPublicAsset(file, "blog");
      patch({ cover_image_url: url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;

    const title = form.title.trim();
    const slug = (form.slug.trim() || slugify(form.title)).trim();
    const content_md = form.content_md.trim();

    if (!title) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!slug) {
      setError("Slug wajib diisi (atau gunakan judul yang mengandung huruf/angka).");
      return;
    }
    if (!content_md) {
      setError("Isi artikel wajib diisi.");
      return;
    }

    setError("");
    const wasPublished = Boolean(existing?.published);
    try {
      await savePost.mutateAsync({ ...form, title, slug, content_md });
      if (form.published && !wasPublished) await triggerDeployHook(deployHookUrl);
      router.push("/admin/blog");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan artikel.";
      setError(
        message.includes("duplicate") || message.includes("23505")
          ? "Slug sudah dipakai artikel lain. Gunakan slug berbeda."
          : message
      );
    }
  }

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

  if (postsQuery.isError) {
    return <Card className="p-6 text-sm text-rose-600">Gagal memuat artikel. Coba muat ulang.</Card>;
  }

  if (notFound) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">Artikel tidak ditemukan.</p>
        <div className="mt-4">
          <LinkButton href="/admin/blog" variant="secondary">
            Kembali ke daftar
          </LinkButton>
        </div>
      </Card>
    );
  }

  if (!form) {
    return <Card className="p-6 text-sm text-slate-400">Memuat editor…</Card>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title={existing ? "Edit Artikel" : "Artikel Baru"}
        description="Tulis dalam Markdown. Perubahan tampil di situs publik setelah diterbitkan."
        actions={
          <>
            <LinkButton href="/admin/blog" variant="secondary">
              Batal
            </LinkButton>
            <Button type="submit" disabled={savePost.isPending || uploading}>
              {savePost.isPending ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <Field label="Judul">
            <Input
              value={form.title}
              onChange={(event) =>
                patch({
                  title: event.target.value,
                  slug: slugLocked ? form.slug : slugify(event.target.value),
                })
              }
              placeholder="Contoh: 5 Tips Memilih Dessert untuk Kafe"
            />
          </Field>

          <Field label="Slug" hint="Alamat URL artikel: /blog/slug-ini">
            <Input
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                patch({ slug: event.target.value });
              }}
              placeholder="slug-artikel"
            />
          </Field>

          <Field label="Ringkasan" hint="Tampil di daftar blog dan pratinjau media sosial.">
            <Textarea
              value={form.excerpt}
              onChange={(event) => patch({ excerpt: event.target.value })}
              placeholder="Satu atau dua kalimat ringkas tentang artikel ini."
            />
          </Field>

          <Field label="Gambar Sampul">
            <div className="flex items-center gap-3">
              {form.cover_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.cover_image_url}
                  alt="Sampul"
                  className="h-16 w-24 rounded-lg border border-slate-200 object-cover"
                />
              ) : (
                <span className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                  —
                </span>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {uploading ? "Mengunggah…" : "Pilih file"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCover}
                    disabled={uploading}
                  />
                </label>
                {form.cover_image_url ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => patch({ cover_image_url: "" })}
                  >
                    Hapus
                  </Button>
                ) : null}
              </div>
            </div>
          </Field>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(event) => patch({ published: event.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
            />
            Terbitkan artikel
          </label>

          {form.published && !existing?.published ? (
            <p className="text-xs text-slate-500">
              Saat disimpan, situs publik akan dibangun ulang otomatis agar artikel muncul.
            </p>
          ) : null}
        </Card>

        <Card className="flex flex-col p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Isi Artikel
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPreview((value) => !value)}
            >
              {showPreview ? "Tulis" : "Pratinjau"}
            </Button>
          </div>
          {showPreview ? (
            <div className="min-h-[420px] overflow-auto rounded-lg border border-slate-200 p-4">
              {form.content_md.trim() ? (
                <Markdown content={form.content_md} />
              ) : (
                <p className="text-sm text-slate-400">Belum ada isi untuk dipratinjau.</p>
              )}
            </div>
          ) : (
            <Textarea
              value={form.content_md}
              onChange={(event) => patch({ content_md: event.target.value })}
              className="min-h-[420px] font-mono text-[13px]"
              placeholder={
                "## Sub-judul\n\nTulis paragraf di sini. Mendukung **tebal**, *miring*, - daftar, dan [tautan](https://contoh.com)."
              }
            />
          )}
        </Card>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </form>
  );
}

export default function BlogEditorPage() {
  return (
    <Suspense fallback={<Card className="p-6 text-sm text-slate-400">Memuat…</Card>}>
      <BlogEditorInner />
    </Suspense>
  );
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import type { BlogPost } from "@/lib/types";
import { newId, nowIso } from "@/lib/ids";

const KEY = ["blog-posts"] as const;

export function useBlogPosts() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<BlogPost[]> => {
      const { data, error } = await getSupabase()
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as BlogPost[];
    },
  });
}

export function blankBlogPost(authorId: string | null): BlogPost {
  const stamp = nowIso();
  return {
    id: newId(),
    slug: "",
    title: "",
    excerpt: "",
    content_md: "",
    cover_image_url: "",
    published: false,
    published_at: null,
    author_id: authorId,
    created_at: stamp,
    updated_at: stamp,
  };
}

export function useSaveBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: BlogPost) => {
      const stamp = nowIso();
      const publishedAt = post.published ? post.published_at ?? stamp : null;
      const { error } = await getSupabase()
        .from("blog_posts")
        .upsert({ ...post, published_at: publishedAt, updated_at: stamp });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await getSupabase().from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
  });
}

export async function triggerDeployHook(url: string | undefined): Promise<void> {
  if (!url) return;
  try {
    await fetch(url, { method: "POST" });
  } catch {
    // Non-fatal: artikel tetap tersimpan walau rebuild gagal dipicu.
  }
}

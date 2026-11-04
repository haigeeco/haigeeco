"use client";

import { getSupabase } from "@/lib/supabase/client";
import { newId } from "@/lib/ids";

export async function uploadPublicAsset(file: File, folder = "assets"): Promise<string> {
  const supabase = getSupabase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${newId()}.${extension}`;
  const { error } = await supabase.storage.from("public-assets").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
  return data.publicUrl;
}

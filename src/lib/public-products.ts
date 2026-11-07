import { slugify } from "@/lib/format";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { PRODUCT_CATALOG, type SeoProduct } from "@/lib/seo-content";

// Hanya kolom aman yang boleh dibaca publik. Harga B2B (`price`) sengaja
// tidak pernah diminta di sini agar tidak bocor ke bundle/HTML publik.
const PUBLIC_COLUMNS =
  "id,name,description,category,unit,customer_price,image_url,sort_order";

export interface PublicProductRow {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  unit: string | null;
  customer_price: number | string | null;
  image_url: string | null;
  sort_order: number | null;
}

export function mapPublicProduct(row: PublicProductRow, index: number): SeoProduct {
  const name = (row.name ?? "").trim();
  const description = (row.description ?? "").trim();
  const category = (row.category ?? "").trim() || "Dessert";
  const unit = (row.unit ?? "").trim() || "pcs";
  const price = Number(row.customer_price ?? 0);

  return {
    slug: slugify(name) || `product-${index + 1}`,
    name,
    category,
    categoryEn: category,
    summary: description || name,
    summaryEn: description || name,
    description: description || name,
    descriptionEn: description || name,
    unit,
    priceFrom: Number.isFinite(price) && price > 0 ? price : undefined,
    tags: [],
    tagsEn: [],
    bestFor: "",
    bestForEn: "",
    imageUrl: (row.image_url ?? "").trim(),
  };
}

export async function fetchPublicProducts(): Promise<SeoProduct[]> {
  if (!isSupabaseConfigured) return PRODUCT_CATALOG;

  const { data, error } = await getSupabase()
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("active", true)
    .eq("website_visible", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return PRODUCT_CATALOG;
  return (data as PublicProductRow[]).map(mapPublicProduct);
}

export async function getPublicProducts(): Promise<SeoProduct[]> {
  try {
    return await fetchPublicProducts();
  } catch {
    // DB/migrasi belum siap: situs tetap tampil dengan katalog statis.
    return PRODUCT_CATALOG;
  }
}

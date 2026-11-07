import { describe, expect, it } from "vitest";
import { mapPublicProduct, type PublicProductRow } from "./public-products";

function row(partial: Partial<PublicProductRow>): PublicProductRow {
  return {
    id: "p1",
    name: "Dubai Chewy",
    description: "Chewy cookie pistachio.",
    category: "Jajanan viral",
    unit: "pcs",
    customer_price: 30000,
    image_url: "https://example.com/dubai.jpg",
    sort_order: 1,
    ...partial,
  };
}

describe("mapPublicProduct", () => {
  it("memetakan kolom publik ke katalog SEO", () => {
    const product = mapPublicProduct(row({}), 0);
    expect(product.name).toBe("Dubai Chewy");
    expect(product.slug).toBe("dubai-chewy");
    expect(product.category).toBe("Jajanan viral");
    expect(product.unit).toBe("pcs");
    expect(product.priceFrom).toBe(30000);
    expect(product.imageUrl).toBe("https://example.com/dubai.jpg");
    expect(product.tags).toEqual([]);
  });

  it("tidak pernah memakai harga B2B saat customer_price kosong", () => {
    const withB2B = {
      ...row({ customer_price: null }),
      price: 999000,
    } as unknown as PublicProductRow;

    const product = mapPublicProduct(withB2B, 0);
    expect(product.priceFrom).toBeUndefined();
  });

  it("memberi fallback kategori dan satuan", () => {
    const product = mapPublicProduct(row({ category: "", unit: "", name: "" }), 2);
    expect(product.category).toBe("Dessert");
    expect(product.unit).toBe("pcs");
    expect(product.slug).toBe("product-3");
  });

  it("menangani deskripsi kosong dengan nama produk", () => {
    const product = mapPublicProduct(row({ description: "" }), 0);
    expect(product.summary).toBe("Dubai Chewy");
    expect(product.description).toBe("Dubai Chewy");
  });
});

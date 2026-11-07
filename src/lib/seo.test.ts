import { describe, expect, it } from "vitest";
import {
  BUSINESS,
  SITE_URL,
  absoluteUrl,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  pageUrl,
  productsJsonLd,
  serviceJsonLd,
  websiteJsonLd,
  whatsappHref,
} from "./seo";
import { PRODUCT_CATALOG } from "./seo-content";
import type { BlogPost } from "./types";

describe("URL helpers", () => {
  it("membuat URL halaman dengan trailing slash", () => {
    expect(pageUrl("/products")).toBe(`${SITE_URL}/products/`);
    expect(pageUrl("collaboration")).toBe(`${SITE_URL}/collaboration/`);
    expect(pageUrl("/")).toBe(`${SITE_URL}/`);
  });

  it("membuat URL aset tanpa memaksa trailing slash", () => {
    expect(absoluteUrl("/sitemap.xml")).toBe(`${SITE_URL}/sitemap.xml`);
    expect(absoluteUrl("img/logo-320.png")).toBe(`${SITE_URL}/img/logo-320.png`);
  });

  it("membiarkan URL absolut apa adanya", () => {
    expect(absoluteUrl("https://example.com/a.png")).toBe("https://example.com/a.png");
  });

  it("mengembalikan tautan kontak bila nomor WhatsApp belum diisi", () => {
    if (!BUSINESS.whatsapp) {
      expect(whatsappHref()).toBe("/contact/");
    }
  });
});

describe("schema organisasi & bisnis lokal", () => {
  it("organization memiliki @id, nama, dan logo absolut", () => {
    const schema = organizationJsonLd();
    expect(schema["@type"]).toBe("Organization");
    expect(schema["@id"]).toBe(`${SITE_URL}/#organization`);
    expect(schema.name).toBe(BUSINESS.name);
    expect(schema.logo.startsWith("http")).toBe(true);
  });

  it("website menunjuk publisher organisasi", () => {
    const schema = websiteJsonLd();
    expect(schema["@type"]).toBe("WebSite");
    expect(schema.publisher).toEqual({ "@id": `${SITE_URL}/#organization` });
  });

  it("local business adalah Bakery di Sukoharjo", () => {
    const schema = localBusinessJsonLd();
    expect(schema["@type"]).toBe("Bakery");
    expect(schema.address.addressLocality).toBe("Sukoharjo");
    expect(schema.areaServed.length).toBeGreaterThan(0);
    expect(schema.hasMenu).toBe(pageUrl("/products"));
  });

  it("service supplier menunjuk penyedia local business", () => {
    const schema = serviceJsonLd();
    expect(schema["@type"]).toBe("Service");
    expect(schema.provider).toEqual({ "@id": `${SITE_URL}/#localbusiness` });
  });
});

describe("schema FAQ, breadcrumb, produk, artikel", () => {
  it("FAQ menghasilkan mainEntity yang valid", () => {
    const schema = faqJsonLd([{ question: "Apa itu Dubai Chewy?", answer: "Chewy cookie." }]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Chewy cookie.");
  });

  it("breadcrumb memberi posisi berurutan", () => {
    const schema = breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: "Produk", path: "/products" },
    ]);
    expect(schema.itemListElement.map((item) => item.position)).toEqual([1, 2]);
    expect(schema.itemListElement[1].item).toBe(pageUrl("/products"));
  });

  it("katalog produk menghasilkan ItemList lengkap", () => {
    const schema = productsJsonLd(PRODUCT_CATALOG);
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(PRODUCT_CATALOG.length);
    expect(schema.itemListElement[0].item["@type"]).toBe("Product");
  });

  it("artikel blog menyertakan headline dan tanggal", () => {
    const post: BlogPost = {
      id: "1",
      slug: "tips-dessert",
      title: "Tips Dessert",
      excerpt: "Ringkasan",
      content_md: "# Isi",
      cover_image_url: "",
      published: true,
      published_at: "2026-11-01T00:00:00.000Z",
      author_id: null,
      created_at: "2026-11-01T00:00:00.000Z",
      updated_at: "2026-11-02T00:00:00.000Z",
    };
    const schema = articleJsonLd(post);
    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.headline).toBe("Tips Dessert");
    expect(schema.datePublished).toBe("2026-11-01T00:00:00.000Z");
    expect(schema.mainEntityOfPage).toBe(pageUrl("/blog/tips-dessert"));
  });
});

import type { Metadata } from "next";
import type { BlogPost } from "./types";
import { normalizePhone } from "./format";
import type { SeoProduct } from "./seo-content";

// Alamat kanonis situs. Ubah lewat NEXT_PUBLIC_SITE_URL saat domain final dipakai.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://geeco.pages.dev"
).replace(/\/+$/, "");

function env(value: string | undefined): string {
  return (value ?? "").trim();
}

// Data entitas usaha — dipakai untuk metadata, JSON-LD, dan NAP (Name/Address/Phone).
// Nilai yang belum tersedia dibiarkan kosong dan tidak dimasukkan ke schema.
export const BUSINESS = {
  name: "Gee Co.",
  tagline: "Bakery, Dessert & Viral Food Supplier",
  description:
    "Gee Co. adalah supplier dessert dan jajanan viral yang berbasis di Sukoharjo dan melayani Surakarta (Solo), untuk cafe, restoran, toko kue, dan pesanan rumahan — termasuk Dubai Chewy, Basque Burnt Cheesecake, brownies, dessert box, dan puding.",
  logo: "/img/logo-320.png",
  email: env(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || "hello@geeco.id",
  whatsapp: env(process.env.NEXT_PUBLIC_WHATSAPP),
  instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM_URL),
  street: env(process.env.NEXT_PUBLIC_BUSINESS_ADDRESS),
  city: "Sukoharjo",
  region: "Jawa Tengah",
  country: "ID",
  priceRange: "Rp",
  areaServed: [
    "Sukoharjo",
    "Surakarta (Solo)",
    "Karanganyar",
    "Boyolali",
    "Klaten",
    "Solo Baru",
  ],
};

export const DEFAULT_KEYWORDS = [
  "dubai chewy sukoharjo",
  "dubai chewy solo",
  "dessert sukoharjo",
  "dessert solo",
  "jajanan viral solo",
  "kue kekinian surakarta",
  "supplier dessert sukoharjo",
  "supplier dessert solo",
  "supplier kue cafe surakarta",
  "grosir dessert surakarta",
  "dessert box solo",
  "basque cheesecake solo",
  "Gee Co",
];

// URL absolut untuk aset (tanpa memaksa trailing slash).
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

// URL kanonis untuk halaman. `trailingSlash: true` di next.config, jadi konsisten berakhiran "/".
export function pageUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
  return `${SITE_URL}${cleanPath}`;
}

export function whatsappHref(
  message = "Halo Gee Co., saya ingin bertanya tentang produk dessert."
): string {
  const phone = normalizePhone(BUSINESS.whatsapp);
  const text = encodeURIComponent(message);
  return phone ? `https://wa.me/${phone}?text=${text}` : "/contact/";
}

export function buildMetadata({
  title,
  description,
  path,
  keywords,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}): Metadata {
  const url = pageUrl(path);
  const socialImage = absoluteUrl(image || BUSINESS.logo);

  return {
    title: { absolute: title },
    description,
    keywords: keywords ?? DEFAULT_KEYWORDS,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      url,
      siteName: BUSINESS.name,
      locale: "id_ID",
      title,
      description,
      images: [{ url: socialImage, alt: title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}

function postalAddress() {
  return {
    "@type": "PostalAddress",
    ...(BUSINESS.street ? { streetAddress: BUSINESS.street } : {}),
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    addressCountry: BUSINESS.country,
  };
}

function sameAs(): string[] {
  return [BUSINESS.instagram].filter(Boolean);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BUSINESS.name,
    url: pageUrl("/"),
    logo: absoluteUrl(BUSINESS.logo),
    description: BUSINESS.description,
    email: BUSINESS.email,
    ...(BUSINESS.whatsapp ? { telephone: BUSINESS.whatsapp } : {}),
    sameAs: sameAs(),
    address: postalAddress(),
    areaServed: BUSINESS.areaServed,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: pageUrl("/"),
    name: BUSINESS.name,
    description: BUSINESS.description,
    inLanguage: "id-ID",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "@id": `${SITE_URL}/#localbusiness`,
    name: BUSINESS.name,
    image: absoluteUrl(BUSINESS.logo),
    url: pageUrl("/"),
    description: BUSINESS.description,
    ...(BUSINESS.whatsapp ? { telephone: BUSINESS.whatsapp } : {}),
    email: BUSINESS.email,
    priceRange: BUSINESS.priceRange,
    address: postalAddress(),
    areaServed: BUSINESS.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    servesCuisine: ["Dessert", "Bakery", "Kue", "Jajanan"],
    sameAs: sameAs(),
    parentOrganization: { "@id": `${SITE_URL}/#organization` },
    hasMenu: pageUrl("/products"),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

export function productsJsonLd(products: SeoProduct[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Menu dessert dan jajanan viral Gee Co.",
    description:
      "Daftar dessert dan jajanan viral Gee Co. yang tersedia untuk pesanan rumahan dan supplier cafe di Sukoharjo dan Surakarta.",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.description,
        category: product.category,
        brand: { "@type": "Brand", name: BUSINESS.name },
        url: pageUrl("/products"),
        ...(product.imageUrl ? { image: absoluteUrl(product.imageUrl) } : {}),
        ...(product.priceFrom
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "IDR",
                price: product.priceFrom,
                availability: "https://schema.org/InStock",
                url: pageUrl("/products"),
                seller: { "@id": `${SITE_URL}/#organization` },
              },
            }
          : {}),
      },
    })),
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${SITE_URL}/collaboration/#service`,
    name: "Supplier dessert dan jajanan untuk cafe di Sukoharjo dan Surakarta",
    serviceType: "Supplier dessert, bakery, dan jajanan viral",
    provider: { "@id": `${SITE_URL}/#localbusiness` },
    areaServed: BUSINESS.areaServed.map((name) => ({
      "@type": "AdministrativeArea",
      name,
    })),
    description:
      "Pasokan dessert dan jajanan viral untuk cafe, restoran, toko kue, dan bisnis kuliner di Sukoharjo, Surakarta, dan sekitarnya, dengan harga khusus per klien dan invoice resmi.",
    url: pageUrl("/collaboration"),
  };
}

export function articleJsonLd(post: BlogPost) {
  const url = pageUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || BUSINESS.description,
    image: post.cover_image_url
      ? absoluteUrl(post.cover_image_url)
      : absoluteUrl(BUSINESS.logo),
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    inLanguage: "id-ID",
    url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: BUSINESS.name, url: pageUrl("/") },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

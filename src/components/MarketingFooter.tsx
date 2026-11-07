"use client";

import Link from "next/link";
import { BUSINESS } from "@/lib/seo";
import { useLanguage } from "@/components/language";

const COPY = {
  id: {
    productsTitle: "Produk & Layanan",
    products: "Menu dessert & jajanan viral",
    collaboration: "Supplier dessert & kolaborasi cafe",
    blog: "Blog",
    contactTitle: "Kontak",
    contactPage: "Halaman kontak & area layanan",
    instagram: "Instagram",
    rights: "Semua hak dilindungi.",
    tagline: "Dibuat hangat di Sukoharjo, untuk momen manis Anda.",
  },
  en: {
    productsTitle: "Products & Services",
    products: "Dessert & viral snack menu",
    collaboration: "Dessert supplier & cafe collaboration",
    blog: "Blog",
    contactTitle: "Contact",
    contactPage: "Contact page & service area",
    instagram: "Instagram",
    rights: "All rights reserved.",
    tagline: "Warmly made in Sukoharjo, for your sweet moments.",
  },
};

export function MarketingFooter() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <footer className="bg-ink text-cream/70">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 text-sm md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight text-cream">
            {BUSINESS.name}
          </p>
          <p className="mt-2 max-w-xs leading-relaxed text-cream/60">{t.tagline}</p>
          <p className="mt-4 text-cream/50">
            {BUSINESS.city}, {BUSINESS.region}
            {BUSINESS.street ? ` — ${BUSINESS.street}` : ""}
          </p>
          <p className="mt-1 text-cream/40">
            © {new Date().getFullYear()} {BUSINESS.name}. {t.rights}
          </p>
        </div>

        <nav aria-label={t.productsTitle} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">
            {t.productsTitle}
          </p>
          <Link href="/products" className="transition hover:text-pistachio-soft">
            {t.products}
          </Link>
          <Link href="/collaboration" className="transition hover:text-pistachio-soft">
            {t.collaboration}
          </Link>
          <Link href="/blog" className="transition hover:text-pistachio-soft">
            {t.blog}
          </Link>
        </nav>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-cream/40">
            {t.contactTitle}
          </p>
          <a href={`mailto:${BUSINESS.email}`} className="transition hover:text-pistachio-soft">
            {BUSINESS.email}
          </a>
          <Link href="/contact" className="transition hover:text-pistachio-soft">
            {t.contactPage}
          </Link>
          {BUSINESS.instagram ? (
            <a href={BUSINESS.instagram} className="transition hover:text-pistachio-soft">
              {t.instagram}
            </a>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

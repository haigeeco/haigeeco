"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/language";
import { formatIDR } from "@/lib/format";
import { usePublicProducts } from "@/lib/db/publicProducts";
import { PRODUCT_FAQS, PRODUCT_FAQS_EN, type SeoProduct } from "@/lib/seo-content";
import { whatsappHref } from "@/lib/seo";

const COPY = {
  id: {
    home: "Beranda",
    products: "Produk",
    eyebrow: "Dessert & Jajanan Viral · Sukoharjo & Solo",
    title: "Dubai Chewy, Dessert, dan Jajanan Viral",
    description:
      "Gee Co. menyediakan Dubai Chewy, Basque Burnt Cheesecake, brownies fudge, dessert box, puding, dan croissant untuk pesanan rumahan maupun pasokan cafe di Sukoharjo, Surakarta, dan sekitarnya. Semua produk dibuat dalam batch kecil agar tekstur dan rasanya konsisten.",
    menuTitle: "Menu dessert dan jajanan viral",
    menuNote:
      "Harga di bawah adalah harga mulai dan dapat berubah. Untuk hampers, pesanan besar, atau harga khusus cafe, hubungi kami untuk penawaran terbaru.",
    priceFrom: "Harga mulai",
    askPrice: "Tanya harga",
    ask: "Tanya",
    faqTitle: "Pertanyaan umum tentang dessert Gee Co.",
    ctaTitle: "Pesan dessert atau jadi mitra supplier cafe",
    ctaBody:
      "Untuk pesanan pribadi, hampers, atau pasokan rutin cafe di Sukoharjo dan Surakarta, hubungi tim Gee Co. Kami akan membantu memilih produk dan mengatur jadwal pengiriman.",
    whatsapp: "Hubungi via WhatsApp",
    collab: "Info supplier & kolaborasi cafe",
  },
  en: {
    home: "Home",
    products: "Products",
    eyebrow: "Dessert & Viral Snacks · Sukoharjo & Solo",
    title: "Dubai Chewy, Desserts, and Viral Snacks",
    description:
      "Gee Co. offers Dubai Chewy, Basque Burnt Cheesecake, fudge brownies, dessert boxes, pudding, and croissants for home orders and cafe supply in Sukoharjo, Surakarta, and nearby areas. Every product is made in small batches for consistent texture and taste.",
    menuTitle: "Dessert and viral snack menu",
    menuNote:
      "Prices below are starting prices and may change. For hampers, large orders, or special cafe pricing, contact us for the latest quote.",
    priceFrom: "Starting from",
    askPrice: "Ask for price",
    ask: "Ask",
    faqTitle: "Frequently asked questions about Gee Co. desserts",
    ctaTitle: "Order desserts or become a cafe supplier partner",
    ctaBody:
      "For personal orders, hampers, or regular cafe supply in Sukoharjo and Surakarta, contact the Gee Co. team. We will help you choose products and arrange delivery.",
    whatsapp: "Contact via WhatsApp",
    collab: "Supplier & cafe collaboration info",
  },
};

export function ProductsView({ products }: { products: SeoProduct[] }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const faqs = locale === "id" ? PRODUCT_FAQS : PRODUCT_FAQS_EN;
  const list = usePublicProducts(products).data ?? products;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 md:px-8 md:py-20">
      <Breadcrumbs
        items={[
          { name: t.home, href: "/" },
          { name: t.products, href: "/products" },
        ]}
      />

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-pistachio-dark">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">{t.description}</p>
      </header>

      <section aria-labelledby="menu-heading" className="mt-14">
        <div className="grid gap-4 border-b border-line pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h2 id="menu-heading" className="font-display text-2xl font-semibold text-ink">
              {t.menuTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{t.menuNote}</p>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {t.priceFrom}
          </p>
        </div>

        <ul>
          {list.map((product) => (
            <li
              key={product.slug}
              className="grid gap-4 border-b border-line py-6 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-8"
            >
              <div className="flex min-w-0 items-start gap-4">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl border border-line object-cover sm:h-20 sm:w-20"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pistachio-dark">
                    {locale === "id" ? product.category : product.categoryEn}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl font-semibold text-ink">
                    {product.name}
                  </h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                    {locale === "id" ? product.summary : product.summaryEn}
                  </p>
                  {(locale === "id" ? product.tags : product.tagsEn).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(locale === "id" ? product.tags : product.tagsEn).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-ink-soft"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="sm:text-right">
                <p className="font-display text-lg font-semibold tabular-nums text-ink">
                  {product.priceFrom ? formatIDR(product.priceFrom) : t.askPrice}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">/{product.unit}</p>
                <a
                  href={whatsappHref(
                    locale === "id"
                      ? `Halo Gee Co., saya ingin bertanya tentang ${product.name}.`
                      : `Hello Gee Co., I would like to ask about ${product.name}.`
                  )}
                  className="mt-2 inline-block text-sm font-semibold text-pistachio-dark underline underline-offset-4 transition hover:text-pistachio"
                >
                  {t.ask}
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq-heading" className="mt-16 max-w-3xl">
        <h2 id="faq-heading" className="font-display text-2xl font-semibold text-ink">
          {t.faqTitle}
        </h2>
        <div className="mt-5 border-t border-line">
          {faqs.map((faq) => (
            <details key={faq.question} className="group border-b border-line py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-ink">
                {faq.question}
                <span
                  aria-hidden
                  className="mt-0.5 text-lg leading-none text-pistachio transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl bg-ink px-6 py-10 text-cream md:px-10 md:py-12">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
          {t.ctaTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-cream/70">{t.ctaBody}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={whatsappHref()}
            className="rounded-full bg-pistachio px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
          >
            {t.whatsapp}
          </a>
          <a
            href="/collaboration/"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cream/80 transition hover:text-cream"
          >
            {t.collab}
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}

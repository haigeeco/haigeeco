"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language";
import { formatIDR } from "@/lib/format";
import { usePublicProducts } from "@/lib/db/publicProducts";
import { HOME_FAQS, HOME_FAQS_EN, SERVICE_AREAS, type SeoProduct } from "@/lib/seo-content";
import { whatsappHref } from "@/lib/seo";

const COPY = {
  id: {
    eyebrow: "Sukoharjo · Solo Raya",
    title: "Dessert & Jajanan Viral untuk Momen Manis Anda",
    titleAccent: "Dubai Chewy, cheesecake, dan dessert kekinian.",
    description:
      "Gee Co. membuat dan memasok Dubai Chewy, Basque Burnt Cheesecake, brownies fudge, dessert box, puding, dan croissant untuk warga Solo Raya serta cafe di Sukoharjo, Surakarta, dan sekitarnya.",
    ctaPrimary: "Lihat Menu Dessert",
    ctaSecondary: "Supplier untuk Cafe",
    chips: ["Dibuat fresh per batch", "Harga khusus cafe", "Delivery Solo Raya"],
    introTitle: "Dubai Chewy dan jajanan viral yang sedang dicari di Solo",
    introBody:
      "Dubai Chewy adalah chewy cookie dengan isian krim cokelat pistachio dan kunafa renyah. Kenyal di luar, lumer di dalam. Gee Co. juga menghadirkan dessert klasik seperti cheesecake dan brownies yang cocok untuk menu cafe, oleh-oleh, dan hampers.",
    featuredTitle: "Produk unggulan",
    allProducts: "Lihat semua produk",
    priceListTitle: "Daftar harga",
    ask: "Tanya",
    areasTitle: "Melayani Sukoharjo & Surakarta",
    areasBody:
      "Pengiriman dan pemesanan tersedia untuk area berikut. Hubungi kami untuk mengecek jadwal pengiriman ke lokasi Anda.",
    faqTitle: "Pertanyaan umum",
    ctaTitle: "Pesan dessert atau ajukan kerja sama supplier",
    ctaBody:
      "Untuk pesanan pribadi maupun pasokan cafe di Sukoharjo dan Surakarta, hubungi tim Gee Co. Kami akan membantu memilih produk dan mengatur jadwal pengiriman.",
    whatsapp: "Hubungi via WhatsApp",
    contactPage: "Halaman Kontak",
    priceFrom: "Harga mulai",
    askPrice: "Tanya harga",
  },
  en: {
    eyebrow: "Sukoharjo · Solo Raya",
    title: "Dessert & Viral Snacks for Your Sweet Moments",
    titleAccent: "Dubai Chewy, cheesecake, and modern desserts.",
    description:
      "Gee Co. makes and supplies Dubai Chewy, Basque Burnt Cheesecake, fudge brownies, dessert boxes, pudding, and croissants for Solo Raya residents and cafes in Sukoharjo, Surakarta, and nearby areas.",
    ctaPrimary: "View Dessert Menu",
    ctaSecondary: "Supplier for Cafes",
    chips: ["Baked fresh per batch", "Per-cafe pricing", "Solo Raya delivery"],
    introTitle: "Dubai Chewy and the viral snacks Solo is searching for",
    introBody:
      "Dubai Chewy is a chewy cookie filled with pistachio chocolate cream and crunchy kunafa. Chewy outside, molten inside. Gee Co. also offers classic desserts such as cheesecake and brownies that suit cafe menus, souvenirs, and hampers.",
    featuredTitle: "Featured product",
    allProducts: "See all products",
    priceListTitle: "Price list",
    ask: "Ask",
    areasTitle: "Serving Sukoharjo & Surakarta",
    areasBody:
      "Delivery and orders are available in the following areas. Contact us to check the delivery schedule for your location.",
    faqTitle: "Frequently asked questions",
    ctaTitle: "Order desserts or apply as a supplier partner",
    ctaBody:
      "For personal orders or cafe supply in Sukoharjo and Surakarta, contact the Gee Co. team. We will help you choose products and arrange delivery.",
    whatsapp: "Contact via WhatsApp",
    contactPage: "Contact Page",
    priceFrom: "Starting from",
    askPrice: "Ask for price",
  },
};

export function HomeView({ products }: { products: SeoProduct[] }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const faqs = locale === "id" ? HOME_FAQS : HOME_FAQS_EN;
  const productList = usePublicProducts(products).data ?? products;
  const [spotlight, ...rest] = productList;

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-14 md:px-8 md:pb-20 md:pt-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-pistachio-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {t.eyebrow}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl md:text-6xl">
            {t.title}
            <span className="mt-2 block text-pistachio">{t.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
            {t.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/products"
              className="rounded-full bg-pistachio px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="/collaboration"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-pistachio-dark"
            >
              {t.ctaSecondary}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-ink-soft">
            {t.chips.map((chip) => (
              <li key={chip} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-pistachio" />
                {chip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="grid gap-6 border-t border-line pt-8 md:grid-cols-[0.85fr_1.15fr] md:gap-12">
          <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-ink md:text-3xl">
            {t.introTitle}
          </h2>
          <p className="text-sm leading-relaxed text-ink-soft md:text-base">{t.introBody}</p>
        </div>
      </section>

      <section aria-labelledby="produk-heading" className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2
            id="produk-heading"
            className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
          >
            {t.featuredTitle}
          </h2>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-pistachio-dark transition hover:text-pistachio"
          >
            {t.allProducts}
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        </div>

        <div
          className={
            rest.length > 0
              ? "mt-7 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14"
              : "mt-7"
          }
        >
          <article className="rounded-3xl bg-cream-deep p-7 md:p-10">
            {spotlight.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={spotlight.imageUrl}
                alt={spotlight.name}
                loading="lazy"
                className="mb-6 h-56 w-full rounded-2xl object-cover"
              />
            ) : null}
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pistachio-dark">
              {locale === "id" ? spotlight.category : spotlight.categoryEn}
            </p>
            <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              {spotlight.name}
            </h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft md:text-base">
              {locale === "id" ? spotlight.description : spotlight.descriptionEn}
            </p>
            {(locale === "id" ? spotlight.tags : spotlight.tagsEn).length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {(locale === "id" ? spotlight.tags : spotlight.tagsEn).map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-ink-soft"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="font-display text-xl font-semibold text-ink">
                {spotlight.priceFrom ? formatIDR(spotlight.priceFrom) : t.askPrice}
                <span className="font-sans text-sm font-normal text-ink-soft">
                  {" "}
                  /{spotlight.unit}
                </span>
              </p>
              <a
                href={whatsappHref(
                  locale === "id"
                    ? `Halo Gee Co., saya ingin bertanya tentang ${spotlight.name}.`
                    : `Hello Gee Co., I would like to ask about ${spotlight.name}.`
                )}
                className="text-sm font-semibold text-pistachio-dark underline underline-offset-4 transition hover:text-pistachio"
              >
                {t.ask}
              </a>
            </div>
          </article>

          {rest.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                {t.priceListTitle}
              </p>
              <ul className="mt-3 border-t border-line">
                {rest.map((product) => (
                <li
                  key={product.slug}
                  className="flex items-baseline justify-between gap-4 border-b border-line py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-ink">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        {locale === "id" ? product.category : product.categoryEn} · {product.unit}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {product.priceFrom ? formatIDR(product.priceFrom) : t.askPrice}
                  </p>
                </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="area-heading" className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div className="border-t border-line pt-8">
          <h2
            id="area-heading"
            className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
          >
            {t.areasTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">{t.areasBody}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SERVICE_AREAS.map((area) => (
              <li
                key={area}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink-soft"
              >
                {area}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
        <h2
          id="faq-heading"
          className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl"
        >
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

      <section className="mx-auto w-full max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="rounded-3xl bg-ink px-6 py-10 text-cream md:px-12 md:py-14">
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
            <Link
              href="/contact"
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-cream/80 transition hover:text-cream"
            >
              {t.contactPage}
              <span aria-hidden className="transition group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

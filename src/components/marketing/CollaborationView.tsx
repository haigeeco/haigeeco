"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/language";
import { usePublicProducts } from "@/lib/db/publicProducts";
import {
  SERVICE_AREAS,
  SUPPLIER_BENEFITS,
  SUPPLIER_BENEFITS_EN,
  SUPPLIER_FAQS,
  SUPPLIER_FAQS_EN,
  SUPPLIER_STEPS,
  SUPPLIER_STEPS_EN,
  type SeoProduct,
} from "@/lib/seo-content";
import { BUSINESS, whatsappHref } from "@/lib/seo";

const COPY = {
  id: {
    home: "Beranda",
    collab: "Kolaborasi",
    eyebrow: "Supplier Dessert · Sukoharjo & Solo",
    title: "Supplier Dessert untuk Cafe, Restoran, dan Toko Kue",
    description:
      "Gee Co. memasok dessert, bakery, dan jajanan viral untuk cafe dan restoran di Sukoharjo, Surakarta (Solo), serta sekitarnya. Produk tersedia mulai dari Dubai Chewy, Basque Burnt Cheesecake, brownies fudge, dessert box, puding, hingga croissant, lengkap dengan harga khusus per cafe dan invoice resmi.",
    ctaPartner: "Ajukan Kerja Sama",
    ctaMenu: "Lihat Menu Produk",
    whyTitle: "Mengapa cafe memilih Gee Co.",
    menuTitle: "Produk yang bisa dipasok ke cafe",
    menuNote:
      "Pilih produk yang cocok untuk menu dessert, display, atau takeaway cafe Anda. Harga mitra dihitung per cafe dan dikonfirmasi saat penawaran, terpisah dari harga customer di website.",
    stepsTitle: "Cara menjadi mitra pasokan",
    areasTitle: "Area layanan pengiriman",
    areasBody:
      "Pengiriman dilakukan ke Sukoharjo, Surakarta, dan area sekitarnya. Hubungi kami untuk mengecek jadwal dan biaya pengiriman ke lokasi cafe Anda.",
    faqTitle: "Pertanyaan umum supplier dessert",
    ctaTitle: "Siap menambah menu dessert di cafe Anda?",
    ctaBody:
      "Kirim daftar produk dan perkiraan jumlah yang dibutuhkan. Tim Gee Co. akan mengonfirmasi harga, MOQ, dan jadwal pengiriman.",
    whatsapp: "Hubungi via WhatsApp",
    waMessage:
      "Halo Gee Co., saya pemilik cafe dan ingin bertanya soal pasokan dessert.",
    waFinal:
      "Halo Gee Co., saya ingin menjadi mitra cafe. Berikut kebutuhan dessert kami:",
  },
  en: {
    home: "Home",
    collab: "Collaboration",
    eyebrow: "Dessert Supplier · Sukoharjo & Solo",
    title: "Dessert Supplier for Cafes, Restaurants, and Bakeries",
    description:
      "Gee Co. supplies desserts, bakery items, and viral snacks to cafes and restaurants in Sukoharjo, Surakarta (Solo), and nearby areas. Products include Dubai Chewy, Basque Burnt Cheesecake, fudge brownies, dessert boxes, pudding, and croissants, with per-cafe pricing and official invoices.",
    ctaPartner: "Apply for Partnership",
    ctaMenu: "View Product Menu",
    whyTitle: "Why cafes choose Gee Co.",
    menuTitle: "Products we can supply to cafes",
    menuNote:
      "Choose the products that fit your cafe's dessert menu, display, or takeaway. Partner pricing is calculated per cafe and confirmed in your quote, separate from the website customer price.",
    stepsTitle: "How to become a supply partner",
    areasTitle: "Delivery service area",
    areasBody:
      "We deliver to Sukoharjo, Surakarta, and surrounding areas. Contact us to check schedules and delivery fees to your cafe.",
    faqTitle: "Dessert supplier FAQ",
    ctaTitle: "Ready to add desserts to your cafe menu?",
    ctaBody:
      "Send us your product list and estimated quantities. The Gee Co. team will confirm pricing, MOQ, and the delivery schedule.",
    whatsapp: "Contact via WhatsApp",
    waMessage: "Hello Gee Co., I own a cafe and would like to ask about dessert supply.",
    waFinal: "Hello Gee Co., I would like to become a cafe partner. Here are our dessert needs:",
  },
};

export function CollaborationView({ products }: { products: SeoProduct[] }) {
  const { locale } = useLanguage();
  const t = COPY[locale];
  const benefits = locale === "id" ? SUPPLIER_BENEFITS : SUPPLIER_BENEFITS_EN;
  const steps = locale === "id" ? SUPPLIER_STEPS : SUPPLIER_STEPS_EN;
  const faqs = locale === "id" ? SUPPLIER_FAQS : SUPPLIER_FAQS_EN;
  const list = usePublicProducts(products).data ?? products;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 md:px-8 md:py-20">
      <Breadcrumbs
        items={[
          { name: t.home, href: "/" },
          { name: t.collab, href: "/collaboration" },
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
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={whatsappHref(t.waMessage)}
            className="rounded-full bg-pistachio px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
          >
            {t.ctaPartner}
          </a>
          <a
            href="/products/"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition hover:text-pistachio-dark"
          >
            {t.ctaMenu}
            <span aria-hidden className="transition group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
      </header>

      <section aria-labelledby="why-heading" className="mt-16">
        <h2 id="why-heading" className="font-display text-2xl font-semibold text-ink">
          {t.whyTitle}
        </h2>
        <dl className="mt-5 grid gap-x-12 sm:grid-cols-2">
          {benefits.map((benefit, index) => (
            <div key={benefit.title} className="border-t border-line py-5">
              <dt className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] font-semibold text-pistachio-dark">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-lg font-semibold text-ink">
                  {benefit.title}
                </span>
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-soft">
                {benefit.description}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="menu-heading" className="mt-16">
        <h2 id="menu-heading" className="font-display text-2xl font-semibold text-ink">
          {t.menuTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">{t.menuNote}</p>
        <ul className="mt-5 border-t border-line">
          {list.map((product) => (
            <li
              key={product.slug}
              className="flex flex-wrap items-center gap-3 border-b border-line py-4"
            >
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  className="h-12 w-12 shrink-0 rounded-lg border border-line object-cover"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="font-display text-base font-semibold text-ink">{product.name}</p>
                {(locale === "id" ? product.bestFor : product.bestForEn) ? (
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {locale === "id" ? product.bestFor : product.bestForEn}
                  </p>
                ) : null}
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-pistachio-dark">
                {locale === "id" ? product.category : product.categoryEn}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="steps-heading" className="mt-16 max-w-3xl">
        <h2 id="steps-heading" className="font-display text-2xl font-semibold text-ink">
          {t.stepsTitle}
        </h2>
        <ol className="mt-5 border-t border-line">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-4 border-b border-line py-5">
              <span className="font-mono text-xs font-semibold text-pistachio-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="area-heading" className="mt-16">
        <div className="border-t border-line pt-8">
          <h2 id="area-heading" className="font-display text-2xl font-semibold text-ink">
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
            href={whatsappHref(t.waFinal)}
            className="rounded-full bg-pistachio px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
          >
            {t.whatsapp}
          </a>
          <p className="text-xs text-cream/50">
            {BUSINESS.city}, {BUSINESS.region}
          </p>
        </div>
      </section>
    </div>
  );
}

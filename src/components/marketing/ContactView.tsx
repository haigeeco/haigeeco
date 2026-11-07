"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useLanguage } from "@/components/language";
import { SERVICE_AREAS } from "@/lib/seo-content";
import { BUSINESS, whatsappHref } from "@/lib/seo";

const COPY = {
  id: {
    home: "Beranda",
    contact: "Kontak",
    title: "Kontak Gee Co. Sukoharjo",
    intro:
      "Ada pertanyaan, ingin memesan dessert, atau mengajukan kerja sama pasokan cafe? Hubungi kami melalui kanal di bawah ini.",
    whatsapp: "WhatsApp",
    whatsappFallback: "Hubungi melalui tautan di sebelah",
    chatWhatsApp: "Chat WhatsApp",
    email: "Email",
    sendEmail: "Kirim email",
    location: "Lokasi",
    instagram: "Instagram",
    instagramFallback: "Tersedia menyusul",
    openInstagram: "Buka Instagram",
    areaTitle: "Area layanan",
    areaBody: "Kami melayani pemesanan dan pengiriman di area berikut.",
    orderTitle: "Cara memesan",
    orderSteps: [
      "Pilih produk pada halaman Products.",
      "Hubungi kami via WhatsApp, sebutkan produk dan jumlah.",
      "Konfirmasi jadwal pengambilan atau pengiriman.",
      "Pesanan disiapkan dan dikirim sesuai jadwal.",
    ],
  },
  en: {
    home: "Home",
    contact: "Contact",
    title: "Contact Gee Co. Sukoharjo",
    intro:
      "Have a question, want to order desserts, or apply for cafe supply partnership? Reach us through the channels below.",
    whatsapp: "WhatsApp",
    whatsappFallback: "Contact us via the link",
    chatWhatsApp: "Chat on WhatsApp",
    email: "Email",
    sendEmail: "Send email",
    location: "Location",
    instagram: "Instagram",
    instagramFallback: "Coming soon",
    openInstagram: "Open Instagram",
    areaTitle: "Service area",
    areaBody: "We accept orders and deliveries in the following areas.",
    orderTitle: "How to order",
    orderSteps: [
      "Choose a product on the Products page.",
      "Contact us via WhatsApp with the product and quantity.",
      "Confirm the pickup or delivery schedule.",
      "Your order is prepared and delivered on schedule.",
    ],
  },
};

export function ContactView() {
  const { locale } = useLanguage();
  const t = COPY[locale];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 md:px-8 md:py-20">
      <Breadcrumbs
        items={[
          { name: t.home, href: "/" },
          { name: t.contact, href: "/contact" },
        ]}
      />

      <header className="mt-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">{t.intro}</p>
      </header>

      <section aria-labelledby="contact-heading" className="mt-12">
        <h2 id="contact-heading" className="sr-only">
          {t.whatsapp}, {t.email}, {t.location}, {t.instagram}
        </h2>
        <dl className="border-t border-line">
          <div className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {t.whatsapp}
            </dt>
            <dd className="text-sm text-ink">{BUSINESS.whatsapp || t.whatsappFallback}</dd>
            <a
              href={whatsappHref()}
              className="text-sm font-semibold text-pistachio-dark underline underline-offset-4 transition hover:text-pistachio"
            >
              {t.chatWhatsApp}
            </a>
          </div>

          <div className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {t.email}
            </dt>
            <dd className="truncate text-sm text-ink">{BUSINESS.email}</dd>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="text-sm font-semibold text-pistachio-dark underline underline-offset-4 transition hover:text-pistachio"
            >
              {t.sendEmail}
            </a>
          </div>

          <div className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {t.location}
            </dt>
            <dd className="text-sm text-ink">
              {BUSINESS.city}, {BUSINESS.region}
              {BUSINESS.street ? ` — ${BUSINESS.street}` : ""}
            </dd>
            <span aria-hidden />
          </div>

          <div className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[140px_1fr_auto] sm:items-center sm:gap-6">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              {t.instagram}
            </dt>
            <dd className="truncate text-sm text-ink">
              {BUSINESS.instagram || t.instagramFallback}
            </dd>
            {BUSINESS.instagram ? (
              <a
                href={BUSINESS.instagram}
                className="text-sm font-semibold text-pistachio-dark underline underline-offset-4 transition hover:text-pistachio"
              >
                {t.openInstagram}
              </a>
            ) : (
              <span aria-hidden />
            )}
          </div>
        </dl>
      </section>

      <section aria-labelledby="area-heading" className="mt-12">
        <div className="border-t border-line pt-8">
          <h2 id="area-heading" className="font-display text-2xl font-semibold text-ink">
            {t.areaTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{t.areaBody}</p>
          <ul className="mt-4 flex flex-wrap gap-2">
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

      <section aria-labelledby="order-heading" className="mt-12">
        <h2 id="order-heading" className="font-display text-2xl font-semibold text-ink">
          {t.orderTitle}
        </h2>
        <ol className="mt-4 border-t border-line">
          {t.orderSteps.map((step, index) => (
            <li key={step} className="flex gap-4 border-b border-line py-4 text-sm text-ink-soft">
              <span className="font-mono text-xs font-semibold text-pistachio-dark">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

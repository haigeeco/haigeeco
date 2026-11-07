import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { CollaborationView } from "@/components/marketing/CollaborationView";
import { SUPPLIER_FAQS, SUPPLIER_STEPS } from "@/lib/seo-content";
import { getPublicProducts } from "@/lib/public-products";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  localBusinessJsonLd,
  pageUrl,
  serviceJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Supplier Dessert Sukoharjo & Surakarta untuk Cafe & Restoran",
  description:
    "Gee Co. supplier dessert, bakery, dan jajanan viral untuk cafe, restoran, dan toko kue di Sukoharjo dan Surakarta (Solo). Harga khusus per klien, invoice resmi, dan pengiriman area Solo Raya.",
  path: "/collaboration",
  keywords: [
    "supplier dessert sukoharjo",
    "supplier dessert solo",
    "supplier kue cafe surakarta",
    "grosir dessert surakarta",
    "supplier jajanan viral solo",
    "supplier dessert box solo",
    "distributor dessert solo",
    "pemasok kue cafe solo",
  ],
});

const HOW_TO_STEPS = SUPPLIER_STEPS.map((step, index) => ({
  "@type": "HowToStep",
  position: index + 1,
  name: step.title,
  text: step.description,
}));

export default async function CollaborationPage() {
  const products = await getPublicProducts();

  return (
    <>
      <StructuredData
        data={[
          serviceJsonLd(),
          localBusinessJsonLd(),
          faqJsonLd(SUPPLIER_FAQS),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Kolaborasi", path: "/collaboration" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: "Cara menjadi mitra supplier dessert Gee Co.",
            description:
              "Langkah menjadi mitra pasokan dessert dan jajanan viral Gee Co. untuk cafe dan restoran di Sukoharjo dan Surakarta.",
            totalTime: "P1D",
            step: HOW_TO_STEPS,
            url: pageUrl("/collaboration"),
          },
        ]}
      />
      <CollaborationView products={products} />
    </>
  );
}

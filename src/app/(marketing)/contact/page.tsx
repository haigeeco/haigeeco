import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { ContactView } from "@/components/marketing/ContactView";
import { buildMetadata, localBusinessJsonLd, pageUrl } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Kontak & Lokasi Gee Co. Sukoharjo",
  description:
    "Hubungi Gee Co. di Sukoharjo untuk pesanan dessert, jajanan viral, hampers, dan pasokan cafe di Sukoharjo dan Surakarta. Hubungi via WhatsApp atau email.",
  path: "/contact",
  keywords: [
    "kontak Gee Co",
    "pesan dessert sukoharjo",
    "supplier dessert surakarta",
    "alamat dessert sukoharjo",
  ],
});

export default function ContactPage() {
  return (
    <>
      <StructuredData
        data={[
          localBusinessJsonLd(),
          {
            "@context": "https://schema.org",
            "@type": "ContactPage",
            name: "Kontak Gee Co.",
            url: pageUrl("/contact"),
            description:
              "Informasi kontak Gee Co., supplier dessert dan jajanan viral di Sukoharjo dan Surakarta.",
            mainEntity: { "@id": `${pageUrl("/")}#localbusiness` },
          },
        ]}
      />
      <ContactView />
    </>
  );
}

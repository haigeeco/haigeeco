import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { HomeView } from "@/components/marketing/HomeView";
import { HOME_FAQS } from "@/lib/seo-content";
import { getPublicProducts } from "@/lib/public-products";
import {
  buildMetadata,
  faqJsonLd,
  localBusinessJsonLd,
  productsJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dessert & Jajanan Viral Sukoharjo & Surakarta — Dubai Chewy | Gee Co.",
  description:
    "Gee Co. — supplier dessert, bakery, dan jajanan viral berbasis di Sukoharjo, melayani Surakarta (Solo). Pesan Dubai Chewy, Basque Burnt Cheesecake, brownies, dessert box, dan puding untuk oleh-oleh atau pasokan cafe.",
  path: "/",
  keywords: [
    "dubai chewy sukoharjo",
    "dubai chewy solo",
    "dessert sukoharjo",
    "dessert solo",
    "jajanan viral solo",
    "supplier dessert sukoharjo",
    "supplier dessert solo",
    "Gee Co Sukoharjo",
  ],
});

export default async function HomePage() {
  const products = await getPublicProducts();

  return (
    <>
      <StructuredData
        data={[localBusinessJsonLd(), faqJsonLd(HOME_FAQS), productsJsonLd(products)]}
      />
      <HomeView products={products} />
    </>
  );
}

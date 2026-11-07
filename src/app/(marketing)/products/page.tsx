import type { Metadata } from "next";
import { StructuredData } from "@/components/StructuredData";
import { ProductsView } from "@/components/marketing/ProductsView";
import { PRODUCT_FAQS } from "@/lib/seo-content";
import { getPublicProducts } from "@/lib/public-products";
import {
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  localBusinessJsonLd,
  productsJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Dubai Chewy & Dessert Viral Sukoharjo & Surakarta (Solo)",
  description:
    "Menu dessert dan jajanan viral Gee Co. di Sukoharjo dan Surakarta: Dubai Chewy, Basque Burnt Cheesecake, brownies fudge, dessert box, puding, dan croissant. Cocok untuk oleh-oleh dan pasokan cafe.",
  path: "/products",
  keywords: [
    "dubai chewy sukoharjo",
    "dubai chewy solo",
    "dessert sukoharjo",
    "dessert solo",
    "jajanan viral solo",
    "menu dessert surakarta",
    "dessert box solo",
    "kue kekinian solo",
    "oleh-oleh solo",
  ],
});

export default async function ProductsPage() {
  const products = await getPublicProducts();

  return (
    <>
      <StructuredData
        data={[
          productsJsonLd(products),
          faqJsonLd(PRODUCT_FAQS),
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Produk", path: "/products" },
          ]),
          localBusinessJsonLd(),
        ]}
      />
      <ProductsView products={products} />
    </>
  );
}

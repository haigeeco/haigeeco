import type { FaqItem } from "./seo";

export interface SeoProduct {
  slug: string;
  name: string;
  category: string;
  categoryEn: string;
  summary: string;
  summaryEn: string;
  description: string;
  descriptionEn: string;
  unit: string;
  priceFrom?: number;
  tags: string[];
  tagsEn: string[];
  bestFor: string;
  bestForEn: string;
  imageUrl?: string;
}

// Katalog publik untuk halaman /products dan structured data.
// Harga indikatif — sesuaikan dengan daftar harga terbaru di menu admin.
export const PRODUCT_CATALOG: SeoProduct[] = [
  {
    slug: "dubai-chewy",
    name: "Dubai Chewy",
    category: "Jajanan viral",
    categoryEn: "Viral snack",
    summary:
      "Chewy cookie premium dengan isian cokelat pistachio dan kunafa renyah — jajanan viral yang paling dicari di Solo.",
    summaryEn:
      "Premium chewy cookie filled with pistachio chocolate and crunchy kunafa — one of Solo's most sought-after viral treats.",
    description:
      "Dubai Chewy adalah chewy cookie dengan isian krim cokelat pistachio dan kunafa renyah, perpaduan tekstur kenyal di luar dan lumer di dalam. Cocok untuk oleh-oleh, hampers, dan menu dessert kekinian di cafe.",
    descriptionEn:
      "Dubai Chewy is a chewy cookie filled with pistachio chocolate cream and crunchy kunafa, combining a chewy outside with a molten center. Perfect for souvenirs, hampers, and modern cafe dessert menus.",
    unit: "pcs",
    priceFrom: 30000,
    tags: ["dubai chewy", "jajanan viral", "chewy cookie", "pistachio", "kunafa"],
    tagsEn: ["dubai chewy", "viral snack", "chewy cookie", "pistachio", "kunafa"],
    bestFor: "Oleh-oleh, hampers, menu dessert cafe",
    bestForEn: "Souvenirs, hampers, cafe dessert menu",
  },
  {
    slug: "basque-burnt-cheesecake",
    name: "Basque Burnt Cheesecake",
    category: "Cake",
    categoryEn: "Cake",
    summary:
      "Cheesecake panggang permukaan caramelized dengan tekstur creamy, tersedia per box isi 6 potong.",
    summaryEn:
      "Baked cheesecake with a caramelized top and creamy center, available in a box of 6 slices.",
    description:
      "Basque Burnt Cheesecake dipanggang hingga permukaannya caramelized, menghasilkan rasa gurih-manis dengan tekstur lembut. Populer sebagai dessert penutup di cafe dan restoran.",
    descriptionEn:
      "Basque Burnt Cheesecake is baked until its top caramelizes, producing a savory-sweet flavor with a soft texture. A popular dessert for cafes and restaurants.",
    unit: "box isi 6",
    priceFrom: 210000,
    tags: ["basque cheesecake", "cake solo", "dessert cafe"],
    tagsEn: ["basque cheesecake", "cake", "cafe dessert"],
    bestFor: "Menu dessert cafe, restoran, perayaan",
    bestForEn: "Cafe dessert menus, restaurants, celebrations",
  },
  {
    slug: "brownies-fudge",
    name: "Brownies Fudge",
    category: "Cake",
    categoryEn: "Cake",
    summary: "Brownies fudge cokelat pekat, dipotong rapi dalam box isi 9 — favorit untuk hampers.",
    summaryEn: "Rich fudgy chocolate brownies, neatly cut in a box of 9 — a hamper favourite.",
    description:
      "Brownies Fudge Gee Co. memakai cokelat pekat dengan tekstur fudgy, tidak terlalu manis, dan tahan dikemas untuk hampers maupun dijual ulang di cafe.",
    descriptionEn:
      "Gee Co. Brownies Fudge uses rich chocolate with a fudgy texture, not overly sweet, and travels well for hampers or resale in cafes.",
    unit: "box isi 9",
    priceFrom: 140000,
    tags: ["brownies fudge", "hampers solo", "kue cokelat"],
    tagsEn: ["brownies fudge", "hampers", "chocolate cake"],
    bestFor: "Hampers, toko kue, oleh-oleh",
    bestForEn: "Hampers, bakeries, souvenirs",
  },
  {
    slug: "dessert-box-tiramisu",
    name: "Dessert Box Tiramisu",
    category: "Dessert box",
    categoryEn: "Dessert box",
    summary: "Dessert box tiramisu lembut dengan lapisan kopi dan krim, dikemas cup 250 ml.",
    summaryEn: "Silky tiramisu dessert box layered with coffee and cream, packed in a 250 ml cup.",
    description:
      "Dessert Box Tiramisu disusun berlapis dengan krim lembut dan aroma kopi, disajikan dalam cup praktis. Mudah dijual sebagai menu takeaway atau dessert display.",
    descriptionEn:
      "Dessert Box Tiramisu is layered with soft cream and coffee aroma, served in a convenient cup. Easy to sell as a takeaway or dessert display item.",
    unit: "cup 250 ml",
    priceFrom: 30000,
    tags: ["dessert box", "tiramisu", "dessert takeaway"],
    tagsEn: ["dessert box", "tiramisu", "takeaway dessert"],
    bestFor: "Dessert display, takeaway, catering",
    bestForEn: "Dessert displays, takeaway, catering",
  },
  {
    slug: "puding-regal",
    name: "Puding Regal",
    category: "Puding",
    categoryEn: "Pudding",
    summary: "Puding lembut dengan taburan biskuit Regal dan saus susu, cup 200 ml.",
    summaryEn: "Silky milk pudding topped with Regal biscuits and sweet sauce, 200 ml cup.",
    description:
      "Puding Regal menggabungkan puding susu lembut, remahan biskuit Regal, dan saus manis yang disukai anak-anak maupun dewasa. Pilihan dessert ekonomis untuk menu harian.",
    descriptionEn:
      "Puding Regal combines silky milk pudding, crushed Regal biscuits, and a sweet sauce loved by kids and adults. An economical dessert for daily menus.",
    unit: "cup 200 ml",
    priceFrom: 18000,
    tags: ["puding regal", "dessert murah", "jajanan anak"],
    tagsEn: ["regal pudding", "affordable dessert", "kids snack"],
    bestFor: "Menu harian cafe, kantin, acara keluarga",
    bestForEn: "Daily cafe menus, canteens, family events",
  },
  {
    slug: "croissant-butter",
    name: "Croissant Butter",
    category: "Bakery",
    categoryEn: "Bakery",
    summary: "Croissant butter berlapis dengan aroma mentega, dipanggang fresh per satuan.",
    summaryEn: "Layered butter croissant with a rich buttery aroma, baked fresh per piece.",
    description:
      "Croissant Butter dibuat berlapis-lapis dengan mentega berkualitas sehingga renyah di luar dan lembut di dalam. Cocok untuk menu sarapan atau teman minum kopi.",
    descriptionEn:
      "Butter Croissant is laminated with quality butter so it is crisp outside and soft inside. Perfect for breakfast menus or with coffee.",
    unit: "pcs",
    priceFrom: 22000,
    tags: ["croissant", "bakery", "menu sarapan cafe"],
    tagsEn: ["croissant", "bakery", "cafe breakfast menu"],
    bestFor: "Menu sarapan, coffee shop, bakery counter",
    bestForEn: "Breakfast menus, coffee shops, bakery counters",
  },
];

export const SERVICE_AREAS = [
  "Sukoharjo",
  "Surakarta (Solo)",
  "Karanganyar",
  "Boyolali",
  "Klaten",
  "Solo Baru",
];

export const HOME_FAQS: FaqItem[] = [
  {
    question: "Di mana bisa membeli dessert dan jajanan viral di Sukoharjo dan Surakarta?",
    answer:
      "Gee Co. berbasis di Sukoharjo dan melayani Surakarta (Solo) serta sekitarnya. Anda bisa memesan Dubai Chewy, Basque Burnt Cheesecake, brownies, dessert box, puding, dan croissant untuk kebutuhan pribadi maupun pasokan cafe melalui halaman produk atau WhatsApp.",
  },
  {
    question: "Apa itu Dubai Chewy?",
    answer:
      "Dubai Chewy adalah chewy cookie dengan isian krim cokelat pistachio dan kunafa renyah. Teksturnya kenyal di luar dan lumer di dalam, sehingga digemari sebagai jajanan viral dan oleh-oleh kekinian.",
  },
  {
    question: "Apakah Gee Co. melayani pesanan dalam jumlah besar?",
    answer:
      "Ya. Selain pesanan rumahan, Gee Co. memasok dessert dan jajanan dalam jumlah besar untuk cafe, restoran, toko kue, dan acara di Sukoharjo, Surakarta, serta kota sekitarnya. Jumlah minimum dan harga grosir dikonfirmasi lewat WhatsApp.",
  },
  {
    question: "Bagaimana cara memesan dessert Gee Co.?",
    answer:
      "Pilih produk di halaman Products, lalu hubungi Gee Co. melalui WhatsApp atau halaman Kontak. Sebutkan produk, jumlah, tanggal pengiriman, dan lokasi agar pesanan dapat dikonfirmasi.",
  },
  {
    question: "Apakah pengiriman bisa ke luar Solo Raya?",
    answer:
      "Gee Co. melayani pengiriman di Sukoharjo, Surakarta (Solo), Karanganyar, Boyolali, Klaten, dan Solo Baru. Untuk luar area tersebut, hubungi kami untuk mengecek kemungkinan pengiriman.",
  },
];

export const HOME_FAQS_EN: FaqItem[] = [
  {
    question: "Where can I buy desserts and viral snacks in Sukoharjo and Surakarta?",
    answer:
      "Gee Co. is based in Sukoharjo and serves Surakarta (Solo) and the surrounding area. You can order Dubai Chewy, Basque Burnt Cheesecake, brownies, dessert boxes, pudding, and croissants for personal orders or cafe supply through the products page or WhatsApp.",
  },
  {
    question: "What is Dubai Chewy?",
    answer:
      "Dubai Chewy is a chewy cookie filled with pistachio chocolate cream and crunchy kunafa. It is chewy outside and molten inside, which is why it has become a popular viral treat and modern souvenir.",
  },
  {
    question: "Does Gee Co. accept large orders?",
    answer:
      "Yes. Besides home orders, Gee Co. supplies desserts and snacks in large volumes for cafes, restaurants, bakeries, and events in Sukoharjo, Surakarta, and nearby cities. Minimum quantities and wholesale prices are confirmed via WhatsApp.",
  },
  {
    question: "How do I order Gee Co. desserts?",
    answer:
      "Choose a product on the Products page, then contact Gee Co. via WhatsApp or the Contact page. Include the product, quantity, delivery date, and location so we can confirm your order.",
  },
  {
    question: "Do you deliver outside Solo Raya?",
    answer:
      "Gee Co. delivers across Sukoharjo, Surakarta (Solo), Karanganyar, Boyolali, Klaten, and Solo Baru. For other areas, contact us to check delivery availability.",
  },
];

export const PRODUCT_FAQS: FaqItem[] = [
  {
    question: "Dessert apa saja yang tersedia di Gee Co.?",
    answer:
      "Menu Gee Co. mencakup Dubai Chewy, Basque Burnt Cheesecake, Brownies Fudge, Dessert Box Tiramisu, Puding Regal, dan Croissant Butter. Ketersediaan dan harga terbaru dikonfirmasi melalui WhatsApp.",
  },
  {
    question: "Apakah Dubai Chewy bisa dipesan untuk hampers?",
    answer:
      "Bisa. Dubai Chewy dapat dipesan untuk oleh-oleh, hampers, dan menu dessert cafe. Jumlah, kemasan, dan jadwal pengambilan atau pengiriman disesuaikan saat pemesanan.",
  },
  {
    question: "Apakah ada harga khusus untuk pembelian dalam jumlah banyak?",
    answer:
      "Ya. Gee Co. menyediakan harga khusus per klien untuk cafe dan mitra yang memesan rutin. Harga berlaku sesuai tanggal kesepakatan dan tidak mengubah invoice lama.",
  },
];

export const PRODUCT_FAQS_EN: FaqItem[] = [
  {
    question: "What desserts does Gee Co. offer?",
    answer:
      "The Gee Co. menu includes Dubai Chewy, Basque Burnt Cheesecake, Brownies Fudge, Dessert Box Tiramisu, Puding Regal, and Butter Croissant. Availability and current prices are confirmed via WhatsApp.",
  },
  {
    question: "Can Dubai Chewy be ordered for hampers?",
    answer:
      "Yes. Dubai Chewy can be ordered for souvenirs, hampers, and cafe dessert menus. Quantity, packaging, and pickup or delivery schedules are arranged when you order.",
  },
  {
    question: "Is there a special price for bulk purchases?",
    answer:
      "Yes. Gee Co. offers per-client pricing for cafes and partners who order regularly. Prices apply from the agreed date and never change past invoices.",
  },
];

export const SUPPLIER_FAQS: FaqItem[] = [
  {
    question: "Apakah Gee Co. supplier dessert untuk cafe di Sukoharjo dan Solo?",
    answer:
      "Ya. Gee Co. memasok dessert, bakery, dan jajanan viral untuk cafe, restoran, toko kue, dan bisnis kuliner di Sukoharjo, Surakarta (Solo), dan sekitarnya, termasuk Dubai Chewy, cheesecake, brownies, dessert box, puding, dan croissant.",
  },
  {
    question: "Berapa minimal order untuk pasokan cafe?",
    answer:
      "Jumlah minimum order bergantung pada jenis produk dan jadwal pengiriman. Hubungi Gee Co. melalui WhatsApp dengan daftar produk yang dibutuhkan agar MOQ dan harga grosir dapat dihitung.",
  },
  {
    question: "Apakah harga bisa berbeda untuk setiap cafe?",
    answer:
      "Bisa. Gee Co. mendukung harga khusus per klien dengan tanggal berlaku, sehingga setiap cafe dapat memiliki daftar harga sendiri. Invoice lama tetap aman karena harga disimpan saat invoice dibuat.",
  },
  {
    question: "Apakah Gee Co. menyediakan invoice dan mendukung PO?",
    answer:
      "Ya. Setiap pesanan dapat dibuatkan invoice resmi berisi rincian produk, pajak opsional, uang muka, dan status pembayaran, sehingga cocok untuk kebutuhan administrasi cafe dan restoran.",
  },
  {
    question: "Area mana saja yang dilayani Gee Co.?",
    answer:
      "Gee Co. berbasis di Sukoharjo dan melayani Surakarta (Solo) serta area sekitar seperti Karanganyar, Boyolali, Klaten, dan Solo Baru. Untuk area lain, hubungi kami untuk mengecek jadwal pengiriman.",
  },
];

export const SUPPLIER_FAQS_EN: FaqItem[] = [
  {
    question: "Is Gee Co. a dessert supplier for cafes in Sukoharjo and Solo?",
    answer:
      "Yes. Gee Co. supplies desserts, bakery items, and viral snacks to cafes, restaurants, bakeries, and food businesses in Sukoharjo, Surakarta (Solo), and nearby areas, including Dubai Chewy, cheesecake, brownies, dessert boxes, pudding, and croissants.",
  },
  {
    question: "What is the minimum order for cafe supply?",
    answer:
      "Minimum order quantities depend on the product and delivery schedule. Contact Gee Co. via WhatsApp with your product list so we can calculate MOQ and wholesale pricing.",
  },
  {
    question: "Can each cafe have a different price?",
    answer:
      "Yes. Gee Co. supports per-client pricing with effective dates, so each cafe can have its own price list. Past invoices stay unchanged because prices are stored when the invoice is created.",
  },
  {
    question: "Does Gee Co. provide invoices and support purchase orders?",
    answer:
      "Yes. Every order can be issued an official invoice with item details, optional tax, down payment, and payment status, making it suitable for cafe and restaurant administration.",
  },
  {
    question: "Which areas does Gee Co. serve?",
    answer:
      "Gee Co. is based in Sukoharjo and serves Surakarta (Solo) plus nearby areas such as Karanganyar, Boyolali, Klaten, and Solo Baru. For other areas, contact us to check delivery schedules.",
  },
];

export const SUPPLIER_BENEFITS = [
  {
    title: "Harga khusus per cafe",
    description:
      "Daftar harga dapat disesuaikan per klien dan tanggal berlaku, sehingga margin cafe tetap terkontrol.",
  },
  {
    title: "Produk konsisten & siap jual",
    description:
      "Resep dan porsi dijaga konsisten agar rasa dan tampilan dessert tetap sama setiap pengiriman.",
  },
  {
    title: "Jajanan viral untuk menu",
    description:
      "Dubai Chewy dan dessert kekinian membantu cafe menghadirkan menu yang sedang dicari pelanggan.",
  },
  {
    title: "Administrasi rapi",
    description:
      "Invoice resmi dengan rincian item, pajak opsional, uang muka, dan status pembayaran untuk kebutuhan PO.",
  },
  {
    title: "Pengiriman area Solo Raya",
    description:
      "Pengiriman ke Sukoharjo, Surakarta, dan sekitarnya dengan jadwal yang disepakati bersama.",
  },
  {
    title: "Pemesanan langsung",
    description:
      "Tanpa perantara: pesan, konfirmasi, dan pantau pesanan langsung bersama tim Gee Co.",
  },
];

export const SUPPLIER_BENEFITS_EN = [
  {
    title: "Per-cafe pricing",
    description:
      "Price lists can be tailored per client with effective dates, keeping cafe margins under control.",
  },
  {
    title: "Consistent, ready-to-sell products",
    description:
      "Recipes and portions are kept consistent so taste and presentation stay the same on every delivery.",
  },
  {
    title: "Viral snacks for your menu",
    description:
      "Dubai Chewy and modern desserts help cafes offer menu items customers are actively looking for.",
  },
  {
    title: "Clean administration",
    description:
      "Official invoices with item details, optional tax, down payment, and payment status for purchase orders.",
  },
  {
    title: "Solo Raya delivery",
    description:
      "Delivery to Sukoharjo, Surakarta, and surrounding areas on mutually agreed schedules.",
  },
  {
    title: "Order directly",
    description:
      "No middlemen: order, confirm, and track your order directly with the Gee Co. team.",
  },
];

export const SUPPLIER_STEPS = [
  {
    title: "Hubungi & sebutkan kebutuhan",
    description:
      "Kirim daftar produk, perkiraan jumlah, dan lokasi cafe melalui WhatsApp atau halaman Kontak.",
  },
  {
    title: "Terima penawaran",
    description:
      "Gee Co. mengonfirmasi ketersediaan, harga khusus, MOQ, dan jadwal pengiriman.",
  },
  {
    title: "Konfirmasi pesanan",
    description: "Setujui pesanan dan terima invoice resmi beserta rincian pembayaran.",
  },
  {
    title: "Terima pengiriman",
    description:
      "Produk dikirim sesuai jadwal ke lokasi cafe di Sukoharjo, Surakarta, dan area sekitarnya.",
  },
];

export const SUPPLIER_STEPS_EN = [
  {
    title: "Contact us with your needs",
    description:
      "Send your product list, estimated quantity, and cafe location via WhatsApp or the Contact page.",
  },
  {
    title: "Receive a quote",
    description:
      "Gee Co. confirms availability, special pricing, MOQ, and the delivery schedule.",
  },
  {
    title: "Confirm the order",
    description: "Approve the order and receive an official invoice with payment details.",
  },
  {
    title: "Receive delivery",
    description:
      "Products are delivered on schedule to your cafe in Sukoharjo, Surakarta, and nearby areas.",
  },
];

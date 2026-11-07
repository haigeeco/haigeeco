import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BUSINESS, DEFAULT_KEYWORDS, SITE_URL, absoluteUrl } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const googleVerification = (process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "").trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dessert & Jajanan Viral Sukoharjo & Surakarta — Dubai Chewy | Gee Co.",
    template: "%s · Gee Co.",
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: BUSINESS.name, url: SITE_URL }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  category: "food",
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/icon.png", sizes: "192x192" }],
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: BUSINESS.name,
    title: "Dessert & Jajanan Viral Sukoharjo & Surakarta — Dubai Chewy | Gee Co.",
    description: BUSINESS.description,
    images: [{ url: absoluteUrl(BUSINESS.logo), alt: BUSINESS.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dessert & Jajanan Viral Sukoharjo & Surakarta — Dubai Chewy | Gee Co.",
    description: BUSINESS.description,
    images: [absoluteUrl(BUSINESS.logo)],
  },
  robots: { index: true, follow: true },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-cream text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

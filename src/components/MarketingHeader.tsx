"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_LOGO_URL } from "@/lib/domain";
import { useLanguage, LanguageToggle } from "@/components/language";

const NAV = [
  { href: "/", id: "Beranda", en: "Home" },
  { href: "/products", id: "Produk", en: "Products" },
  { href: "/collaboration", id: "Kolaborasi", en: "Collaboration" },
  { href: "/blog", id: "Blog", en: "Blog" },
  { href: "/contact", id: "Kontak", en: "Contact" },
];

export function MarketingHeader() {
  const { locale } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-cream/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1 shadow-sm ring-1 ring-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULT_LOGO_URL} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            Gee Co.
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label={locale === "id" ? "Navigasi utama" : "Main navigation"}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-white hover:text-ink"
            >
              {item[locale]}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageToggle />
          <Link
            href="/login"
            className="hidden rounded-full bg-pistachio px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark md:inline-flex"
          >
            {locale === "id" ? "Masuk" : "Sign in"}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={
              open
                ? locale === "id"
                  ? "Tutup menu"
                  : "Close menu"
                : locale === "id"
                  ? "Buka menu"
                  : "Open menu"
            }
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white/70 text-ink-soft transition hover:bg-white hover:text-ink md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="absolute inset-x-0 top-full border-t border-line bg-cream shadow-xl md:hidden"
          aria-label={locale === "id" ? "Navigasi seluler" : "Mobile navigation"}
        >
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-white hover:text-ink"
              >
                {item[locale]}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-full bg-pistachio px-3 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
            >
              {locale === "id" ? "Masuk" : "Sign in"}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

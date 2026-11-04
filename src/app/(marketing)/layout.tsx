import Link from "next/link";
import type { ReactNode } from "react";
import { DEFAULT_LOGO_URL } from "@/lib/domain";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/collaboration", label: "Kolaborasi" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Kontak" },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DEFAULT_LOGO_URL} alt="" className="h-8 w-8 object-contain" />
            <span className="text-sm font-semibold text-slate-900">Gee Co.</span>
          </Link>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:text-sm"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/login"
            className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700 sm:text-sm"
          >
            Masuk
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-8 text-sm text-slate-500 md:px-8">
          <p className="font-medium text-slate-700">Gee Co.</p>
          <p>© {new Date().getFullYear()} Gee Co. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}

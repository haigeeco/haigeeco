"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { CONTENT_ROLES, FINANCE_ROLES, SUPERUSER_ONLY, homePathForRole } from "@/lib/access";
import { useSettings } from "@/lib/db/settings";
import { roleLabel, useCurrentProfile } from "@/lib/db/users";
import { DEFAULT_LOGO_URL, defaultSettings } from "@/lib/domain";
import { getSupabase } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/types";
import { cn } from "./ui";

const ICONS: Record<string, string> = {
  dashboard: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z",
  invoice:
    "M9 8h6M9 12h6M9 16h3M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z",
  clients:
    "M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM21 19v-1a4 4 0 0 0-3-3.87M16.5 3.5a3.5 3.5 0 0 1 0 6.9",
  products:
    "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  blog: "M4 5a2 2 0 0 1 2-2h9l5 5v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zM14 3v5h5M8 13h8M8 17h5",
  users:
    "M17 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9.5 10a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM22 20v-2a4 4 0 0 0-3-3.87M16.5 3.5a3.5 3.5 0 0 1 0 6.9",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.18V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 6.6 19.4l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 10 5.4V5a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 2.82 1.18l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 20.4 12H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

const NAV: Array<{ href: string; label: string; icon: string; roles: AppRole[] }> = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", roles: SUPERUSER_ONLY },
  { href: "/admin/invoices", label: "Invoice", icon: "invoice", roles: FINANCE_ROLES },
  { href: "/admin/clients", label: "Klien", icon: "clients", roles: FINANCE_ROLES },
  { href: "/admin/products", label: "Produk", icon: "products", roles: FINANCE_ROLES },
  { href: "/admin/blog", label: "Blog", icon: "blog", roles: CONTENT_ROLES },
  { href: "/admin/users", label: "Pengguna", icon: "users", roles: SUPERUSER_ONLY },
  { href: "/admin/settings", label: "Pengaturan", icon: "settings", roles: SUPERUSER_ONLY },
];

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

function isActive(pathname: string, href: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (href === "/" || href === "/admin") return path === href;
  return path === href || path.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const settings = useSettings().data ?? defaultSettings();
  const profile = useCurrentProfile().data ?? null;
  const role = profile?.role ?? null;

  const section = NAV.find((item) => isActive(pathname, item.href));
  const allowed = !section || (role !== null && section.roles.includes(role));

  useEffect(() => {
    if (!allowed) router.replace(homePathForRole(role));
  }, [allowed, role, router]);

  if (pathname.includes("/invoices/print")) {
    return <>{children}</>;
  }

  const nav = NAV.filter((item) => role !== null && item.roles.includes(role));

  async function signOut() {
    await getSupabase().auth.signOut();
    router.replace("/login");
  }

  const brand = (
    <div className="flex min-w-0 items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={settings.logoUrl || DEFAULT_LOGO_URL}
        alt=""
        className="h-9 w-9 shrink-0 rounded-lg object-contain"
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold text-slate-900">{settings.name || "Gee Co."}</p>
        <p className="text-[11px] text-slate-500">Invoice Manager</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-hidden border-r border-slate-200 bg-white px-4 py-5 md:flex">
        {brand}
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="truncate text-sm font-medium text-slate-800">
            {profile?.full_name || "Pengguna"}
          </p>
          <p className="text-[11px] text-slate-500">{roleLabel(role)}</p>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            {brand}
            <button
              onClick={signOut}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Keluar
            </button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                    active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {allowed ? (
            children
          ) : (
            <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-slate-500">
              Anda tidak punya akses ke halaman ini. Mengalihkan…
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

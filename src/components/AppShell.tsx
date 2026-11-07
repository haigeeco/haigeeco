"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const section = NAV.find((item) => isActive(pathname, item.href));
  const allowed = !section || (role !== null && section.roles.includes(role));

  useEffect(() => {
    if (!allowed) router.replace(homePathForRole(role));
  }, [allowed, role, router]);

  useEffect(() => {
    if (!menuOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

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
        <p className="truncate font-display text-sm font-semibold text-ink">
          {settings.name || "Gee Co."}
        </p>
        <p className="text-[11px] text-ink-soft">{section?.label ?? "Invoice Manager"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-hidden border-r border-line bg-white px-4 py-5 md:flex">
        {brand}
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navigasi admin">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-pistachio-soft text-pistachio-dark"
                    : "text-ink-soft hover:bg-cream-deep hover:text-ink"
                )}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-6 border-t border-line pt-4">
          <p className="truncate text-sm font-medium text-ink">
            {profile?.full_name || "Pengguna"}
          </p>
          <p className="truncate text-[11px] text-ink-soft">
            {profile?.username ? `@${profile.username} · ` : ""}
            {roleLabel(role)}
          </p>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-cream-deep hover:text-ink"
          >
            Keluar
          </button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-cream/85 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="admin-drawer"
              aria-label="Buka menu admin"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-white/70 text-ink-soft transition hover:bg-white hover:text-ink"
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
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-ink/40"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <aside
              id="admin-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu admin"
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white p-4 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3">
                {brand}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup menu"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-cream-deep hover:text-ink"
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
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <nav
                className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto"
                aria-label="Navigasi admin"
              >
                {nav.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                        active
                          ? "bg-pistachio-soft text-pistachio-dark"
                          : "text-ink-soft hover:bg-cream-deep hover:text-ink"
                      )}
                    >
                      <Icon name={item.icon} className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-4 border-t border-line pt-4">
                <p className="truncate text-sm font-medium text-ink">
                  {profile?.full_name || "Pengguna"}
                </p>
                <p className="truncate text-[11px] text-ink-soft">
                  {profile?.username ? `@${profile.username} · ` : ""}
                  {roleLabel(role)}
                </p>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    void signOut();
                  }}
                  className="mt-3 w-full rounded-full border border-line px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                >
                  Keluar
                </button>
              </div>
            </aside>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {allowed ? (
            children
          ) : (
            <p className="rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center text-sm text-ink-soft">
              Anda tidak punya akses ke halaman ini. Mengalihkan…
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

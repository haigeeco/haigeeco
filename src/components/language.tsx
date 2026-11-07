"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type Locale = "id" | "en";

const STORAGE_KEY = "geeco-locale";
const listeners = new Set<() => void>();

function readLocale(): Locale {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

function getServerLocale(): Locale {
  return "id";
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setGlobalLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // localStorage tidak tersedia — abaikan.
  }
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, getServerLocale);

  // Default server render = Bahasa Indonesia agar konten awal tetap ramah SEO.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setGlobalLocale(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage harus dipakai di dalam LanguageProvider");
  return context;
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label={locale === "id" ? "Pilih bahasa" : "Choose language"}
      className={`inline-flex items-center rounded-full border border-line bg-white/70 p-0.5 text-[11px] font-semibold ${className}`}
    >
      {(["id", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => setLocale(value)}
          aria-pressed={locale === value}
          className={
            locale === value
              ? "rounded-full bg-pistachio px-2.5 py-1 text-white shadow-sm"
              : "rounded-full px-2.5 py-1 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
          }
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-2xl">
        ⚠️
      </span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-md text-sm text-ink-soft">
        Maaf, ada masalah saat menampilkan halaman ini. Data Anda tetap aman di server.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => retry()}
          className="rounded-full bg-pistachio px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pistachio-dark"
        >
          Coba lagi
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-cream-deep"
        >
          Muat ulang halaman
        </button>
        <Link
          href="/"
          className="rounded-full px-5 py-2.5 text-sm font-medium text-ink-soft transition hover:bg-cream-deep"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}

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
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Terjadi kesalahan</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Maaf, ada masalah saat menampilkan halaman ini. Data Anda tetap aman di server.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => retry()}
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          Coba lagi
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Muat ulang halaman
        </button>
        <Link
          href="/"
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}

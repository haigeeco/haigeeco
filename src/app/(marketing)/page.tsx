import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-20 text-center md:px-8 md:py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Gee Co.</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
        Welcome to Gee Co.
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
        Halaman profil perusahaan sedang kami siapkan. Sementara itu, jelajahi peluang kolaborasi
        atau baca artikel terbaru kami.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/collaboration"
          className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          Kolaborasi Kafe
        </Link>
        <Link
          href="/blog"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Baca Blog
        </Link>
      </div>
    </section>
  );
}

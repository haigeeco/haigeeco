import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Informasi dan kontak Gee Co.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Kontak</h1>
      <p className="mt-4 text-base text-slate-600">
        Ada pertanyaan atau ingin bekerja sama? Hubungi kami melalui kanal di bawah ini.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Email</p>
          <p className="mt-1 text-sm text-slate-700">hello@geeco.id</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Telepon</p>
          <p className="mt-1 text-sm text-slate-700">+62 8xx xxxx xxxx</p>
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Informasi kontak resmi akan diperbarui menyusul.
      </p>
    </div>
  );
}

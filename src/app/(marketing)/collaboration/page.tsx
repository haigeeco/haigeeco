import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kolaborasi",
  description: "Peluang kolaborasi Gee Co. dengan teman-teman kafe.",
};

export default function CollaborationPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
        Kolaborasi Kafe
      </h1>
      <p className="mt-4 text-base text-slate-600">
        Kami terbuka untuk berkolaborasi dengan kafe-kafe yang ingin tumbuh bersama. Halaman ini
        akan memuat detail program, alur kerja sama, dan keuntungan bermitra.
      </p>
      <div className="mt-10 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Konten sedang disiapkan.
      </div>
    </div>
  );
}

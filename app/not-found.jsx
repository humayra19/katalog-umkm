import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-garis bg-permukaan text-4xl">
        🔍
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-base text-teks-lembut">
        Maaf, halaman atau produk yang Anda tuju tidak tersedia, telah dihapus,
        atau tautan yang Anda masukkan keliru.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
        >
          ← Kembali ke Beranda
        </Link>
        <Link
          href="/tentang"
          className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-5 py-2.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
        >
          Hubungi Toko
        </Link>
      </div>
    </div>
  );
}

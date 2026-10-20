"use client";

import Link from "next/link";
import { useFavorit } from "@/components/FavoritContext";
import KartuProduk from "@/components/KartuProduk";

export default function HalamanFavorit() {
  const { favorit, totalFavorit } = useFavorit();

  return (
    <div className="py-8 md:py-12">
      <Link
        href="/"
        className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
      >
        ← Kembali ke katalog
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-teks md:text-4xl">
            Produk Favorit
          </h1>
          <p className="mt-1 text-sm text-teks-lembut">
            Daftar produk yang telah Anda simpan di perangkat ini.
          </p>
        </div>
        {totalFavorit > 0 && (
          <span className="rounded-full bg-utama/10 px-3 py-1 text-xs font-bold text-utama">
            {totalFavorit} Produk
          </span>
        )}
      </div>

      {totalFavorit === 0 ? (
        <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan px-6 py-16 text-center">
          <div className="text-5xl">♡</div>
          <h2 className="mt-4 text-xl font-bold text-teks">
            Belum ada produk favorit
          </h2>
          <p className="mt-2 max-w-sm text-sm text-teks-lembut">
            Tandai produk yang Anda sukai dengan menekan ikon hati pada katalog
            agar mudah ditemukan kembali.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-lg bg-utama px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Mulai Belanja di Katalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {favorit.map((item) => (
            <KartuProduk key={item.id} produk={item} />
          ))}
        </div>
      )}
    </div>
  );
}


"use client";

import Link from "next/link";
import { toko } from "@/lib/toko";
import { useKeranjang } from "@/components/KeranjangContext";
import { useFavorit } from "@/components/FavoritContext";
import TombolTema from "@/components/TombolTema";

export default function Header() {
  const { totalItem, setIsBukaModal } = useKeranjang();
  const { totalFavorit } = useFavorit();

  return (
    <header className="border-b border-garis bg-latar transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-extrabold tracking-tight text-utama hover:text-utama-gelap"
          >
            {toko.nama}
          </Link>
          <Link
            href="/tentang"
            className="hidden text-sm font-medium text-teks-lembut transition-colors hover:text-utama sm:inline-block"
          >
            Tentang Kami
          </Link>
          <Link
            href="/bandingkan"
            className="hidden text-sm font-medium text-teks-lembut transition-colors hover:text-utama md:inline-block"
          >
            Bandingkan
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* US-24: Tautan Favorit */}
          <Link
            href="/favorit"
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama sm:px-3"
            aria-label="Lihat produk favorit"
            title="Produk Favorit"
          >
            <span className="text-base text-bahaya leading-none">♥</span>
            <span className="hidden sm:inline">Favorit</span>
            {totalFavorit > 0 && (
              <span className="rounded-full bg-bahaya px-1.5 py-0.2 text-[11px] font-bold text-white">
                {totalFavorit}
              </span>
            )}
          </Link>

          {/* US-21: Keranjang */}
          <button
            type="button"
            onClick={() => setIsBukaModal(true)}
            className="relative inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-2.5 py-1.5 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama sm:px-3"
            aria-label="Buka keranjang belanja"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Keranjang</span>
            {totalItem > 0 && (
              <span className="rounded-full bg-utama px-1.5 py-0.2 text-[11px] font-bold text-white">
                {totalItem}
              </span>
            )}
          </button>

          {/* US-25: Toggle Dark Mode */}
          <TombolTema />
        </div>
      </div>
    </header>
  );
}

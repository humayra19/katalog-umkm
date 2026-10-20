"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { useKeranjang } from "@/components/KeranjangContext";
import { useFavorit } from "@/components/FavoritContext";

export default function KartuProduk({ produk }) {
  const { tambahItem } = useKeranjang();
  const { isFavorit, toggleFavorit } = useFavorit();

  const isHabis =
    produk.stok === 0 ||
    produk.stok === "0" ||
    produk.status === "habis" ||
    produk.status_stok === "habis" ||
    produk.is_habis === true;

  const adaDiskon = Boolean(
    produk.harga_diskon && Number(produk.harga_diskon) < Number(produk.harga)
  );
  const hargaTampil = adaDiskon ? produk.harga_diskon : produk.harga;

  // Badge: Habis, Terlaris, atau Baru
  const badge = isHabis
    ? "Habis"
    : produk.badge || (produk.is_terlaris ? "Terlaris" : produk.is_baru ? "Baru" : null);

  const disukai = isFavorit(produk.id);

  const handleTambahKeranjang = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isHabis) {
      tambahItem(produk, 1, "Standar");
    }
  };

  const handleFavorit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorit(produk);
  };

  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-garis bg-latar"
    >
      {badge && (
        <span
          className={`absolute top-2 left-2 z-10 rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-xs ${
            badge === "Habis"
              ? "bg-bahaya"
              : badge === "Terlaris"
              ? "bg-harga"
              : "bg-utama"
          }`}
        >
          {badge}
        </span>
      )}

      {/* US-24: Tombol Favorit */}
      <button
        type="button"
        onClick={handleFavorit}
        className={`absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-garis bg-latar/90 backdrop-blur-xs transition-colors hover:scale-105 ${
          disukai
            ? "border-bahaya/40 text-bahaya"
            : "text-teks-lembut hover:text-bahaya"
        }`}
        aria-label={disukai ? "Hapus dari favorit" : "Tambah ke favorit"}
        title={disukai ? "Hapus dari favorit" : "Tambah ke favorit"}
      >
        <span className="text-base leading-none">{disukai ? "♥" : "♡"}</span>
      </button>

      <img
        src={produk.foto_url}
        alt={produk.nama}
        className={`aspect-square w-full bg-permukaan object-cover ${
          isHabis ? "opacity-60 grayscale" : ""
        }`}
      />

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="text-xs text-teks-lembut">{produk.kategori}</p>
        <h3 className="font-semibold leading-snug group-hover:text-utama">{produk.nama}</h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-1 pt-2">
          <div className="flex flex-col">
            {adaDiskon && (
              <span className="text-xs text-teks-lembut line-through">
                {formatRupiah(produk.harga)}
              </span>
            )}
            <span className="rounded-md bg-harga-latar px-2 py-0.5 text-sm font-bold text-harga">
              {formatRupiah(hargaTampil)}
            </span>
          </div>

          {!isHabis && (
            <button
              type="button"
              onClick={handleTambahKeranjang}
              className="rounded-lg border border-garis bg-latar px-2.5 py-1 text-xs font-semibold text-teks hover:border-utama hover:text-utama"
              title="Tambah ke keranjang"
            >
              + Keranjang
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

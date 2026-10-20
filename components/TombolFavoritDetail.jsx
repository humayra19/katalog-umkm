"use client";

import { useFavorit } from "@/components/FavoritContext";

export default function TombolFavoritDetail({ produk }) {
  const { isFavorit, toggleFavorit } = useFavorit();
  const disukai = isFavorit(produk?.id);

  if (!produk) return null;

  return (
    <button
      type="button"
      onClick={() => toggleFavorit(produk)}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold transition-colors hover:border-utama hover:text-utama ${
        disukai ? "border-bahaya/40 text-bahaya" : "text-teks"
      }`}
      aria-label={disukai ? "Hapus dari favorit" : "Tambah ke favorit"}
      title={disukai ? "Hapus dari favorit" : "Simpan ke favorit"}
    >
      <span className="text-base leading-none text-bahaya">
        {disukai ? "♥" : "♡"}
      </span>
      <span>{disukai ? "Favorit" : "Simpan"}</span>
    </button>
  );
}


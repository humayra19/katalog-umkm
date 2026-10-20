"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { useKeranjang } from "@/components/KeranjangContext";

export default function TombolWhatsApp({
  produk,
  daftarVarian = ["Standar", "Kemasan Besar", "Ekstra / Spesial"],
  stokHabis = false,
}) {
  const { tambahItem } = useKeranjang();

  if (!produk) {
    return null;
  }

  const isHabis =
    stokHabis ||
    produk.stok === 0 ||
    produk.stok === "0" ||
    produk.status === "habis" ||
    produk.status_stok === "habis" ||
    produk.is_habis === true;

  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState(daftarVarian[0] || "Standar");

  const hargaSatuan = produk.harga_diskon || produk.harga || 0;
  const totalHarga = hargaSatuan * jumlah;
  const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");

  const infoVarian = varian && varian !== "Standar" ? ` (Varian: ${varian})` : "";
  const pesan = `Halo, saya ingin memesan ${produk.nama}${infoVarian} sebanyak ${jumlah} buah dengan total harga ${formatRupiah(totalHarga)}.`;
  const href = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  if (isHabis) {
    return (
      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled
          className="inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-garis bg-permukaan px-5 py-3 font-semibold text-teks-lembut opacity-60 sm:w-auto"
        >
          Stok Habis
        </button>
        <p className="text-xs text-teks-lembut">
          Produk ini sedang tidak tersedia untuk dipesan.
        </p>
      </div>
    );
  }

  const handleKlikPesan = () => {
    // US-40: Catat klik WA secara asinkron tanpa menghambat navigasi
    if (produk?.id) {
      try {
        fetch("/api/klik-wa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ produk_id: produk.id }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        // Abaikan error jaringan
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Pilihan Jumlah */}
        <div className="flex items-center gap-2">
          <label htmlFor="jumlah" className="text-sm font-semibold text-teks">
            Jumlah:
          </label>
          <div className="flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
              className="px-3 py-1 text-base font-bold text-teks-lembut hover:text-utama"
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <input
              id="jumlah"
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-12 text-center text-sm font-semibold text-teks focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setJumlah((prev) => prev + 1)}
              className="px-3 py-1 text-base font-bold text-teks-lembut hover:text-utama"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>

        {/* Pilihan Varian */}
        {daftarVarian.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="varian" className="text-sm font-semibold text-teks">
              Varian:
            </label>
            <select
              id="varian"
              value={varian}
              onChange={(e) => setVarian(e.target.value)}
              className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks focus:border-utama focus:outline-none"
            >
              {daftarVarian.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-teks-lembut">
          Total: <span className="font-bold text-harga">{formatRupiah(totalHarga)}</span>
        </p>

        <div className="flex flex-wrap gap-3">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleKlikPesan}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:flex-initial"
          >
            Pesan via WhatsApp
          </a>

          <button
            type="button"
            onClick={() => tambahItem(produk, jumlah, varian)}
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-garis bg-latar px-5 py-3 font-semibold text-teks hover:border-utama hover:text-utama sm:flex-initial"
          >
            + Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

const STORAGE_KEY = "katalog_terakhir_dilihat";
const MAX_ITEMS = 6;

export default function CatatTerakhirDilihat({ produk }) {
  useEffect(() => {
    if (!produk || !produk.id) return;

    try {
      const dataLokal = localStorage.getItem(STORAGE_KEY);
      let list = dataLokal ? JSON.parse(dataLokal) : [];

      if (!Array.isArray(list)) list = [];

      // Simpan objek ringkas produk
      const ringkasan = {
        id: produk.id,
        nama: produk.nama,
        harga: produk.harga,
        harga_diskon: produk.harga_diskon,
        kategori: produk.kategori,
        foto_url: produk.foto_url,
        badge: produk.badge,
        stok: produk.stok,
        is_habis: produk.is_habis,
      };

      // Hapus jika sudah ada sebelumnya agar berada di urutan terdepan
      list = list.filter((item) => String(item.id) !== String(produk.id));
      list.unshift(ringkasan);

      // Batasi maksimal jumlah produk yang disimpan
      if (list.length > MAX_ITEMS) {
        list = list.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Abaikan error saat akses localStorage
    }
  }, [produk]);

  return null;
}


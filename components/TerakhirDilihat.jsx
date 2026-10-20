"use client";

import { useEffect, useState } from "react";
import KartuProduk from "@/components/KartuProduk";

const STORAGE_KEY = "katalog_terakhir_dilihat";

export default function TerakhirDilihat() {
  const [daftarProduk, setDaftarProduk] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const dataLokal = localStorage.getItem(STORAGE_KEY);
      if (dataLokal) {
        const parsed = JSON.parse(dataLokal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDaftarProduk(parsed);
        }
      }
    } catch {
      // Abaikan jika error membaca localStorage
    }
  }, []);

  if (!isMounted || daftarProduk.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="judul-terakhir-dilihat" className="mt-14 border-t border-garis pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="judul-terakhir-dilihat" className="text-xl font-bold text-teks">
            Terakhir Dilihat
          </h2>
          <p className="mt-0.5 text-xs text-teks-lembut">
            Produk yang baru saja Anda buka sebelumnya
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6">
        {daftarProduk.map((produk) => (
          <KartuProduk key={produk.id} produk={produk} />
        ))}
      </div>
    </section>
  );
}


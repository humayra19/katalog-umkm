"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

const KeranjangContext = createContext();

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isBukaModal, setIsBukaModal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Muat dari localStorage saat awal
  useEffect(() => {
    try {
      const tersimpan = localStorage.getItem("keranjang_umkm");
      if (tersimpan) {
        setItems(JSON.parse(tersimpan));
      }
    } catch (e) {
      console.error("Gagal membaca keranjang dari storage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Simpan ke localStorage setiap ada perubahan
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("keranjang_umkm", JSON.stringify(items));
      } catch (e) {
        console.error("Gagal menyimpan keranjang:", e);
      }
    }
  }, [items, isLoaded]);

  const tambahItem = (produk, jumlah = 1, varian = "Standar") => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === produk.id && i.varian === varian
      );
      const hargaPakai = produk.harga_diskon || produk.harga || 0;

      if (idx > -1) {
        const copy = [...prev];
        copy[idx].jumlah += jumlah;
        return copy;
      }

      return [
        ...prev,
        {
          id: produk.id,
          nama: produk.nama,
          harga: hargaPakai,
          foto_url: produk.foto_url,
          jumlah,
          varian,
        },
      ];
    });
    setIsBukaModal(true);
  };

  const ubahJumlah = (id, varian, jumlahBaru) => {
    if (jumlahBaru <= 0) {
      hapusItem(id, varian);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id && i.varian === varian ? { ...i, jumlah: jumlahBaru } : i
      )
    );
  };

  const hapusItem = (id, varian) => {
    setItems((prev) =>
      prev.filter((i) => !(i.id === id && i.varian === varian))
    );
  };

  const kosongkanKeranjang = () => {
    setItems([]);
  };

  const totalItem = items.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalHarga = items.reduce(
    (acc, curr) => acc + curr.harga * curr.jumlah,
    0
  );

  return (
    <KeranjangContext.Provider
      value={{
        items,
        isBukaModal,
        setIsBukaModal,
        tambahItem,
        ubahJumlah,
        hapusItem,
        kosongkanKeranjang,
        totalItem,
        totalHarga,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const context = useContext(KeranjangContext);
  if (!context) {
    throw new Error("useKeranjang harus dipakai di dalam KeranjangProvider");
  }
  return context;
}


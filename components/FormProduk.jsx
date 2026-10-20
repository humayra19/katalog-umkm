"use client";

import { useState } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [nama, setNama] = useState(produk.nama || "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [sedangMembuatAI, setSedangMembuatAI] = useState(false);
  const [pesanErrorAI, setPesanErrorAI] = useState("");

  const handleBuatDeskripsiAI = async () => {
    if (!nama.trim()) {
      setPesanErrorAI("Isi nama produk terlebih dahulu.");
      return;
    }

    setSedangMembuatAI(true);
    setPesanErrorAI("");

    try {
      const res = await buatDeskripsiAI(nama, kategori);
      if (res?.error) {
        setPesanErrorAI(res.error);
      } else if (res?.deskripsi) {
        setDeskripsi(res.deskripsi);
      }
    } catch (err) {
      setPesanErrorAI(err.message || "Gagal membuat deskripsi.");
    } finally {
      setSedangMembuatAI(false);
    }
  };

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      <Input
        label="Nama produk"
        name="nama"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        required
      />

      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />

      <Input
        label="Kategori"
        name="kategori"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      />

      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="deskripsi" className="text-sm font-semibold text-teks">
            Deskripsi
          </label>
          <button
            type="button"
            onClick={handleBuatDeskripsiAI}
            disabled={sedangMembuatAI}
            className="inline-flex items-center gap-1 rounded-md border border-garis bg-permukaan px-2.5 py-1 text-xs font-semibold text-utama hover:border-utama hover:text-utama-gelap disabled:opacity-50"
          >
            {sedangMembuatAI ? "Memproses AI..." : "✨ Buat Deskripsi AI"}
          </button>
        </div>

        {pesanErrorAI && (
          <p className="text-xs text-bahaya">{pesanErrorAI}</p>
        )}

        <textarea
          id="deskripsi"
          name="deskripsi"
          rows={4}
          value={deskripsi}
          onChange={(e) => setDeskripsi(e.target.value)}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}

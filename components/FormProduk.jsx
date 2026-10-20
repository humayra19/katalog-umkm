"use client";

import { useActionState, useState, useEffect } from "react";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09).
// Mendukung upload foto (US-29), pilihan kategori (US-31), dan validasi server-side per-field (US-34).
export default function FormProduk({
  produk = {},
  labelTombol,
  action,
  geminiTersedia = true,
  daftarKategori = [],
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  const [nama, setNama] = useState(produk.nama || "");
  const [harga, setHarga] = useState(produk.harga !== undefined ? String(produk.harga) : "");
  const [kategori, setKategori] = useState(produk.kategori || "");
  const [deskripsi, setDeskripsi] = useState(produk.deskripsi || "");
  const [fotoUrl, setFotoUrl] = useState(produk.foto_url || "");
  const [previewFoto, setPreviewFoto] = useState(produk.foto_url || "");
  const [sedangMembuatAI, setSedangMembuatAI] = useState(false);
  const [pesanErrorAI, setPesanErrorAI] = useState("");

  // Pertahankan nilai input jika terjadi error dari server (US-34)
  useEffect(() => {
    if (state?.values) {
      if (state.values.nama !== undefined) setNama(state.values.nama);
      if (state.values.harga !== undefined) setHarga(state.values.harga);
      if (state.values.kategori !== undefined) setKategori(state.values.kategori);
      if (state.values.deskripsi !== undefined) setDeskripsi(state.values.deskripsi);
      if (state.values.foto_url !== undefined) {
        setFotoUrl(state.values.foto_url);
        if (state.values.foto_url) setPreviewFoto(state.values.foto_url);
      }
    }
  }, [state]);

  const handleBuatDeskripsiAI = async () => {
    if (!geminiTersedia) {
      setPesanErrorAI(
        "Kunci GEMINI_API_KEY belum terpasang di file .env.local. Tambahkan baris GEMINI_API_KEY=<kunci_api> pada file .env.local untuk mengaktifkan fitur ini."
      );
      return;
    }

    if (!nama.trim()) {
      setPesanErrorAI("Isi nama produk terlebih dahulu sebelum membuat deskripsi AI.");
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
      setPesanErrorAI(err.message || "Gagal membuat deskripsi dengan AI.");
    } finally {
      setSedangMembuatAI(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal adalah 5 MB.");
        e.target.value = "";
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewFoto(url);
    }
  };

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className="flex max-w-xl flex-col gap-4"
    >
      {produk.id && <input type="hidden" name="id" value={produk.id} />}

      {/* Pesan Error Global (jika ada) */}
      {state?.error && (
        <div className="rounded-xl border border-bahaya/40 bg-bahaya/10 p-4 text-sm font-semibold text-bahaya">
          {state.error}
        </div>
      )}

      {/* Input Nama Produk */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nama" className="text-sm font-semibold text-teks">
          Nama produk <span className="text-bahaya">*</span>
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className={`w-full rounded-lg border bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:outline-none ${
            state?.errors?.nama ? "border-bahaya focus:border-bahaya" : "border-garis focus:border-utama"
          }`}
        />
        {state?.errors?.nama && (
          <p className="text-xs font-semibold text-bahaya">{state.errors.nama}</p>
        )}
      </div>

      {/* Input Harga Produk */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="harga" className="text-sm font-semibold text-teks">
          Harga (Rp) <span className="text-bahaya">*</span>
        </label>
        <input
          id="harga"
          name="harga"
          type="number"
          min="0"
          value={harga}
          onChange={(e) => setHarga(e.target.value)}
          className={`w-full rounded-lg border bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:outline-none ${
            state?.errors?.harga ? "border-bahaya focus:border-bahaya" : "border-garis focus:border-utama"
          }`}
        />
        {state?.errors?.harga && (
          <p className="text-xs font-semibold text-bahaya">{state.errors.harga}</p>
        )}
      </div>

      {/* US-31: Pilihan Kategori dari Data Kategori */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="kategori" className="text-sm font-semibold text-teks">
          Kategori
        </label>
        {daftarKategori.length > 0 ? (
          <select
            id="kategori"
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks focus:border-utama focus:outline-none"
          >
            <option value="">-- Pilih Kategori --</option>
            {daftarKategori.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="kategori"
            name="kategori"
            type="text"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        )}
      </div>

      {/* US-29: Input File Foto Supabase Storage */}
      <div className="flex flex-col gap-2 rounded-xl border border-garis bg-permukaan p-4">
        <label htmlFor="file_foto" className="text-sm font-semibold text-teks">
          Upload Foto Produk (Supabase Storage)
        </label>
        <input
          id="file_foto"
          name="file_foto"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          onChange={handleFileChange}
          className="block w-full text-sm text-teks-lembut file:mr-4 file:rounded-lg file:border-0 file:bg-utama file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-utama-gelap"
        />
        <p className="text-xs text-teks-lembut">
          Format didukung: JPG, PNG, WebP, GIF, SVG (Maks. 5 MB). File akan otomatis
          diunggah ke bucket penyimpanan Supabase.
        </p>

        {previewFoto && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={previewFoto}
              alt="Pratinjau Foto"
              className="h-16 w-16 rounded-lg border border-garis object-cover bg-latar"
            />
            <span className="text-xs text-teks-lembut">Pratinjau foto produk</span>
          </div>
        )}

        <div className="mt-2 border-t border-garis pt-3">
          <label htmlFor="foto_url" className="text-xs font-semibold text-teks-lembut">
            Atau gunakan URL foto langsung:
          </label>
          <input
            id="foto_url"
            name="foto_url"
            type="text"
            value={fotoUrl}
            onChange={(e) => {
              setFotoUrl(e.target.value);
              if (e.target.value) setPreviewFoto(e.target.value);
            }}
            placeholder="https://... atau /produk/nama-file.svg"
            className="mt-1 w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>
      </div>

      {/* Input Deskripsi */}
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
          <div className="flex flex-col gap-1 rounded-lg border border-garis bg-permukaan p-3 text-xs text-teks-lembut">
            <div className="flex items-center gap-1.5 font-semibold text-bahaya">
              <span>⚠️</span>
              <span>Petunjuk AI</span>
            </div>
            <p>{pesanErrorAI}</p>
          </div>
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

      <Tombol type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Menyimpan..." : labelTombol}
      </Tombol>
    </form>
  );
}

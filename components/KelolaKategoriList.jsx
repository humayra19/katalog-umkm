"use client";

import { useState } from "react";
import {
  tambahKategoriAction,
  ubahKategoriAction,
  hapusKategoriAction,
} from "@/app/admin/actions";

export default function KelolaKategoriList({ daftarKategori = [], hitunganProduk = {} }) {
  const [editKategori, setEditKategori] = useState(null);
  const [namaBaru, setNamaBaru] = useState("");
  const [pesanError, setPesanError] = useState("");
  const [sedangProses, setSedangProses] = useState(false);

  const handleMulaiUbah = (kat) => {
    setEditKategori(kat);
    setNamaBaru(kat);
    setPesanError("");
  };

  const handleBatalUbah = () => {
    setEditKategori(null);
    setNamaBaru("");
    setPesanError("");
  };

  const handleSimpanUbah = async (e) => {
    e.preventDefault();
    if (!namaBaru.trim()) {
      setPesanError("Nama kategori tidak boleh kosong.");
      return;
    }

    setSedangProses(true);
    setPesanError("");

    try {
      const formData = new FormData();
      formData.set("nama_lama", editKategori);
      formData.set("nama_baru", namaBaru.trim());
      await ubahKategoriAction(formData);
      setEditKategori(null);
    } catch (err) {
      setPesanError(err.message || "Gagal mengubah kategori.");
    } finally {
      setSedangProses(false);
    }
  };

  const handleHapus = async (kat, jumlah) => {
    if (jumlah > 0) {
      alert(
        `Kategori "${kat}" masih digunakan oleh ${jumlah} produk dan tidak dapat dihapus.`
      );
      return;
    }

    const konfirmasi = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${kat}"?`
    );
    if (!konfirmasi) return;

    setSedangProses(true);
    setPesanError("");

    try {
      const formData = new FormData();
      formData.set("nama", kat);
      await hapusKategoriAction(formData);
    } catch (err) {
      setPesanError(err.message || "Gagal menghapus kategori.");
    } finally {
      setSedangProses(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {pesanError && (
        <div className="rounded-lg border border-bahaya/30 bg-bahaya/10 p-3 text-sm font-medium text-bahaya">
          {pesanError}
        </div>
      )}

      {/* Form Tambah Kategori */}
      <form
        action={tambahKategoriAction}
        className="flex flex-col gap-3 rounded-2xl border border-garis bg-permukaan p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="nama_kategori" className="text-sm font-semibold text-teks">
            Tambah Kategori Baru
          </label>
          <input
            id="nama_kategori"
            type="text"
            name="nama"
            required
            placeholder="Contoh: Aksesoris, Makanan Ringan..."
            className="mt-1.5 w-full rounded-lg border border-garis bg-latar px-3.5 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg bg-utama px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
        >
          + Tambah
        </button>
      </form>

      {/* Daftar Kategori */}
      <div className="overflow-hidden rounded-2xl border border-garis bg-latar">
        <div className="border-b border-garis bg-permukaan px-5 py-3">
          <h2 className="text-sm font-bold text-teks">
            Daftar Kategori ({daftarKategori.length})
          </h2>
        </div>

        {daftarKategori.length === 0 ? (
          <p className="p-6 text-center text-sm text-teks-lembut">
            Belum ada kategori yang terdaftar.
          </p>
        ) : (
          <ul className="divide-y divide-garis">
            {daftarKategori.map((kat) => {
              const jumlah = hitunganProduk[kat] || 0;
              const isEditing = editKategori === kat;

              return (
                <li
                  key={kat}
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:px-6"
                >
                  {isEditing ? (
                    <form
                      onSubmit={handleSimpanUbah}
                      className="flex flex-1 flex-wrap items-center gap-2"
                    >
                      <input
                        type="text"
                        value={namaBaru}
                        onChange={(e) => setNamaBaru(e.target.value)}
                        required
                        className="rounded-lg border border-utama bg-latar px-3 py-1.5 text-sm text-teks focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={sedangProses}
                        className="rounded-lg bg-utama px-3 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap disabled:opacity-50"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={handleBatalUbah}
                        className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:bg-permukaan"
                      >
                        Batal
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-teks">{kat}</span>
                      <span className="rounded-full bg-permukaan px-2.5 py-0.5 text-xs text-teks-lembut">
                        {jumlah} produk
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMulaiUbah(kat)}
                        className="rounded-lg border border-garis bg-latar px-3 py-1 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => handleHapus(kat, jumlah)}
                        className={`rounded-lg border border-garis bg-latar px-3 py-1 text-xs font-semibold transition-colors ${
                          jumlah > 0
                            ? "cursor-not-allowed text-teks-lembut opacity-50"
                            : "text-bahaya hover:border-bahaya"
                        }`}
                        title={
                          jumlah > 0
                            ? "Tidak dapat dihapus karena masih digunakan produk"
                            : "Hapus kategori"
                        }
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}


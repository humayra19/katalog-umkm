"use client";

import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProduk, toggleStatusProduk } from "@/app/admin/actions";

export default function TabelProduk({ daftarProduk = [] }) {
  const handleHapus = (e, nama) => {
    if (!confirm(`Yakin ingin menghapus ${nama}?`)) {
      e.preventDefault();
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold text-center">Status</th>
            <th className="px-4 py-3 font-semibold text-right">
              <span>Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-teks-lembut">
                Belum ada produk yang cocok
              </td>
            </tr>
          ) : (
            daftarProduk.map((produk) => {
              const aktif = produk.is_active !== false;

              return (
                <tr
                  key={produk.id}
                  className={`border-t border-garis transition-colors ${
                    aktif ? "hover:bg-permukaan/40" : "bg-permukaan/20 opacity-75"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={produk.foto_url || "/icons/icon-192x192.png"}
                        alt=""
                        className="h-10 w-10 rounded-lg border border-garis object-cover bg-permukaan"
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-teks">{produk.nama}</span>
                        {!aktif && (
                          <span className="text-[11px] font-medium text-bahaya">
                            Disembunyikan dari katalog publik
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-teks-lembut">{produk.kategori || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-teks">
                    {formatRupiah(produk.harga)}
                  </td>

                  {/* US-32: Kolom & Tombol Toggle Status Aktif/Nonaktif */}
                  <td className="px-4 py-3 text-center">
                    <form action={toggleStatusProduk} className="inline-block">
                      <input type="hidden" name="id" value={produk.id} />
                      <input
                        type="hidden"
                        name="target_status"
                        value={aktif ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 ${
                          aktif
                            ? "bg-utama/15 text-utama hover:bg-utama/25"
                            : "border border-garis bg-permukaan text-teks-lembut hover:border-utama hover:text-utama"
                        }`}
                        title={
                          aktif
                            ? "Klik untuk menonaktifkan (sembunyikan dari katalog publik)"
                            : "Klik untuk mengaktifkan kembali di katalog"
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            aktif ? "bg-utama" : "bg-teks-lembut"
                          }`}
                        />
                        <span>{aktif ? "Aktif" : "Nonaktif"}</span>
                      </button>
                    </form>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Tombol
                        href={`/admin/produk/${produk.id}/ubah`}
                        varian="garis"
                        className="px-3 py-1.5 text-xs"
                      >
                        Ubah
                      </Tombol>
                      <form
                        action={hapusProduk}
                        onSubmit={(e) => handleHapus(e, produk.nama)}
                      >
                        <input type="hidden" name="id" value={produk.id} />
                        <Tombol
                          type="submit"
                          varian="bahaya"
                          className="px-3 py-1.5 text-xs"
                        >
                          Hapus
                        </Tombol>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";

export default function PemilihBandingkan({
  semuaProduk = [],
  id1 = "",
  id2 = "",
  adaKelebihan = false,
}) {
  const router = useRouter();

  const handleGanti = (slot, nilaiBaru) => {
    const target1 = slot === 1 ? nilaiBaru : id1;
    const target2 = slot === 2 ? nilaiBaru : id2;

    const params = new URLSearchParams();
    if (target1) params.set("id1", target1);
    if (target2) params.set("id2", target2);

    const query = params.toString();
    router.push(query ? `/bandingkan?${query}` : "/bandingkan");
  };

  const handleTukar = () => {
    if (!id1 && !id2) return;
    const params = new URLSearchParams();
    if (id2) params.set("id1", id2);
    if (id1) params.set("id2", id1);
    router.push(`/bandingkan?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-garis bg-permukaan p-5">
      {adaKelebihan && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-300">
          ⚠️ <strong>Batas Tercapai:</strong> Sistem hanya mendukung perbandingan maksimal 2 produk sekaligus. Pilihan berlebih telah diabaikan atau menggantikan pilihan sebelumnya.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[1fr_auto_1fr] md:items-end">
        {/* Dropdown Produk 1 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pilih-produk-1" className="text-xs font-bold text-teks">
            Produk Pertama:
          </label>
          <select
            id="pilih-produk-1"
            value={id1 || ""}
            onChange={(e) => handleGanti(1, e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          >
            <option value="">-- Pilih produk 1 --</option>
            {semuaProduk.map((p) => (
              <option key={p.id} value={p.id} disabled={String(p.id) === String(id2)}>
                {p.nama} ({p.kategori})
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Tukar */}
        <div className="flex justify-center pb-1">
          <button
            type="button"
            onClick={handleTukar}
            title="Tukar posisi perbandingan"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-garis bg-latar text-sm text-teks hover:border-utama hover:text-utama"
            aria-label="Tukar posisi perbandingan kedua produk"
          >
            ⇄
          </button>
        </div>

        {/* Dropdown Produk 2 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pilih-produk-2" className="text-xs font-bold text-teks">
            Produk Kedua:
          </label>
          <select
            id="pilih-produk-2"
            value={id2 || ""}
            onChange={(e) => handleGanti(2, e.target.value)}
            className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none"
          >
            <option value="">-- Pilih produk 2 --</option>
            {semuaProduk.map((p) => (
              <option key={p.id} value={p.id} disabled={String(p.id) === String(id1)}>
                {p.nama} ({p.kategori})
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


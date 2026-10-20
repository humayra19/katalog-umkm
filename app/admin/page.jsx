import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const { data: daftarProduk = [] } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  // US-30: Ringkasan statistik produk & kategori dari Supabase
  const totalProduk = daftarProduk.length;
  const hitunganKategori = {};
  daftarProduk.forEach((p) => {
    const k = p.kategori?.trim() || "Tanpa Kategori";
    hitunganKategori[k] = (hitunganKategori[k] || 0) + 1;
  });
  const daftarNamaKategori = Object.keys(hitunganKategori);

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      {/* US-30: Widget Ringkasan Statistik Toko */}
      <section
        aria-label="Ringkasan Statistik Toko"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Total Produk */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5">
          <span className="text-xs font-semibold text-teks-lembut">Total Produk</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teks">{totalProduk}</span>
            <span className="text-xs text-teks-lembut">item di katalog</span>
          </div>
        </div>

        {/* Total Kategori */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5">
          <span className="text-xs font-semibold text-teks-lembut">Kategori Aktif</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-utama">
              {daftarNamaKategori.length}
            </span>
            <span className="text-xs text-teks-lembut">kategori</span>
          </div>
        </div>

        {/* Rincian Produk per Kategori */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-latar p-5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teks-lembut">
              Jumlah Produk per Kategori
            </span>
            <Link
              href="/admin/kategori"
              className="text-xs font-semibold text-utama underline underline-offset-4 hover:text-utama-gelap"
            >
              Kelola Kategori →
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {daftarNamaKategori.length === 0 ? (
              <span className="text-xs text-teks-lembut">Belum ada produk</span>
            ) : (
              daftarNamaKategori.map((kat) => (
                <span
                  key={kat}
                  className="inline-flex items-center gap-1.5 rounded-full border border-garis bg-permukaan px-3 py-1 text-xs font-medium text-teks"
                >
                  <span>{kat}</span>
                  <span className="rounded-full bg-utama/10 px-1.5 py-0.2 font-bold text-utama">
                    {hitunganKategori[kat]}
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Header Tabel Produk */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Daftar Produk</h1>
          <p className="mt-0.5 text-xs text-teks-lembut">
            Kelola seluruh produk, ubah informasi, atau hapus item dari katalog.
          </p>
        </div>
        <Tombol href="/admin/produk/baru">+ Tambah produk</Tombol>
      </div>

      <TabelProduk daftarProduk={daftarProduk} />
    </div>
  );
}

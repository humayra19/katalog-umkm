import Link from "next/link";
import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createAdminClient } from "@/lib/supabase/admin";
import { apakahProdukAktif } from "@/lib/status-produk";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 10;

export default async function HalamanAdmin({ searchParams }) {
  const params = (await searchParams) || {};
  const kataKunci = (params.q || "").trim();
  const halaman = Math.max(1, parseInt(params.page, 10) || 1);

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  // 1. Ambil data ringkasan untuk statistik toko (US-30)
  const { data: semuaProdukRingkas = [] } = await supabase
    .from("produk")
    .select("kategori");

  const totalProdukSemua = semuaProdukRingkas.length;
  const hitunganKategori = {};
  semuaProdukRingkas.forEach((p) => {
    const k = p.kategori?.trim() || "Tanpa Kategori";
    hitunganKategori[k] = (hitunganKategori[k] || 0) + 1;
  });
  const daftarNamaKategori = Object.keys(hitunganKategori);

  // 2. Query produk dengan pencarian dan paginasi (US-33)
  let query = supabase.from("produk").select("*", { count: "exact" });

  if (kataKunci) {
    query = query.ilike("nama", `%${kataKunci}%`);
  }

  query = query.order("created_at", { ascending: false });

  const from = (halaman - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: daftarProduk = [], count: totalHitunganQuery = 0 } = await query;
  const totalItemDitemukan = totalHitunganQuery || 0;
  const totalHalaman = Math.max(1, Math.ceil(totalItemDitemukan / ITEMS_PER_PAGE));

  // US-32: Sematkan status aktif pada masing-masing produk
  const daftarProdukDenganStatus = daftarProduk.map((p) => ({
    ...p,
    is_active: apakahProdukAktif(p),
  }));

  // Helper untuk membuat link URL halaman
  function bikinUrlPaginasi(targetPage) {
    const p = new URLSearchParams();
    if (kataKunci) p.set("q", kataKunci);
    if (targetPage > 1) p.set("page", targetPage.toString());
    const qs = p.toString();
    return qs ? `/admin?${qs}` : "/admin";
  }

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
            <span className="text-3xl font-extrabold text-teks">
              {totalProdukSemua}
            </span>
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

      {/* Header Tabel Produk & Aksi Cepat */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Daftar Produk</h1>
          <p className="mt-0.5 text-xs text-teks-lembut">
            Kelola produk, atur status tampil, ubah data, atau ekspor ke CSV.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* US-35: Tombol Ekspor CSV */}
          <a
            href="/api/admin/ekspor-csv"
            download
            className="inline-flex items-center gap-1.5 rounded-lg border border-garis bg-latar px-3.5 py-2 text-xs font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
            title="Unduh seluruh data produk dalam format CSV"
          >
            <span>📥</span>
            <span>Ekspor CSV</span>
          </a>

          <Tombol href="/admin/produk/baru" className="px-3.5 py-2 text-xs">
            + Tambah produk
          </Tombol>
        </div>
      </div>

      {/* US-33: Form Pencarian di Admin */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-garis bg-permukaan p-3.5">
        <form method="GET" action="/admin" className="flex flex-1 flex-wrap items-center gap-2">
          <input
            type="search"
            name="q"
            defaultValue={kataKunci}
            placeholder="Cari nama produk di admin..."
            className="w-full sm:w-72 rounded-lg border border-garis bg-latar px-3 py-1.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center rounded-lg bg-utama px-4 py-1.5 text-xs font-semibold text-white hover:bg-utama-gelap"
          >
            Cari
          </button>
          {kataKunci && (
            <Link
              href="/admin"
              className="inline-flex items-center rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama"
            >
              Reset
            </Link>
          )}
        </form>

        <span className="text-xs text-teks-lembut">
          {totalItemDitemukan} produk ditemukan
        </span>
      </div>

      {/* Tabel Produk */}
      <TabelProduk daftarProduk={daftarProdukDenganStatus} />

      {/* US-33: Navigasi Paginasi Admin */}
      {totalHalaman > 1 && (
        <nav
          aria-label="Paginasi Daftar Produk Admin"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-garis pt-4 text-xs font-medium"
        >
          <span className="text-teks-lembut">
            Halaman <strong>{halaman}</strong> dari <strong>{totalHalaman}</strong>
          </span>

          <div className="flex items-center gap-2">
            {halaman > 1 ? (
              <Link
                href={bikinUrlPaginasi(halaman - 1)}
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama"
              >
                ← Sebelumnya
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-xs text-teks-lembut opacity-50">
                ← Sebelumnya
              </span>
            )}

            {halaman < totalHalaman ? (
              <Link
                href={bikinUrlPaginasi(halaman + 1)}
                className="rounded-lg border border-garis bg-latar px-3 py-1.5 text-xs font-semibold text-teks hover:border-utama hover:text-utama"
              >
                Selanjutnya →
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-3 py-1.5 text-xs text-teks-lembut opacity-50">
                Selanjutnya →
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

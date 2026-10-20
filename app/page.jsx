import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import TerakhirDilihat from "@/components/TerakhirDilihat";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";
import { apakahProdukAktif } from "@/lib/status-produk";

export const dynamic = "force-dynamic";

const ITEMS_PER_PAGE = 12;

export default async function HalamanKatalog({ searchParams }) {
  const params = (await searchParams) || {};
  const kategoriAktif = params.kategori || "";
  const kataKunci = params.cari || "";
  const urutanAktif = params.urutan || "terbaru";
  const halaman = Math.max(1, parseInt(params.halaman, 10) || 1);

  let daftarProduk = [];
  let daftarKategori = [];
  let totalProduk = 0;
  let totalHalaman = 1;
  let pesanError = null;

  try {
    const supabase = createServerClient();

    // Ambil daftar kategori unik dari tabel produk
    const { data: semuaKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (semuaKategori) {
      daftarKategori = [
        "Semua",
        ...Array.from(new Set(semuaKategori.map((p) => p.kategori).filter(Boolean))),
      ];
    }

    // Query produk dengan filter, pencarian, urutan, dan paginasi di database
    let query = supabase.from("produk").select("*", { count: "exact" });

    if (kategoriAktif && kategoriAktif !== "Semua") {
      query = query.eq("kategori", kategoriAktif);
    }

    if (kataKunci.trim()) {
      query = query.ilike("nama", `%${kataKunci.trim()}%`);
    }

    // Terapkan urutan pada query
    if (urutanAktif === "termurah") {
      query = query.order("harga", { ascending: true });
    } else if (urutanAktif === "termahal") {
      query = query.order("harga", { ascending: false });
    } else {
      // default: terbaru
      query = query.order("created_at", { ascending: false });
    }

    // Terapkan pembatasan halaman di query database (US-16)
    const from = (halaman - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      pesanError = error.message;
    } else {
      // US-32: Saring produk yang aktif saja untuk katalog publik
      daftarProduk = (data || []).filter(apakahProdukAktif);
      totalProduk = count || 0;
      totalHalaman = Math.max(1, Math.ceil(totalProduk / ITEMS_PER_PAGE));
    }
  } catch (err) {
    pesanError = err.message || "Gagal mengambil data produk dari database.";
  }

  // Fungsi pembantu membuat URL query
  function buildUrl({ newKat, newCari, newUrut, newHal }) {
    const p = new URLSearchParams();
    const kat = newKat !== undefined ? newKat : kategoriAktif;
    const c = newCari !== undefined ? newCari : kataKunci;
    const u = newUrut !== undefined ? newUrut : urutanAktif;
    const h = newHal !== undefined ? newHal : halaman;

    if (kat && kat !== "Semua") p.set("kategori", kat);
    if (c && c.trim()) p.set("cari", c.trim());
    if (u && u !== "terbaru") p.set("urutan", u);
    if (h && h > 1) p.set("halaman", h.toString());

    const qs = p.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian & Urutan (US-11 & US-15) */}
          <form method="GET" action="/" className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            {kategoriAktif && kategoriAktif !== "Semua" && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <input
              type="search"
              name="cari"
              defaultValue={kataKunci}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-56"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                name="urutan"
                defaultValue={urutanAktif}
                className="flex-1 rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks focus:border-utama focus:outline-none sm:flex-initial"
              >
                <option value="terbaru">Terbaru</option>
                <option value="termurah">Termurah</option>
                <option value="termahal">Termahal</option>
              </select>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
              >
                Terapkan
              </button>
              {(kataKunci || (kategoriAktif && kategoriAktif !== "Semua") || urutanAktif !== "terbaru") && (
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-4 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Filter Kategori (US-11) */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {daftarKategori.map((kategori) => {
              const isActive =
                (!kategoriAktif && kategori === "Semua") || kategoriAktif === kategori;

              return (
                <Link
                  key={kategori}
                  href={buildUrl({ newKat: kategori, newHal: 1 })}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-utama text-white"
                      : "border border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
                  }`}
                >
                  {kategori}
                </Link>
              );
            })}
          </div>
        )}

        {pesanError ? (
          <div className="rounded-xl border border-garis bg-permukaan p-6 text-center">
            <p className="font-semibold text-bahaya">Gagal memuat produk</p>
            <p className="mt-1 text-sm text-teks-lembut">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {daftarProduk.map((produk) => (
                <KartuProduk key={produk.id} produk={produk} />
              ))}
            </div>

            {/* Paginasi (US-16) */}
            {totalHalaman > 1 && (
              <nav aria-label="Navigasi halaman" className="flex items-center justify-center gap-2 pt-6">
                {halaman > 1 ? (
                  <Link
                    href={buildUrl({ newHal: halaman - 1 })}
                    className="rounded-lg border border-garis bg-latar px-4 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    Sebelumnya
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-4 py-2 text-sm font-semibold text-teks-lembut opacity-50">
                    Sebelumnya
                  </span>
                )}

                <span className="px-3 py-2 text-sm font-medium text-teks-lembut">
                  Halaman {halaman} dari {totalHalaman}
                </span>

                {halaman < totalHalaman ? (
                  <Link
                    href={buildUrl({ newHal: halaman + 1 })}
                    className="rounded-lg border border-garis bg-latar px-4 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                  >
                    Selanjutnya
                  </Link>
                ) : (
                  <span className="cursor-not-allowed rounded-lg border border-garis bg-permukaan px-4 py-2 text-sm font-semibold text-teks-lembut opacity-50">
                    Selanjutnya
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </section>

      {/* US-36: Bagian Terakhir Dilihat di Beranda */}
      <TerakhirDilihat />
    </>
  );
}

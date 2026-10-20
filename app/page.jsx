import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = (await searchParams) || {};
  const kategoriAktif = params.kategori || "";
  const kataKunci = params.cari || "";

  let daftarProduk = [];
  let daftarKategori = [];
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

    // Query produk dengan filter kategori dan pencarian nama
    let query = supabase.from("produk").select("*");

    if (kategoriAktif && kategoriAktif !== "Semua") {
      query = query.eq("kategori", kategoriAktif);
    }

    if (kataKunci.trim()) {
      query = query.ilike("nama", `%${kataKunci.trim()}%`);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      pesanError = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Gagal mengambil data produk dari database.";
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

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex gap-2">
            {kategoriAktif && kategoriAktif !== "Semua" && (
              <input type="hidden" name="kategori" value={kategoriAktif} />
            )}
            <input
              type="search"
              name="cari"
              defaultValue={kataKunci}
              placeholder="Cari nama produk..."
              className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:w-60"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
            >
              Cari
            </button>
            {(kataKunci || (kategoriAktif && kategoriAktif !== "Semua")) && (
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg border border-garis bg-latar px-3 py-2 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
              >
                Reset
              </Link>
            )}
          </form>
        </div>

        {/* Filter Kategori */}
        {daftarKategori.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {daftarKategori.map((kategori) => {
              const isActive =
                (!kategoriAktif && kategori === "Semua") || kategoriAktif === kategori;

              const href =
                kategori === "Semua"
                  ? kataKunci
                    ? `/?cari=${encodeURIComponent(kataKunci)}`
                    : "/"
                  : kataKunci
                  ? `/?kategori=${encodeURIComponent(kategori)}&cari=${encodeURIComponent(
                      kataKunci
                    )}`
                  : `/?kategori=${encodeURIComponent(kategori)}`;

              return (
                <Link
                  key={kategori}
                  href={href}
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

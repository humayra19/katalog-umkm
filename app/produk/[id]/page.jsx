import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import TombolBagikan from "@/components/TombolBagikan";
import TombolFavoritDetail from "@/components/TombolFavoritDetail";
import GaleriFoto from "@/components/GaleriFoto";
import KartuProduk from "@/components/KartuProduk";
import { createServerClient } from "@/lib/supabase/server";
import { cariProdukContoh } from "@/lib/data-contoh";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";

// US-26: generateMetadata untuk SEO dan Open Graph
export async function generateMetadata({ params }) {
  const { id } = await params;
  let produk = null;

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("produk")
      .select("nama, deskripsi, foto_url, harga, kategori")
      .eq("id", id)
      .single();
    produk = data;
  } catch {
    // Abaikan jika database error
  }

  if (!produk) {
    produk = cariProdukContoh(id);
  }

  if (!produk) {
    return {
      title: `Produk Tidak Ditemukan - ${toko.nama}`,
      description: "Produk yang Anda cari tidak tersedia di katalog.",
    };
  }

  const judul = `${produk.nama} | ${toko.nama}`;
  const deskripsi =
    produk.deskripsi ||
    `Pesan ${produk.nama} (${produk.kategori || "Produk"}) dengan harga terbaik di ${toko.nama}. Pesan mudah langsung via WhatsApp.`;
  const foto = produk.foto_url || "/icons/icon-512x512.png";

  return {
    title: judul,
    description: deskripsi,
    openGraph: {
      title: judul,
      description: deskripsi,
      images: [
        {
          url: foto,
          alt: produk.nama,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsi,
      images: [foto],
    },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;

  let produk = null;
  let produkTerkait = [];

  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from("produk")
      .select("*")
      .eq("id", id)
      .single();
    produk = data;

    // US-17: Ambil produk terkait dari kategori yang sama
    if (data?.kategori) {
      const { data: terkait } = await supabase
        .from("produk")
        .select("*")
        .eq("kategori", data.kategori)
        .neq("id", id)
        .limit(4);
      produkTerkait = terkait || [];
    }
  } catch {
    // Abaikan jika database error
  }

  if (!produk) {
    produk = cariProdukContoh(id);
  }

  if (!produk) {
    notFound();
  }

  // US-19: Cek status stok
  const isHabis =
    produk.stok === 0 ||
    produk.stok === "0" ||
    produk.status === "habis" ||
    produk.status_stok === "habis" ||
    produk.is_habis === true;

  // US-20: Cek diskon dan badge
  const adaDiskon = Boolean(
    produk.harga_diskon && Number(produk.harga_diskon) < Number(produk.harga)
  );
  const hargaTampil = adaDiskon ? produk.harga_diskon : produk.harga;
  const badge = isHabis
    ? "Habis"
    : produk.badge || (produk.is_terlaris ? "Terlaris" : produk.is_baru ? "Baru" : null);

  return (
    <div className="py-8 md:py-12">
      <article className="grid gap-8 md:grid-cols-2">
        {/* US-18: Komponen Galeri Foto */}
        <GaleriFoto
          fotoUrl={produk.foto_url}
          nama={produk.nama}
          fotoTambahan={produk.foto_urls || produk.foto_tambahan}
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
            >
              ← Kembali ke katalog
            </Link>

            <div className="flex items-center gap-2">
              {/* US-24: Tombol Simpan Favorit */}
              <TombolFavoritDetail produk={produk} />
              {/* US-23: Tombol Bagikan atau Salin Link */}
              <TombolBagikan
                judul={produk.nama}
                teks={`Beli ${produk.nama} di ${toko.nama}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-teks-lembut">{produk.kategori}</p>
            {badge && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${
                  badge === "Habis"
                    ? "bg-bahaya"
                    : badge === "Terlaris"
                    ? "bg-harga"
                    : "bg-utama"
                }`}
              >
                {badge}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-teks">
            {produk.nama}
          </h1>

          {/* US-20: Harga dengan diskon coret jika ada */}
          <div className="flex items-center gap-3">
            {adaDiskon && (
              <span className="text-base text-teks-lembut line-through">
                {formatRupiah(produk.harga)}
              </span>
            )}
            <p className="self-start rounded-md bg-harga-latar px-3 py-1 text-xl font-bold text-harga">
              {formatRupiah(hargaTampil)}
            </p>
          </div>

          <p className="max-w-prose leading-relaxed text-teks-lembut">{produk.deskripsi}</p>

          {/* US-12, US-19, US-21: Tombol WhatsApp & Tambah ke Keranjang */}
          <TombolWhatsApp produk={produk} stokHabis={isHabis} />
        </div>
      </article>

      {/* US-17: Produk Terkait */}
      {produkTerkait.length > 0 && (
        <section className="mt-16 border-t border-garis pt-10">
          <h2 className="text-xl font-bold text-teks">Produk terkait</h2>
          <p className="mt-1 text-sm text-teks-lembut">
            Produk lain dalam kategori {produk.kategori}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => (
              <KartuProduk key={item.id} produk={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

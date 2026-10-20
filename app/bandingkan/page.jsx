import Image from "next/image";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { produkContoh } from "@/lib/data-contoh";
import { apakahProdukAktif } from "@/lib/status-produk";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import PemilihBandingkan from "@/components/PemilihBandingkan";
import TombolWhatsApp from "@/components/TombolWhatsApp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: `Bandingkan Produk - ${toko.nama}`,
  description: `Bandingkan foto, kategori, harga, dan deskripsi produk di ${toko.nama} untuk menentukan pilihan terbaik Anda.`,
};

export default async function HalamanBandingkan({ searchParams }) {
  const params = (await searchParams) || {};

  // Deteksi jika pengguna mencoba membandingkan lebih dari 2 produk (US-37)
  const adaKelebihan = Boolean(
    params.id3 ||
      params.id4 ||
      (params.ids && params.ids.split(",").length > 2) ||
      (Array.isArray(params.id1) && params.id1.length > 1) ||
      (Array.isArray(params.id2) && params.id2.length > 1)
  );

  const rawId1 = Array.isArray(params.id1) ? params.id1[0] : params.id1;
  const rawId2 = Array.isArray(params.id2) ? params.id2[0] : params.id2;

  // 1. Ambil seluruh produk aktif dari Supabase atau fallback
  let semuaProduk = [];
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from("produk").select("*").order("nama");
    if (data && data.length > 0) {
      semuaProduk = data.filter(apakahProdukAktif);
    }
  } catch {
    // Fallback
  }

  if (semuaProduk.length === 0) {
    semuaProduk = produkContoh.filter(apakahProdukAktif);
  }

  // 2. Cari detail produk 1 & produk 2
  let produk1 = null;
  let produk1NotFound = false;
  if (rawId1) {
    produk1 = semuaProduk.find((p) => String(p.id) === String(rawId1));
    if (!produk1) produk1NotFound = true;
  }

  let produk2 = null;
  let produk2NotFound = false;
  if (rawId2) {
    produk2 = semuaProduk.find((p) => String(p.id) === String(rawId2));
    if (!produk2) produk2NotFound = true;
  }

  // Hitung selisih harga jika kedua produk terpilih
  let selisihHarga = 0;
  let produkLebihMurah = null;
  if (produk1 && produk2) {
    const harga1 = Number(produk1.harga_diskon || produk1.harga || 0);
    const harga2 = Number(produk2.harga_diskon || produk2.harga || 0);
    selisihHarga = Math.abs(harga1 - harga2);
    if (harga1 < harga2) produkLebihMurah = String(produk1.id);
    else if (harga2 < harga1) produkLebihMurah = String(produk2.id);
  }

  return (
    <div className="flex flex-col gap-8 py-8 md:py-12">
      {/* Header Halaman */}
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="self-start text-xs font-semibold text-teks-lembut hover:text-utama"
        >
          ← Kembali ke Beranda
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-teks">
          Bandingkan Produk
        </h1>
        <p className="text-sm text-teks-lembut">
          Pilih dua produk dari katalog untuk membandingkan spesifikasi, harga, foto, dan deskripsi secara berdampingan.
        </p>
      </div>

      {/* Komponen Pemilih 2 Produk */}
      <PemilihBandingkan
        semuaProduk={semuaProduk}
        id1={rawId1}
        id2={rawId2}
        adaKelebihan={adaKelebihan}
      />

      {/* Tampilan Perbandingan Berdampingan */}
      {(!rawId1 && !rawId2) ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-garis bg-permukaan p-12 text-center">
          <span className="text-5xl">⚖️</span>
          <h2 className="mt-4 text-lg font-bold text-teks">Belum Ada Produk Dipilih</h2>
          <p className="mt-1 max-w-md text-xs text-teks-lembut">
            Silakan pilih dua produk pada menu dropdown di atas untuk melihat perbandingan rincian kedua produk secara berdampingan.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Kolom Produk 1 */}
          <div className="flex flex-col">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-teks-lembut">
              Produk 1
            </h2>
            {produk1NotFound ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-bahaya/40 bg-bahaya/5 p-8 text-center">
                <span className="text-3xl text-bahaya">⚠️</span>
                <p className="mt-2 text-sm font-bold text-bahaya">Produk Tidak Ditemukan</p>
                <p className="mt-1 text-xs text-teks-lembut">
                  Produk dengan ID <code>{rawId1}</code> tidak ada atau telah dinonaktifkan dari katalog.
                </p>
              </div>
            ) : !produk1 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan p-8 text-center">
                <p className="text-xs text-teks-lembut">Pilih produk pertama di menu atas.</p>
              </div>
            ) : (
              <KartuBandingkan
                produk={produk1}
                adalahLebihMurah={produkLebihMurah === String(produk1.id)}
                selisihHarga={selisihHarga}
              />
            )}
          </div>

          {/* Kolom Produk 2 */}
          <div className="flex flex-col">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-teks-lembut">
              Produk 2
            </h2>
            {produk2NotFound ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-bahaya/40 bg-bahaya/5 p-8 text-center">
                <span className="text-3xl text-bahaya">⚠️</span>
                <p className="mt-2 text-sm font-bold text-bahaya">Produk Tidak Ditemukan</p>
                <p className="mt-1 text-xs text-teks-lembut">
                  Produk dengan ID <code>{rawId2}</code> tidak ada atau telah dinonaktifkan dari katalog.
                </p>
              </div>
            ) : !produk2 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan p-8 text-center">
                <p className="text-xs text-teks-lembut">Pilih produk kedua di menu atas.</p>
              </div>
            ) : (
              <KartuBandingkan
                produk={produk2}
                adalahLebihMurah={produkLebihMurah === String(produk2.id)}
                selisihHarga={selisihHarga}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KartuBandingkan({ produk, adalahLebihMurah, selisihHarga }) {
  const isHabis =
    produk.stok === 0 ||
    produk.stok === "0" ||
    produk.status === "habis" ||
    produk.status_stok === "habis" ||
    produk.is_habis === true;

  const adaDiskon = Boolean(
    produk.harga_diskon && Number(produk.harga_diskon) < Number(produk.harga)
  );
  const hargaTampil = adaDiskon ? produk.harga_diskon : produk.harga;

  return (
    <div className="flex flex-1 flex-col justify-between rounded-2xl border border-garis bg-latar p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col gap-4">
        {/* Foto Produk */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-garis bg-permukaan">
          <Image
            src={produk.foto_url || "/icons/icon-512x512.png"}
            alt={produk.nama}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {isHabis && (
            <span className="absolute top-3 right-3 rounded-md bg-bahaya px-2.5 py-1 text-xs font-bold text-white shadow-xs">
              Habis
            </span>
          )}
        </div>

        {/* Kategori & Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-utama/10 px-2.5 py-0.5 text-xs font-semibold text-utama">
            {produk.kategori || "Umum"}
          </span>
          <span className={`text-xs font-medium ${isHabis ? "text-bahaya" : "text-utama"}`}>
            {isHabis ? "Stok Habis" : "Tersedia"}
          </span>
        </div>

        {/* Nama Produk */}
        <Link
          href={`/produk/${produk.id}`}
          className="text-xl font-extrabold text-teks hover:text-utama"
        >
          {produk.nama}
        </Link>

        {/* Harga & Selisih */}
        <div className="flex flex-col gap-1 rounded-xl border border-garis bg-permukaan p-3.5">
          <span className="text-xs text-teks-lembut">Harga:</span>
          <div className="flex items-center gap-2">
            {adaDiskon && (
              <span className="text-xs text-teks-lembut line-through">
                {formatRupiah(produk.harga)}
              </span>
            )}
            <span className="text-xl font-black text-harga">
              {formatRupiah(hargaTampil)}
            </span>
          </div>

          {adalahLebihMurah && selisihHarga > 0 && (
            <span className="mt-1 text-xs font-bold text-utama">
              ✓ Lebih hemat {formatRupiah(selisihHarga)} dibanding produk pembanding
            </span>
          )}
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-teks">Deskripsi Produk:</span>
          <p className="whitespace-pre-line text-sm leading-relaxed text-teks-lembut">
            {produk.deskripsi || "Tidak ada deskripsi detail untuk produk ini."}
          </p>
        </div>
      </div>

      {/* Tombol Pesan & Aksi */}
      <div className="mt-6 border-t border-garis pt-4">
        <TombolWhatsApp produk={produk} stokHabis={isHabis} />
      </div>
    </div>
  );
}


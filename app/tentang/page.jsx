import Link from "next/link";
import { toko } from "@/lib/toko";

export const metadata = {
  title: `Tentang Kami | ${toko.nama}`,
  description: `Profil, alamat, jam operasional, dan kontak resmi ${toko.nama}.`,
};

export default function HalamanTentang() {
  const nomorClean = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    toko.alamat
  )}`;
  const waUrl = `https://wa.me/${nomorClean}?text=${encodeURIComponent(
    `Halo ${toko.nama}, saya ingin bertanya seputar produk dan toko.`
  )}`;

  return (
    <div className="py-8 md:py-12">
      {/* Navigasi Kembali */}
      <Link
        href="/"
        className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama"
      >
        ← Kembali ke katalog
      </Link>

      {/* Header Halaman */}
      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-teks md:text-4xl">
          Tentang {toko.nama}
        </h1>
        <p className="mt-2 text-lg text-teks-lembut">{toko.tagline}</p>
      </div>

      {/* Profil Singkat */}
      <div className="mt-8 rounded-2xl border border-garis bg-latar p-6 md:p-8">
        <h2 className="text-xl font-bold text-teks">Profil Toko</h2>
        <p className="mt-3 max-w-prose leading-relaxed text-teks-lembut">
          Selamat datang di <strong>{toko.nama}</strong>! Kami menghadirkan
          pilihan produk UMKM terbaik berkualitas dengan harga terjangkau.
          Setiap produk dipilih dengan cermat untuk memastikan kepuasan dan
          kenyamanan belanja Anda.
        </p>
        <p className="mt-3 max-w-prose leading-relaxed text-teks-lembut">
          Kami mengutamakan pelayanan yang ramah dan transaksi yang mudah serta
          cepat langsung melalui WhatsApp. Jelajahi katalog kami, pilih produk
          favorit Anda, dan pesan kapan saja.
        </p>
      </div>

      {/* Kartu Informasi Kontak, Jam Buka, & Alamat */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {/* Alamat */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-6">
          <div>
            <div className="text-2xl">📍</div>
            <h3 className="mt-3 text-lg font-bold text-teks">Alamat Toko</h3>
            <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
              {toko.alamat}
            </p>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-utama underline underline-offset-4 hover:text-utama-gelap"
          >
            Buka di Google Maps ↗
          </a>
        </div>

        {/* Jam Buka */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-6">
          <div>
            <div className="text-2xl">⏰</div>
            <h3 className="mt-3 text-lg font-bold text-teks">Jam Buka</h3>
            <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
              {toko.jamBuka}
            </p>
          </div>
          <div className="mt-6">
            <span className="inline-flex items-center rounded-full bg-utama/10 px-3 py-1 text-xs font-semibold text-utama">
              ● Siap Melayani
            </span>
          </div>
        </div>

        {/* Kontak WhatsApp */}
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-6">
          <div>
            <div className="text-2xl">💬</div>
            <h3 className="mt-3 text-lg font-bold text-teks">Kontak & Pesanan</h3>
            <p className="mt-2 text-sm leading-relaxed text-teks-lembut">
              Punya pertanyaan atau ingin memesan langsung? Hubungi kami via WhatsApp:
            </p>
            <p className="mt-1 font-mono text-sm font-bold text-teks">
              +{nomorClean}
            </p>
          </div>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-utama-gelap"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}


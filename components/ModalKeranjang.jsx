"use client";

import { useKeranjang } from "@/components/KeranjangContext";
import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";

export default function ModalKeranjang() {
  const {
    items,
    isBukaModal,
    setIsBukaModal,
    ubahJumlah,
    hapusItem,
    kosongkanKeranjang,
    totalHarga,
    totalItem,
  } = useKeranjang();

  if (!isBukaModal) return null;

  // Format pesan WhatsApp untuk seluruh isi keranjang
  const buatPesanWhatsApp = () => {
    const nomor = String(toko.nomorWhatsApp || "").replace(/\D/g, "");
    let teks = `Halo ${toko.nama}, saya ingin memesan:\n`;

    items.forEach((item, index) => {
      const varianText = item.varian && item.varian !== "Standar" ? ` (${item.varian})` : "";
      const subtotal = item.harga * item.jumlah;
      teks += `${index + 1}. ${item.nama}${varianText} x ${item.jumlah} = ${formatRupiah(subtotal)}\n`;
    });

    teks += `\nTotal: ${formatRupiah(totalHarga)}\nMohon konfirmasi ketersediaan pesanan ini. Terima kasih!`;
    return `https://wa.me/${nomor}?text=${encodeURIComponent(teks)}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-garis bg-latar shadow-2xl">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-garis px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-teks">Keranjang Belanja</h2>
            <span className="rounded-full bg-utama/10 px-2 py-0.5 text-xs font-semibold text-utama">
              {totalItem} item
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsBukaModal(false)}
            className="rounded-lg p-1 text-teks-lembut hover:bg-permukaan hover:text-teks"
            aria-label="Tutup keranjang"
          >
            ✕
          </button>
        </div>

        {/* Daftar Item */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="py-12 text-center text-teks-lembut">
              <p className="text-base font-semibold">Keranjang masih kosong</p>
              <p className="mt-1 text-xs">Pilih produk dan tambahkan ke keranjang untuk memesan.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-garis">
              {items.map((item) => (
                <div key={`${item.id}-${item.varian}`} className="flex items-center gap-3 py-3">
                  {item.foto_url && (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="h-14 w-14 rounded-lg border border-garis object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-teks">{item.nama}</p>
                    {item.varian && item.varian !== "Standar" && (
                      <p className="text-xs text-teks-lembut">Varian: {item.varian}</p>
                    )}
                    <p className="text-xs font-bold text-harga">{formatRupiah(item.harga)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-garis bg-latar">
                      <button
                        type="button"
                        onClick={() => ubahJumlah(item.id, item.varian, item.jumlah - 1)}
                        className="px-2 py-0.5 text-sm font-bold text-teks-lembut hover:text-utama"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold">{item.jumlah}</span>
                      <button
                        type="button"
                        onClick={() => ubahJumlah(item.id, item.varian, item.jumlah + 1)}
                        className="px-2 py-0.5 text-sm font-bold text-teks-lembut hover:text-utama"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => hapusItem(item.id, item.varian)}
                      className="text-xs text-bahaya hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        {items.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-garis bg-permukaan p-5">
            <div className="flex items-center justify-between text-base">
              <span className="font-semibold text-teks">Total Belanja:</span>
              <span className="font-extrabold text-harga">{formatRupiah(totalHarga)}</span>
            </div>
            <a
              href={buatPesanWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap"
            >
              Pesan Semua via WhatsApp
            </a>
            <button
              type="button"
              onClick={kosongkanKeranjang}
              className="text-center text-xs text-teks-lembut hover:text-bahaya hover:underline"
            >
              Kosongkan keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


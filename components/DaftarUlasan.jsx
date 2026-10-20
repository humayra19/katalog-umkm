import FormUlasan from "@/components/FormUlasan";

export default function DaftarUlasan({
  produkId,
  daftarUlasan = [],
  totalUlasan = 0,
  rataRata = 0,
}) {
  return (
    <section aria-labelledby="judul-ulasan" className="mt-14 border-t border-garis pt-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="judul-ulasan" className="text-xl font-bold text-teks">
            Ulasan & Penilaian Pembeli
          </h2>
          <p className="mt-0.5 text-xs text-teks-lembut">
            Ulasan murni dari pembeli yang telah memesan produk ini
          </p>
        </div>

        {totalUlasan > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-garis bg-permukaan px-3.5 py-1.5 self-start sm:self-auto">
            <span className="text-xl text-amber-500 leading-none">★</span>
            <span className="text-base font-extrabold text-teks">{rataRata}</span>
            <span className="text-xs text-teks-lembut">/ 5.0 ({totalUlasan} ulasan)</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Kolom Kiri: Form Kirim Ulasan */}
        <div className="lg:col-span-1">
          <FormUlasan produkId={produkId} />
        </div>

        {/* Kolom Kanan: Daftar Ulasan yang sudah ada */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {totalUlasan === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan p-8 text-center">
              <span className="text-3xl text-teks-lembut">💬</span>
              <p className="mt-2 text-sm font-semibold text-teks">
                Belum ada ulasan untuk produk ini
              </p>
              <p className="mt-1 text-xs text-teks-lembut">
                Jadilah yang pertama memberikan ulasan dan rating pada form di samping!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {daftarUlasan.map((u) => {
                const tanggal = u.created_at
                  ? new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "Baru saja";

                return (
                  <div
                    key={u.id}
                    className="flex flex-col gap-2 rounded-2xl border border-garis bg-latar p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-utama/15 text-xs font-bold text-utama">
                          {u.nama ? u.nama.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="text-sm font-semibold text-teks">{u.nama}</span>
                      </div>
                      <span className="text-xs text-teks-lembut">{tanggal}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {"★".repeat(u.rating || 5)}
                      <span className="text-garis">
                        {"★".repeat(Math.max(0, 5 - (u.rating || 5)))}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed text-teks-lembut">
                      {u.komentar}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}


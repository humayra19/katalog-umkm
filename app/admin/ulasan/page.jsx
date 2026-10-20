import Link from "next/link";
import { redirect } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import AksiModerasiUlasan from "@/components/AksiModerasiUlasan";
import { createAdminClient } from "@/lib/supabase/admin";
import { ambilSemuaUlasanAdmin } from "@/lib/ulasan";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Moderasi Ulasan - Admin Katalog UMKM",
  description: "Kelola, sembunyikan, atau hapus ulasan pembeli toko.",
};

export default async function HalamanAdminUlasan() {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const daftarUlasan = await ambilSemuaUlasanAdmin();

  const totalSemua = daftarUlasan.length;
  const totalAktif = daftarUlasan.filter((u) => !u.is_hidden).length;
  const totalSembunyi = totalSemua - totalAktif;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />

      {/* Header Moderasi */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-teks">Moderasi Ulasan Pembeli</h1>
        <p className="text-xs text-teks-lembut">
          Tinjau ulasan dan penilaian dari pembeli. Anda dapat menyembunyikan ulasan yang tidak pantas atau menghapusnya secara permanen.
        </p>
      </div>

      {/* Statistik Ringkas Ulasan */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5">
          <span className="text-xs font-semibold text-teks-lembut">Total Ulasan Masuk</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teks">{totalSemua}</span>
            <span className="text-xs text-teks-lembut">ulasan</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5">
          <span className="text-xs font-semibold text-teks-lembut">Ulasan Aktif (Tampil)</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-utama">{totalAktif}</span>
            <span className="text-xs text-teks-lembut">tampil di publik</span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-garis bg-permukaan p-5">
          <span className="text-xs font-semibold text-teks-lembut">Ulasan Disembunyikan</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-bahaya">{totalSembunyi}</span>
            <span className="text-xs text-teks-lembut">disembunyikan</span>
          </div>
        </div>
      </section>

      {/* Daftar Ulasan */}
      {daftarUlasan.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-garis bg-permukaan p-12 text-center">
          <span className="text-4xl">💬</span>
          <h2 className="mt-3 text-base font-bold text-teks">Belum Ada Ulasan</h2>
          <p className="mt-1 text-xs text-teks-lembut">
            Belum ada ulasan yang dikirimkan oleh pembeli pada produk Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-garis bg-latar">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-garis bg-permukaan text-teks-lembut">
              <tr>
                <th className="px-4 py-3 font-semibold">Pengulas</th>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Rating</th>
                <th className="px-4 py-3 font-semibold">Komentar</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-garis">
              {daftarUlasan.map((u) => {
                const isHidden = Boolean(u.is_hidden);
                const tanggal = u.created_at
                  ? new Date(u.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-";

                const produkNama = u.produk?.nama || `Produk #${u.produk_id}`;
                const produkHref = u.produk_id ? `/produk/${u.produk_id}` : "#";

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-permukaan/50 ${
                      isHidden ? "bg-garis/10 opacity-75" : ""
                    }`}
                  >
                    <td className="px-4 py-3.5 font-semibold text-teks">
                      {u.nama}
                    </td>

                    <td className="px-4 py-3.5">
                      <Link
                        href={produkHref}
                        className="font-medium text-teks hover:text-utama hover:underline line-clamp-1 max-w-[180px]"
                        title={produkNama}
                      >
                        {produkNama}
                      </Link>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-amber-500">
                        {"★".repeat(u.rating || 5)}
                      </span>
                      <span className="text-garis">
                        {"★".repeat(Math.max(0, 5 - (u.rating || 5)))}
                      </span>
                      <span className="ml-1 text-teks-lembut font-normal">
                        ({u.rating})
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-teks max-w-xs break-words">
                      {u.komentar}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap text-teks-lembut">
                      {tanggal}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {isHidden ? (
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                          Disembunyikan
                        </span>
                      ) : (
                        <span className="rounded-full bg-utama/15 px-2.5 py-0.5 text-[11px] font-semibold text-utama">
                          Tampil
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <AksiModerasiUlasan ulasan={u} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


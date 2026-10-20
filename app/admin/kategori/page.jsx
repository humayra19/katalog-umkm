import NavAdmin from "@/components/NavAdmin";
import KelolaKategoriList from "@/components/KelolaKategoriList";
import { createAdminClient } from "@/lib/supabase/admin";
import { ambilDaftarKategori } from "@/lib/kategori";

export const dynamic = "force-dynamic";

export default async function HalamanKelolaKategori() {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const daftarKategori = await ambilDaftarKategori();

  // Ambil hitungan produk per kategori dari database Supabase
  const { data: daftarProduk = [] } = await supabase
    .from("produk")
    .select("kategori");

  const hitunganProduk = {};
  daftarProduk.forEach((p) => {
    const k = p.kategori?.trim();
    if (k) {
      hitunganProduk[k] = (hitunganProduk[k] || 0) + 1;
    }
  });

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-teks">Kelola Kategori</h1>
          <p className="mt-1 text-sm text-teks-lembut">
            Tambah, perbarui, atau hapus kategori untuk mengelompokkan produk Anda.
          </p>
        </div>
      </div>

      <KelolaKategoriList
        daftarKategori={daftarKategori}
        hitunganProduk={hitunganProduk}
      />
    </div>
  );
}


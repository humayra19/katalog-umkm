import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";
import { ambilDaftarKategori } from "@/lib/kategori";

export const dynamic = "force-dynamic";

export default async function HalamanTambahProduk() {
  const geminiTersedia = Boolean(process.env.GEMINI_API_KEY?.trim());
  const daftarKategori = await ambilDaftarKategori();

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold text-teks">Tambah produk</h1>
      <FormProduk
        action={tambahProduk}
        labelTombol="Simpan produk"
        geminiTersedia={geminiTersedia}
        daftarKategori={daftarKategori}
      />
    </div>
  );
}

import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default function HalamanTambahProduk() {
  const geminiTersedia = Boolean(process.env.GEMINI_API_KEY?.trim());

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk
        action={tambahProduk}
        labelTombol="Simpan produk"
        geminiTersedia={geminiTersedia}
      />
    </div>
  );
}

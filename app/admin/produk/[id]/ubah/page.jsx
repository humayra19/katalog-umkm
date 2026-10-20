import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { createAdminClient } from "@/lib/supabase/admin";
import { ubahProduk } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function HalamanUbahProduk({ params }) {
  const { id } = await params;
  const supabase = await createAdminClient();
  const geminiTersedia = Boolean(process.env.GEMINI_API_KEY?.trim());

  const { data: produk } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .single();

  if (!produk) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        action={ubahProduk}
        labelTombol="Simpan perubahan"
        geminiTersedia={geminiTersedia}
      />
    </div>
  );
}

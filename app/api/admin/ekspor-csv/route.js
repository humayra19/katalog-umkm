import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { apakahProdukAktif } from "@/lib/status-produk";

export const dynamic = "force-dynamic";

function escapeCSV(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new NextResponse("Unauthorized: Anda harus login sebagai admin.", {
      status: 401,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Ambil semua produk dari database
  const { data: produk = [], error: dbError } = await supabase
    .from("produk")
    .select("*")
    .order("id", { ascending: true });

  if (dbError) {
    return new NextResponse(`Gagal mengambil data produk: ${dbError.message}`, {
      status: 500,
    });
  }

  // Susun header dan baris CSV
  const headers = [
    "ID",
    "Nama Produk",
    "Harga (Rp)",
    "Kategori",
    "Status",
    "URL Foto",
    "Deskripsi",
    "Tanggal Dibuat",
  ];

  const rows = produk.map((p) => {
    const status = apakahProdukAktif(p) ? "Aktif" : "Nonaktif";
    return [
      p.id,
      escapeCSV(p.nama),
      p.harga,
      escapeCSV(p.kategori || ""),
      escapeCSV(status),
      escapeCSV(p.foto_url || ""),
      escapeCSV(p.deskripsi || ""),
      escapeCSV(p.created_at || ""),
    ].join(",");
  });

  // Tambahkan BOM (\uFEFF) agar Microsoft Excel membuka karakter UTF-8 dengan benar
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");

  const tanggal = new Date().toISOString().slice(0, 10);
  const filename = `katalog-produk-${tanggal}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}


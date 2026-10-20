import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

const FILE_PATH = path.join(process.cwd(), "lib", "produk-nonaktif.json");

export function ambilDaftarIdNonaktif() {
  try {
    if (fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((id) => String(id));
      }
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return [];
}

function simpanDaftarIdNonaktif(daftar) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export function apakahProdukAktif(produk) {
  if (!produk) return false;

  // Cek apakah kolom is_active tersedia pada objek produk
  if (produk.is_active !== undefined && produk.is_active !== null) {
    return Boolean(produk.is_active);
  }

  // Fallback ke penyimpanan ID nonaktif
  const nonaktif = ambilDaftarIdNonaktif();
  return !nonaktif.includes(String(produk.id));
}

export async function setStatusProduk(id, aktifkan) {
  const targetId = String(id);
  const statusBool = Boolean(aktifkan);

  // 1. Coba update ke Supabase jika kolom is_active tersedia
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("produk")
      .update({ is_active: statusBool })
      .eq("id", id);

    if (error && !error.message.includes("is_active")) {
      console.warn("Update is_active di Supabase gagal:", error.message);
    }
  } catch (err) {
    console.warn("Koneksi Supabase error saat update is_active:", err.message);
  }

  // 2. Simpan juga ke file fallback lokal
  const daftarNonaktif = ambilDaftarIdNonaktif();
  let baru;

  if (statusBool) {
    // Jika diaktifkan, hapus dari daftar nonaktif
    baru = daftarNonaktif.filter((item) => item !== targetId);
  } else {
    // Jika dinonaktifkan, tambahkan ke daftar nonaktif
    baru = Array.from(new Set([...daftarNonaktif, targetId]));
  }

  simpanDaftarIdNonaktif(baru);
  return statusBool;
}


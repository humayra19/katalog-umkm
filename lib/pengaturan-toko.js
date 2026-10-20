import fs from "fs";
import path from "path";
import { toko as tokoBawaan } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const PENGATURAN_FILE = path.join(process.cwd(), "lib", "pengaturan.json");

function bacaPengaturanFile() {
  try {
    if (fs.existsSync(PENGATURAN_FILE)) {
      const data = fs.readFileSync(PENGATURAN_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object") {
        return { ...tokoBawaan, ...parsed };
      }
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return { ...tokoBawaan };
}

function simpanPengaturanFile(data) {
  try {
    fs.writeFileSync(PENGATURAN_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export function bersihkanNomorWhatsApp(rawNomor) {
  if (!rawNomor) return "";
  let clean = String(rawNomor).replace(/\D/g, "");
  if (clean.startsWith("0")) {
    clean = "62" + clean.slice(1);
  }
  return clean;
}

export async function ambilPengaturanToko() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("pengaturan")
      .select("*")
      .eq("kunci", "toko")
      .maybeSingle();

    if (!error && data && data.nilai) {
      const nilai = typeof data.nilai === "string" ? JSON.parse(data.nilai) : data.nilai;
      return {
        ...tokoBawaan,
        ...nilai,
      };
    }
  } catch {
    // Fallback
  }

  return bacaPengaturanFile();
}

export async function simpanPengaturanToko({
  nama,
  tagline,
  nomorWhatsApp,
  alamat,
  jamBuka,
}) {
  const nomorBersih = bersihkanNomorWhatsApp(nomorWhatsApp);
  if (!nomorBersih || nomorBersih.length < 9) {
    throw new Error(
      "Nomor WhatsApp tidak valid. Masukkan nomor telepon aktif (minimal 9 digit angka)."
    );
  }

  const payload = {
    nama: (nama || tokoBawaan.nama).trim(),
    tagline: (tagline || tokoBawaan.tagline).trim(),
    nomorWhatsApp: nomorBersih,
    alamat: (alamat || tokoBawaan.alamat).trim(),
    jamBuka: (jamBuka || tokoBawaan.jamBuka).trim(),
  };

  // 1. Coba simpan ke Supabase tabel pengaturan
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("pengaturan").upsert(
      {
        kunci: "toko",
        nilai: payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "kunci" }
    );
    if (!error) {
      simpanPengaturanFile(payload);
      return payload;
    }
  } catch {
    // Fallback
  }

  // 2. Simpan ke file lokal fallback
  simpanPengaturanFile(payload);
  return payload;
}


import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const LOG_FILE = path.join(process.cwd(), "lib", "log-aktivitas.json");

function bacaLogFile() {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const data = fs.readFileSync(LOG_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return [];
}

function simpanLogFile(daftar) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export async function catatLogAktivitas({ user_email, aksi, detail, produk_id = null }) {
  const itemBaru = {
    id: Date.now() + Math.random(),
    user_email: user_email || "admin@toko.local",
    aksi: aksi || "AKSI_ADMIN",
    detail: detail || "-",
    produk_id: produk_id ? Number(produk_id) || produk_id : null,
    created_at: new Date().toISOString(),
  };

  // 1. Coba catat ke Supabase
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("log_aktivitas").insert([
      {
        user_email: itemBaru.user_email,
        aksi: itemBaru.aksi,
        detail: itemBaru.detail,
        produk_id: itemBaru.produk_id,
        created_at: itemBaru.created_at,
      },
    ]);
    if (!error) return;
  } catch {
    // Fallback
  }

  // 2. Simpan ke file lokal fallback
  const semua = bacaLogFile();
  semua.unshift(itemBaru);
  // Simpan maksimal 200 baris riwayat di lokal
  simpanLogFile(semua.slice(0, 200));
}

export async function ambilLogAktivitas(limit = 50) {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("log_aktivitas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  const list = bacaLogFile();
  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return list.slice(0, limit);
}


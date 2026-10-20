import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const KLIK_FILE = path.join(process.cwd(), "lib", "klik-wa.json");

function bacaKlikFile() {
  try {
    if (fs.existsSync(KLIK_FILE)) {
      const data = fs.readFileSync(KLIK_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return [];
}

function simpanKlikFile(daftar) {
  try {
    fs.writeFileSync(KLIK_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export async function catatKlikWa(produkId) {
  if (!produkId) return;

  const pId = Number(produkId) || produkId;
  const sekarang = new Date().toISOString();

  // 1. Coba simpan ke Supabase jika tabel klik_wa tersedia
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("klik_wa").insert([
      {
        produk_id: pId,
        created_at: sekarang,
      },
    ]);

    if (!error) {
      return;
    }
  } catch {
    // Fallback jika tabel belum dibuat di Supabase
  }

  // 2. Simpan ke file lokal fallback
  const semua = bacaKlikFile();
  semua.push({
    id: Date.now() + Math.random(),
    produk_id: pId,
    created_at: sekarang,
  });
  simpanKlikFile(semua);
}

export async function ambilProdukTerlaris(limit = 5) {
  const hitunganPerProduk = {};

  // 1. Coba ambil dari Supabase
  try {
    const supabase = await createAdminClient();
    const { data: klikData, error } = await supabase
      .from("klik_wa")
      .select("produk_id");

    if (!error && Array.isArray(klikData)) {
      klikData.forEach((row) => {
        const id = String(row.produk_id);
        if (id) {
          hitunganPerProduk[id] = (hitunganPerProduk[id] || 0) + 1;
        }
      });
    }
  } catch {
    // Fallback
  }

  // 2. Tambahkan/merge data dari file lokal jika Supabase kosong
  if (Object.keys(hitunganPerProduk).length === 0) {
    const fileKlik = bacaKlikFile();
    fileKlik.forEach((row) => {
      const id = String(row.produk_id);
      if (id) {
        hitunganPerProduk[id] = (hitunganPerProduk[id] || 0) + 1;
      }
    });
  }

  const entries = Object.entries(hitunganPerProduk);
  if (entries.length === 0) {
    return [];
  }

  // Urutkan berdasarkan jumlah klik terbanyak
  entries.sort((a, b) => b[1] - a[1]);
  const topList = entries.slice(0, limit);

  // Ambil detail produk dari Supabase untuk top IDs
  const targetIds = topList.map(([id]) => id);
  let daftarInfo = [];

  try {
    const supabase = await createAdminClient();
    const { data: detailProduk } = await supabase
      .from("produk")
      .select("id, nama, harga, kategori, foto_url")
      .in("id", targetIds);

    if (detailProduk) {
      daftarInfo = detailProduk;
    }
  } catch {
    // Fallback
  }

  return topList.map(([id, totalKlik]) => {
    const detail = daftarInfo.find((p) => String(p.id) === String(id));
    return {
      id,
      totalKlik,
      nama: detail?.nama || `Produk #${id}`,
      harga: detail?.harga || 0,
      kategori: detail?.kategori || "Umum",
      foto_url: detail?.foto_url || "/icons/icon-192x192.png",
    };
  });
}


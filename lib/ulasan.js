import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ULASAN_FILE = path.join(process.cwd(), "lib", "ulasan.json");

function bacaUlasanFile() {
  try {
    if (fs.existsSync(ULASAN_FILE)) {
      const data = fs.readFileSync(ULASAN_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return [];
}

function simpanUlasanFile(daftar) {
  try {
    fs.writeFileSync(ULASAN_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export async function ambilUlasanProduk(produkId, hanyaPublik = true) {
  const pIdStr = String(produkId);

  // 1. Coba baca dari Supabase
  try {
    const supabase = createServerClient();
    let query = supabase
      .from("ulasan")
      .select("*")
      .eq("produk_id", produkId)
      .order("created_at", { ascending: false });

    if (hanyaPublik) {
      query = query.neq("is_hidden", true);
    }

    const { data, error } = await query;
    if (!error && data) {
      const rataRata =
        data.length > 0
          ? Number(
              (
                data.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
                data.length
              ).toFixed(1)
            )
          : 0;

      return {
        daftarUlasan: data,
        totalUlasan: data.length,
        rataRata,
      };
    }
  } catch {
    // Fallback ke penyimpanan file jika Supabase table belum ada
  }

  // 2. Fallback ke file JSON lokal
  const semua = bacaUlasanFile();
  let filtered = semua.filter((u) => String(u.produk_id) === pIdStr);

  if (hanyaPublik) {
    filtered = filtered.filter((u) => !u.is_hidden);
  }

  filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalUlasan = filtered.length;
  const rataRata =
    totalUlasan > 0
      ? Number(
          (
            filtered.reduce((acc, curr) => acc + (Number(curr.rating) || 0), 0) /
            totalUlasan
          ).toFixed(1)
        )
      : 0;

  return {
    daftarUlasan: filtered,
    totalUlasan,
    rataRata,
  };
}

export async function ambilSemuaUlasanAdmin() {
  let list = [];

  // Coba ambil dari Supabase dengan relasi produk jika tersedia
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("ulasan")
      .select("*, produk:produk_id(id, nama, foto_url)")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      list = data;
    }
  } catch {
    // Fallback
  }

  // Fallback ke file lokal jika data belum ada di Supabase
  if (list.length === 0) {
    const fileUlasan = bacaUlasanFile();
    fileUlasan.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    list = fileUlasan;
  }

  // Lengkapi nama produk jika belum terisi dari join
  let daftarProduk = [];
  try {
    const supabase = await createAdminClient();
    const { data } = await supabase.from("produk").select("id, nama, foto_url");
    if (data) daftarProduk = data;
  } catch {
    // Fallback
  }

  return list.map((u) => {
    let produk = u.produk;
    if (!produk) {
      const match = daftarProduk.find((p) => String(p.id) === String(u.produk_id));
      produk = match || { id: u.produk_id, nama: `Produk #${u.produk_id}` };
    }
    return {
      ...u,
      produk,
    };
  });
}

export async function simpanUlasanBaru({ produk_id, nama, rating, komentar }) {
  const pId = Number(produk_id) || produk_id;
  const itemBaru = {
    id: Date.now(),
    produk_id: pId,
    nama: nama.trim(),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    komentar: komentar.trim(),
    is_hidden: false,
    created_at: new Date().toISOString(),
  };

  // Coba simpan ke Supabase
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase.from("ulasan").insert([
      {
        produk_id: itemBaru.produk_id,
        nama: itemBaru.nama,
        rating: itemBaru.rating,
        komentar: itemBaru.komentar,
        is_hidden: false,
      },
    ]);

    if (!error) {
      return;
    }
  } catch {
    // Fallback
  }

  // Simpan ke file lokal
  const semua = bacaUlasanFile();
  semua.unshift(itemBaru);
  simpanUlasanFile(semua);
}

export async function toggleHiddenUlasan(id, targetHidden) {
  const targetBool = Boolean(targetHidden);

  try {
    const supabase = await createAdminClient();
    await supabase
      .from("ulasan")
      .update({ is_hidden: targetBool })
      .eq("id", id);
  } catch {
    // Fallback
  }

  const semua = bacaUlasanFile();
  const baru = semua.map((item) =>
    String(item.id) === String(id) ? { ...item, is_hidden: targetBool } : item
  );
  simpanUlasanFile(baru);
}

export async function hapusUlasanDb(id) {
  try {
    const supabase = await createAdminClient();
    await supabase.from("ulasan").delete().eq("id", id);
  } catch {
    // Fallback
  }

  const semua = bacaUlasanFile();
  const baru = semua.filter((item) => String(item.id) !== String(id));
  simpanUlasanFile(baru);
}

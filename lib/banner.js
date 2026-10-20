import fs from "fs";
import path from "path";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BANNER_FILE = path.join(process.cwd(), "lib", "banner.json");

function bacaBannerFile() {
  try {
    if (fs.existsSync(BANNER_FILE)) {
      const data = fs.readFileSync(BANNER_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return [];
}

function simpanBannerFile(daftar) {
  try {
    fs.writeFileSync(BANNER_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export async function ambilBannerAktif() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  const list = bacaBannerFile();
  return list.filter((b) => b.is_active === true);
}

export async function ambilSemuaBanner() {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("banner")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  const list = bacaBannerFile();
  list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return list;
}

export async function simpanBannerBaru({ judul, teks, gambar_url, tautan, is_active = true }) {
  const itemBaru = {
    id: Date.now(),
    judul: judul?.trim() || "",
    teks: teks?.trim() || "",
    gambar_url: gambar_url?.trim() || "",
    tautan: tautan?.trim() || "/",
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
  };

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("banner").insert([
      {
        judul: itemBaru.judul,
        teks: itemBaru.teks,
        gambar_url: itemBaru.gambar_url,
        tautan: itemBaru.tautan,
        is_active: itemBaru.is_active,
      },
    ]);
    if (!error) return;
  } catch {
    // Fallback
  }

  const semua = bacaBannerFile();
  semua.unshift(itemBaru);
  simpanBannerFile(semua);
}

export async function perbaruiBanner(id, { judul, teks, gambar_url, tautan, is_active }) {
  const payload = {
    judul: judul?.trim() || "",
    teks: teks?.trim() || "",
    gambar_url: gambar_url?.trim() || "",
    tautan: tautan?.trim() || "/",
    is_active: Boolean(is_active),
  };

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("banner")
      .update(payload)
      .eq("id", id);
    if (!error) return;
  } catch {
    // Fallback
  }

  const semua = bacaBannerFile();
  const baru = semua.map((b) => (String(b.id) === String(id) ? { ...b, ...payload } : b));
  simpanBannerFile(baru);
}

export async function toggleStatusBanner(id, targetActive) {
  const activeBool = Boolean(targetActive);

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("banner")
      .update({ is_active: activeBool })
      .eq("id", id);
    if (!error) return;
  } catch {
    // Fallback
  }

  const semua = bacaBannerFile();
  const baru = semua.map((b) => (String(b.id) === String(id) ? { ...b, is_active: activeBool } : b));
  simpanBannerFile(baru);
}

export async function hapusBanner(id) {
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("banner").delete().eq("id", id);
    if (!error) return;
  } catch {
    // Fallback
  }

  const semua = bacaBannerFile();
  const baru = semua.filter((b) => String(b.id) !== String(id));
  simpanBannerFile(baru);
}


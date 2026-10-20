import fs from "fs";
import path from "path";
import { createAdminClient } from "@/lib/supabase/admin";

const KATEGORI_FILE = path.join(process.cwd(), "lib", "kategori.json");
const DEFAULT_KATEGORI = [
  "Minuman",
  "Camilan",
  "Bumbu",
  "Kue kering",
  "Kerajinan",
  "Kain",
];

function bacaKategoriDariFile() {
  try {
    if (fs.existsSync(KATEGORI_FILE)) {
      const data = fs.readFileSync(KATEGORI_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Abaikan jika error membaca file
  }
  return DEFAULT_KATEGORI;
}

function simpanKategoriKeFile(daftar) {
  try {
    fs.writeFileSync(KATEGORI_FILE, JSON.stringify(daftar, null, 2), "utf-8");
  } catch {
    // Abaikan jika error menulis file
  }
}

export async function ambilDaftarKategori() {
  const fileKategori = bacaKategoriDariFile();

  try {
    const supabase = await createAdminClient();
    const { data: produkKategori } = await supabase
      .from("produk")
      .select("kategori");

    if (produkKategori) {
      const dariProduk = produkKategori
        .map((p) => p.kategori?.trim())
        .filter(Boolean);
      const gabungan = Array.from(new Set([...fileKategori, ...dariProduk]));
      return gabungan;
    }
  } catch {
    // Fallback ke file lokal jika database offline
  }

  return fileKategori;
}

export async function simpanKategoriBaru(nama) {
  const bersih = nama?.trim();
  if (!bersih) {
    throw new Error("Nama kategori tidak boleh kosong.");
  }

  const list = await ambilDaftarKategori();
  const ada = list.some((k) => k.toLowerCase() === bersih.toLowerCase());
  if (ada) {
    throw new Error(`Kategori "${bersih}" sudah ada.`);
  }

  const listBaru = [...list, bersih];
  simpanKategoriKeFile(listBaru);
  return listBaru;
}

export async function perbaruiKategori(namaLama, namaBaru) {
  const lama = namaLama?.trim();
  const baru = namaBaru?.trim();

  if (!lama || !baru) {
    throw new Error("Nama kategori lama dan baru harus diisi.");
  }

  if (lama.toLowerCase() === baru.toLowerCase()) {
    return;
  }

  const list = await ambilDaftarKategori();
  const listBaru = list.map((k) => (k === lama ? baru : k));
  simpanKategoriKeFile(listBaru);

  // Perbarui juga semua produk yang menggunakan kategori lama di database Supabase
  try {
    const supabase = await createAdminClient();
    await supabase
      .from("produk")
      .update({ kategori: baru })
      .eq("kategori", lama);
  } catch {
    // Abaikan jika database error
  }
}

export async function hapusKategori(nama) {
  const bersih = nama?.trim();
  if (!bersih) {
    throw new Error("Nama kategori tidak valid.");
  }

  // Periksa apakah masih ada produk yang menggunakan kategori ini di database
  const supabase = await createAdminClient();
  const { count, error } = await supabase
    .from("produk")
    .select("id", { count: "exact", head: true })
    .eq("kategori", bersih);

  if (error) {
    throw new Error(`Gagal memeriksa produk: ${error.message}`);
  }

  if (count && count > 0) {
    throw new Error(
      `Kategori "${bersih}" tidak dapat dihapus karena masih digunakan oleh ${count} produk.`
    );
  }

  const list = await ambilDaftarKategori();
  const listBaru = list.filter((k) => k !== bersih);
  simpanKategoriKeFile(listBaru);
}


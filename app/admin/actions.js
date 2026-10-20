"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  simpanKategoriBaru,
  perbaruiKategori,
  hapusKategori as hapusKategoriDb,
} from "@/lib/kategori";

export async function login(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let pesan = error.message;
    if (error.message === "Invalid login credentials") {
      pesan = "Email atau password salah.";
    }
    return { error: pesan };
  }

  revalidatePath("/admin", "layout");
  redirect("/admin");
}

export async function logout() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  revalidatePath("/admin", "layout");
  redirect("/admin/login");
}

export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const passwordBaru = formData.get("password_baru")?.toString();
  const konfirmasiPassword = formData.get("konfirmasi_password")?.toString();

  if (!passwordBaru || passwordBaru.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server sebelum mengubah data
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus masuk terlebih dahulu untuk mengganti password." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passwordBaru,
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { sukses: "Password berhasil diganti." };
}

// US-29: Helper untuk upload foto ke Supabase Storage dari server
async function prosesUploadFoto(supabase, fileFoto, fotoUrlLama) {
  if (!fileFoto || !(fileFoto instanceof File) || fileFoto.size === 0) {
    return fotoUrlLama || null;
  }

  // Validasi tipe file gambar
  const tipeValid = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];
  if (!tipeValid.includes(fileFoto.type) && !fileFoto.type.startsWith("image/")) {
    throw new Error(
      "File yang diunggah harus berupa gambar (JPG, PNG, WebP, GIF, atau SVG)."
    );
  }

  // Validasi ukuran maksimal 5 MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (fileFoto.size > MAX_SIZE) {
    throw new Error("Ukuran file foto maksimal adalah 5 MB.");
  }

  const ekstensi = fileFoto.name.split(".").pop() || "jpg";
  const namaFile = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ekstensi}`;
  const buffer = Buffer.from(await fileFoto.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("produk")
    .upload(namaFile, buffer, {
      contentType: fileFoto.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(
      `Gagal mengunggah foto ke Supabase Storage: ${uploadError.message}`
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("produk").getPublicUrl(namaFile);

  return publicUrl;
}

export async function tambahProduk(formData) {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  let foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const fileFoto = formData.get("file_foto");

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka dan tidak boleh negatif.");
  }

  // US-29: Upload foto ke Supabase Storage jika ada file yang diunggah
  foto_url = await prosesUploadFoto(supabase, fileFoto, foto_url);

  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori,
    foto_url,
    deskripsi,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function ubahProduk(formData) {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const id = formData.get("id")?.toString();
  const nama = formData.get("nama")?.toString().trim();
  const hargaRaw = formData.get("harga")?.toString().trim();
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori")?.toString().trim() || null;
  let foto_url = formData.get("foto_url")?.toString().trim() || null;
  const deskripsi = formData.get("deskripsi")?.toString().trim() || null;
  const fileFoto = formData.get("file_foto");

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  if (!nama) {
    throw new Error("Nama produk wajib diisi.");
  }

  if (isNaN(harga) || harga < 0) {
    throw new Error("Harga harus berupa angka dan tidak boleh negatif.");
  }

  // US-29: Upload foto ke Supabase Storage jika ada file baru yang diunggah
  foto_url = await prosesUploadFoto(supabase, fileFoto, foto_url);

  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori,
      foto_url,
      deskripsi,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

export async function hapusProduk(formData) {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const id = formData.get("id")?.toString();

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

// US-31: Server Actions untuk Kelola Kategori
export async function tambahKategoriAction(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const nama = formData.get("nama")?.toString().trim();
  await simpanKategoriBaru(nama);

  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk/baru");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function ubahKategoriAction(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const namaLama = formData.get("nama_lama")?.toString().trim();
  const namaBaru = formData.get("nama_baru")?.toString().trim();
  await perbaruiKategori(namaLama, namaBaru);

  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk/baru");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function hapusKategoriAction(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const nama = formData.get("nama")?.toString().trim();
  await hapusKategoriDb(nama);

  revalidatePath("/admin/kategori");
  revalidatePath("/admin/produk/baru");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function buatDeskripsiAI(nama, kategori) {
  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Unauthorized: Anda harus masuk terlebih dahulu." };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return {
      error:
        "Kunci GEMINI_API_KEY belum terpasang di file .env.local. Tambahkan variabel GEMINI_API_KEY=<kunci_api_anda> pada file .env.local untuk mengaktifkan fitur ini.",
    };
  }

  if (!nama || !nama.trim()) {
    return { error: "Nama produk harus diisi terlebih dahulu." };
  }

  const prompt = `Buatlah deskripsi produk yang menarik, singkat (1 sampai 2 kalimat), dan menggugah minat pembeli untuk toko online UMKM.
Nama produk: "${nama.trim()}"
Kategori: "${kategori?.trim() || "Umum"}"
Berikan HANYA teks deskripsi tanpa tanda kutip atau format tambahan.`;

  // Daftar model dengan tanda hubung standar (hyphen/minus ASCII -)
  const candidateModels = [
    process.env.GEMINI_MODEL?.trim(),
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-1.5-flash",
  ].filter(Boolean);

  const modelsToTry = [...new Set(candidateModels)];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        lastError =
          errData?.error?.message ||
          `Gagal memanggil model ${model} (status ${response.status}).`;
        // Jika 404 (model tidak ditemukan atau belum dibuka untuk akun ini), coba model berikutnya
        if (response.status === 404) {
          continue;
        }
        return { error: lastError };
      }

      const data = await response.json();
      const hasil =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

      if (!hasil) {
        lastError = "Gemini tidak mengembalikan teks deskripsi.";
        continue;
      }

      return { deskripsi: hasil };
    } catch (err) {
      lastError =
        err.message ||
        "Terjadi kesalahan saat menghubungi Gemini API. Pastikan perangkat terhubung ke internet.";
    }
  }

  return {
    error:
      lastError ||
      "Gagal membuat deskripsi dengan Gemini API. Silakan periksa kembali konfigurasi kunci API Anda.",
  };
}

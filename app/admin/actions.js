"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  simpanKategoriBaru,
  perbaruiKategori,
  hapusKategori as hapusKategoriDb,
} from "@/lib/kategori";
import { setStatusProduk } from "@/lib/status-produk";
import {
  simpanUlasanBaru,
  toggleHiddenUlasan,
  hapusUlasanDb,
} from "@/lib/ulasan";

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

// US-08 & US-34: Tambah produk dengan validasi server-side per-field
export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Unauthorized: Anda harus masuk terlebih dahulu." };
  }

  const nama = formData.get("nama")?.toString().trim() || "";
  const hargaRaw = formData.get("harga")?.toString().trim() || "";
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori")?.toString().trim() || "";
  let foto_url = formData.get("foto_url")?.toString().trim() || "";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || "";
  const fileFoto = formData.get("file_foto");

  // US-34: Validasi input di server
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }
  if (!hargaRaw) {
    errors.harga = "Harga produk wajib diisi.";
  } else if (isNaN(harga) || harga < 0) {
    errors.harga = "Harga harus berupa angka dan tidak boleh negatif.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
  }

  try {
    // US-29: Upload foto ke Supabase Storage jika ada file yang diunggah
    foto_url = await prosesUploadFoto(supabase, fileFoto, foto_url);

    const { error } = await supabase.from("produk").insert({
      nama,
      harga,
      kategori: kategori || null,
      foto_url: foto_url || null,
      deskripsi: deskripsi || null,
    });

    if (error) {
      return {
        error: error.message,
        values: { nama, harga: hargaRaw, kategori, foto_url, deskripsi },
      };
    }
  } catch (err) {
    return {
      error: err.message || "Gagal menyimpan produk.",
      values: { nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

// US-09 & US-34: Ubah produk dengan validasi server-side per-field
export async function ubahProduk(prevStateOrFormData, maybeFormData) {
  const formData =
    maybeFormData instanceof FormData
      ? maybeFormData
      : prevStateOrFormData instanceof FormData
      ? prevStateOrFormData
      : null;

  if (!formData) {
    return { error: "Data formulir tidak ditemukan." };
  }

  const supabase = await createAdminClient();

  // Wajib periksa bahwa admin sudah login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Unauthorized: Anda harus masuk terlebih dahulu." };
  }

  const id = formData.get("id")?.toString();
  const nama = formData.get("nama")?.toString().trim() || "";
  const hargaRaw = formData.get("harga")?.toString().trim() || "";
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori")?.toString().trim() || "";
  let foto_url = formData.get("foto_url")?.toString().trim() || "";
  const deskripsi = formData.get("deskripsi")?.toString().trim() || "";
  const fileFoto = formData.get("file_foto");

  if (!id) {
    return { error: "ID produk tidak valid." };
  }

  // US-34: Validasi input di server
  const errors = {};
  if (!nama) {
    errors.nama = "Nama produk wajib diisi.";
  }
  if (!hargaRaw) {
    errors.harga = "Harga produk wajib diisi.";
  } else if (isNaN(harga) || harga < 0) {
    errors.harga = "Harga harus berupa angka dan tidak boleh negatif.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      errors,
      values: { id, nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
  }

  try {
    // US-29: Upload foto ke Supabase Storage jika ada file baru yang diunggah
    foto_url = await prosesUploadFoto(supabase, fileFoto, foto_url);

    const { error } = await supabase
      .from("produk")
      .update({
        nama,
        harga,
        kategori: kategori || null,
        foto_url: foto_url || null,
        deskripsi: deskripsi || null,
      })
      .eq("id", id);

    if (error) {
      return {
        error: error.message,
        values: { id, nama, harga: hargaRaw, kategori, foto_url, deskripsi },
      };
    }
  } catch (err) {
    return {
      error: err.message || "Gagal memperbarui produk.",
      values: { id, nama, harga: hargaRaw, kategori, foto_url, deskripsi },
    };
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

// US-32: Server Action untuk Toggle Status Aktif/Nonaktif Produk
export async function toggleStatusProduk(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const id = formData.get("id")?.toString();
  const statusStr = formData.get("target_status")?.toString();
  const statusAktif = statusStr === "true";

  if (!id) {
    throw new Error("ID produk tidak valid.");
  }

  await setStatusProduk(id, statusAktif);

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/produk/${id}`);
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

// US-38: Tambah ulasan produk dengan validasi & honeypot anti-spam
export async function tambahUlasanAction(prevState, formData) {
  // 1. Cek honeypot anti-spam
  const honeypot = formData.get("website_url")?.toString().trim();
  if (honeypot) {
    return { error: "Pengiriman ulasan ditolak oleh sistem keamanan." };
  }

  const produkId = formData.get("produk_id")?.toString();
  const nama = formData.get("nama")?.toString().trim();
  const ratingRaw = formData.get("rating")?.toString();
  const rating = parseInt(ratingRaw, 10);
  const komentar = formData.get("komentar")?.toString().trim();

  if (!produkId) {
    return { error: "ID produk tidak valid." };
  }
  if (!nama || nama.length > 50) {
    return { error: "Nama wajib diisi (maksimal 50 karakter)." };
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Rating harus bernilai antara 1 sampai 5 bintang." };
  }
  if (!komentar || komentar.length < 3 || komentar.length > 500) {
    return { error: "Komentar ulasan minimal 3 karakter dan maksimal 500 karakter." };
  }

  try {
    await simpanUlasanBaru({
      produk_id: produkId,
      nama,
      rating,
      komentar,
    });

    revalidatePath(`/produk/${produkId}`);
    revalidatePath("/admin/ulasan");
    return { sukses: "Ulasan Anda berhasil dikirim dan ditampilkan!" };
  } catch (err) {
    return { error: err.message || "Gagal menyimpan ulasan." };
  }
}

// US-39: Moderasi ulasan (sembunyikan / tampilkan)
export async function toggleSembunyikanUlasanAction(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const id = formData.get("id")?.toString();
  const targetHidden = formData.get("target_hidden")?.toString() === "true";
  const produkId = formData.get("produk_id")?.toString();

  if (!id) throw new Error("ID ulasan tidak valid.");

  await toggleHiddenUlasan(id, targetHidden);

  revalidatePath("/admin/ulasan");
  if (produkId) revalidatePath(`/produk/${produkId}`);
}

// US-39: Hapus ulasan oleh admin
export async function hapusUlasanAction(formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Unauthorized: Anda harus masuk terlebih dahulu.");
  }

  const id = formData.get("id")?.toString();
  const produkId = formData.get("produk_id")?.toString();

  if (!id) throw new Error("ID ulasan tidak valid.");

  await hapusUlasanDb(id);

  revalidatePath("/admin/ulasan");
  if (produkId) revalidatePath(`/produk/${produkId}`);
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

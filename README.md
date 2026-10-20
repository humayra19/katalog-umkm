# Katalog UMKM + Order WhatsApp

Template workshop vibe coding Creative Hub App Talent (CHAT) 2026. Repo ini berisi tampilan aplikasi katalog UMKM; tugasmu merangkainya menjadi sistem utuh dengan bantuan AI: database, login admin, keamanan, dan pemesanan lewat WhatsApp.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fandixurniawan%2Fkatalog-umkm&project-name=katalog-umkm&repository-name=katalog-umkm)

## Langkah awal

1. **Salin repo ke akun GitHub-mu.** Klik tombol **Deploy with Vercel** di atas. Vercel akan membuat repo baru di akun GitHub-mu dan langsung men-deploy-nya. Setelah selesai, buka link Vercel-mu: katalog tampil dengan data contoh.
2. **Buat proyek Supabase.** Masuk ke [supabase.com](https://supabase.com) dengan akun GitHub, lalu buat proyek baru. Simpan password database di tempat aman.
3. **Siapkan database.** Di Supabase, buka **SQL Editor**, tempel seluruh isi `docs/schema.sql`, lalu klik **Run**. Tabel `produk` beserta data awal akan terbentuk.
4. **Siapkan akun admin.** Ikuti panduan akun admin yang dibagikan mentor. Setelah itu matikan pendaftaran akun baru di **Authentication > Sign In / Providers**.
5. **Isi environment variable di Vercel.** Buka proyekmu di Vercel > **Settings > Environment Variables**, lalu isi tiga variabel dari `.env.example`. Nilainya ada di Supabase > **Project Settings > API**. Setelah itu lakukan **Redeploy**.
6. **Clone repo ke laptop.**

   ```bash
   git clone https://github.com/<akunmu>/<nama-repo>.git
   cd <nama-repo>
   npm install
   ```

7. **Buat file `.env.local`.** Salin `.env.example` menjadi `.env.local`, lalu isi dengan nilai yang sama seperti di Vercel.
8. **Jalankan di laptop.**

   ```bash
   npm run dev
   ```

   Buka `http://localhost:3000`.

## Alur kerja

Kerjakan satu user story setiap kali, lalu simpan dan kirim perubahan:

```bash
git add .
git commit -m "US-01: katalog dari database"
git push
```

Setiap `git push`, Vercel otomatis men-deploy versi terbaru. Cek hasilnya di link Vercel-mu.

Urutan yang disarankan: US-01, US-02, US-03, US-04, US-05, US-06, lalu fitur bonus. Daftar lengkap ada di `docs/user-stories.md`.

## Isi repo

| File atau folder | Isi |
| --- | --- |
| `AGENTS.md` | Aturan untuk AI agent, dibaca sebelum setiap prompt |
| `DESIGN.md` | Panduan warna, huruf, dan komponen |
| `PROMPTS.md` | Jurnal prompt, wajib diisi |
| `docs/` | Problem statement, PRD, user story, rancangan teknis, skema database, checklist |
| `lib/toko.js` | Nama toko, nomor WhatsApp, alamat, jam buka |
| `app/` | Halaman aplikasi |
| `components/` | Komponen tampilan |

## Menyesuaikan dengan usahamu

- Identitas toko: ubah `lib/toko.js`.
- Warna: ubah bagian `@theme` di `app/globals.css` (lihat `DESIGN.md`).
- Produk: ubah langsung di Supabase > **Table Editor > produk**.

## Aturan penting

- Jangan menyimpan kunci atau password di kode, dan jangan push file `.env.local`.
- Jangan memberi awalan `NEXT_PUBLIC_` pada environment variable.
- Isi `PROMPTS.md` setiap menyelesaikan fitur.

## Sebelum mengumpulkan

1. Jalankan semua poin di `docs/checklist-keamanan.md` dan `docs/checklist-pengujian.md` pada link Vercel.
2. Lengkapi bagian di bawah ini.
3. Push perubahan terakhir sebelum batas waktu.

## Tentang aplikasi ini

- **Nama usaha:** Toko Hyuma
- **Pembuat:** Tim Pengembang Katalog UMKM
- **Link aplikasi:** https://katalog-umkm.vercel.app
- **Deskripsi:** Aplikasi katalog produk UMKM modern berbasis Next.js 16 dan Supabase yang cepat, aman, dan responsif. Pengunjung dapat menelusuri produk, melakukan pencarian dan filter kategori, memilih varian/jumlah barang, menandai produk favorit, beralih ke mode gelap, serta memesan barang langsung secara otomatis melalui WhatsApp. Pemilik toko dapat mengelola katalog dan mengganti password secara aman di dashboard admin yang dilindungi autentikasi ketat di sisi server.
- **Fitur bonus yang dikerjakan:**
  - **US-07:** Daftar produk admin langsung dari database Supabase
  - **US-08:** Form tambah produk baru admin dengan verifikasi sesi server
  - **US-09:** Form ubah data produk terisi data lama
  - **US-10:** Hapus produk dengan dialog konfirmasi keamanan
  - **US-11:** Filter kategori dinamis dan pencarian produk langsung via database
  - **US-12:** Pemilihan varian dan kuantiti pada pemesanan WhatsApp
  - **US-13:** Dukungan PWA (Progressive Web App) dengan Web Manifest
  - **US-14:** Pembuatan deskripsi produk otomatis bertenaga Google Gemini AI
  - **US-15:** Pengurutan produk (termurah, termahal, terbaru)
  - **US-16:** Paginasi katalog produk di sisi server
  - **US-17:** Rekomendasi produk terkait berdasarkan kategori yang sama
  - **US-18:** Galeri foto produk dengan thumbnail interaktif
  - **US-19:** Indikator dan badge status stok habis
  - **US-20:** Harga coret diskon dan badge "Baru" / "Terlaris"
  - **US-21:** Keranjang belanja multi-produk dengan pemesanan serentak via WhatsApp
  - **US-22:** Halaman profil toko, jam operasional, dan kontak resmi (`/tentang`)
  - **US-23:** Tombol bagikan atau salin tautan produk dengan umpan balik cepat
  - **US-24:** Daftar produk favorit tersimpan di browser (`/favorit`)
  - **US-25:** Mode gelap (Dark Mode) responsif dan bebas flicker
  - **US-26:** Optimasi SEO dan Open Graph metadata dinamis

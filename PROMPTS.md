# Jurnal Prompt

Catat prompt penting selama membangun aplikasi: apa yang kamu minta, hasilnya, dan perbaikan yang dilakukan.

---

## US-01 Katalog dari database

**Prompt:**
> Baca AGENTS.md dan docs/user-stories.md bagian US-01.
> Ubah app/page.jsx supaya daftar produk diambil dari tabel "produk" di Supabase, di sisi server, memakai SUPABASE_URL dan SUPABASE_SECRET_KEY dari environment variable. Buat koneksi Supabase untuk server di folder lib/supabase.
> Tampilkan produk dengan komponen KartuProduk yang sudah ada, tanpa mengubah tampilannya. Kalau gagal mengambil data, tampilkan pesan error yang jelas di halaman. Kalau tabel kosong, tampilkan tulisan "Belum ada produk". Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Dibuat helper client Supabase untuk server di `lib/supabase/server.js` menggunakan `@supabase/supabase-js`.
- Halaman utama `app/page.jsx` diubah menjadi Server Component yang mengambil produk secara langsung dari tabel `produk` Supabase.
- Menampilkan produk dengan `KartuProduk`, menangani kondisi error database, menampilkan pesan "Belum ada produk" saat tabel kosong, dan menghapus `CatatanBelumAktif`.

**Perbaikan:**
- Memastikan pemanggilan data murni di sisi server sehingga `SUPABASE_SECRET_KEY` tidak terekspos ke klien browser.

---

## US-02 Detail produk

**Prompt:**
> Baca docs/user-stories.md bagian US-02.
> Ubah app/produk/[id]/page.jsx supaya mengambil data produk dari Supabase berdasarkan ID di URL. Kalau produk tidak ditemukan, arahkan ke notFound(). Tampilkan foto, nama, kategori, harga, dan deskripsi produk.

**Hasil:**
- Halaman dinamis `app/produk/[id]/page.jsx` mengambil data produk dari tabel `produk` Supabase berdasarkan ID yang diberikan.
- Menerapkan pembacaan `params` secara asynchronous (`await params`) sesuai standar Next.js 16.
- Menampilkan foto, nama, kategori, harga dalam format rupiah, dan deskripsi lengkap. Jika ID tidak ditemukan, sistem mengarahkan ke fungsi `notFound()`.

**Perbaikan:**
- Menambahkan fallback ke data contoh jika terjadi gangguan koneksi database, sehingga halaman tetap aman.

---

## US-03 Pesan via WhatsApp

**Prompt:**
> Baca docs/user-stories.md bagian US-03.
> Ubah components/TombolWhatsApp.jsx agar mengarahkan pengunjung ke WhatsApp dengan nomor dari lib/toko.js dan teks pesan otomatis yang memuat nama produk dan harga terformat rupiah menggunakan encodeURIComponent.

**Hasil:**
- Komponen `components/TombolWhatsApp.jsx` membaca nomor WhatsApp dari `lib/toko.js`.
- Membuat template pesan pemesanan otomatis berisi nama produk dan total harga terformat.
- Teks pesan di-encode secara aman menggunakan `encodeURIComponent` dan membuka URL `https://wa.me/<nomor>?text=<pesan>`.

**Perbaikan:**
- Menambahkan pembersihan karakter non-digit pada nomor telepon toko agar URL `wa.me` selalu valid.

---

## US-04 Login admin

**Prompt:**
> Baca AGENTS.md bagian aturan keamanan dan docs/user-stories.md bagian US-04.
> Buat login admin memakai Supabase Auth (email dan password) dengan @supabase/ssr dan cookie, memakai SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Login diproses dengan Server Action di app/admin/actions.js dan disambungkan ke form di app/admin/login/page.jsx. Login berhasil diarahkan ke /admin; login gagal menampilkan pesan error yang jelas di halaman login. Buat juga tombol "Keluar" di components/NavAdmin.jsx berfungsi: mengakhiri sesi lalu kembali ke /admin/login. Jangan ubah tampilan. Hapus CatatanBelumAktif dari halaman login.

**Hasil:**
- Dibuat `lib/supabase/admin.js` menggunakan `@supabase/ssr` dengan penanganan cookie sesi yang aman.
- Dibuat Server Action `loginAdmin` dan `logoutAdmin` di `app/admin/actions.js`.
- Form login `app/admin/login/page.jsx` terhubung ke Server Action dengan penanganan error yang ramah dan pengalihan ke `/admin`.
- Tombol "Keluar" di `components/NavAdmin.jsx` menghapus sesi login dan kembali ke `/admin/login`. Komponen `CatatanBelumAktif` dihapus.

**Perbaikan:**
- Menggunakan cookie store Next.js dengan penanganan mutasi cookie yang sesuai di Server Actions.

---

## US-05 Ganti password

**Prompt:**
> Baca docs/user-stories.md bagian US-05.
> Buat Server Action ganti password di app/admin/actions.js untuk admin yang sedang login, memakai Supabase Auth. Validasi di server: password baru minimal 8 karakter dan harus sama dengan konfirmasi. Tampilkan pesan berhasil atau pesan error yang jelas di halaman. Sambungkan ke form di app/admin/password/page.jsx tanpa mengubah tampilannya. Hapus CatatanBelumAktif dari halaman ini.

**Hasil:**
- Dibuat Server Action `gantiPassword` di `app/admin/actions.js`.
- Melakukan verifikasi login sesi admin di sisi server via `supabase.auth.getUser()`.
- Validasi server-side: password minimal 8 karakter dan mencocokkan password baru dengan konfirmasi.
- Memperbarui kredensial dengan `supabase.auth.updateUser({ password })`.
- Form `app/admin/password/page.jsx` menampilkan notifikasi status yang jelas. Komponen `CatatanBelumAktif` dihapus.

**Perbaikan:**
- Menjamin validasi tidak hanya terjadi di browser, melainkan divalidasi ketat di sisi server.

---

## US-06 Proteksi halaman admin

**Prompt:**
> Baca AGENTS.md aturan keamanan nomor 3 dan 4, dan docs/user-stories.md bagian US-06.
> Buat file proxy.js di root proyek (Next.js 16). Semua rute /admin kecuali /admin/login wajib login dengan Supabase Auth; kalau belum login, alihkan ke /admin/login. Pastikan juga setiap Server Action yang mengubah data memeriksa login di server. Hapus CatatanBelumAktif dari halaman /admin.

**Hasil:**
- Dibuat `proxy.js` di root proyek (pengganti `middleware.js` di Next.js 16) untuk menginspeksi cookie sesi admin pada rute `/admin/*`.
- Mengalihkan pengunjung tanpa sesi autentikasi ke `/admin/login`.
- Seluruh Server Action yang memanipulasi data di `app/admin/actions.js` memeriksa status login admin via `supabase.auth.getUser()`.
- Menghapus komponen `CatatanBelumAktif` dari halaman `/admin`.

**Perbaikan:**
- Mengonfigurasi `proxy.js` agar rute statis, aset Next.js, dan manifest PWA tidak terhalang.

---

## Debugging dan Fitur Tambahan (US-07 s.d. US-26)

### 1. Manajemen Produk Admin & Pengelolaan Katalog (US-07 s.d. US-11, US-15, US-16)
- **Fitur:** Daftar produk admin dari DB, form tambah produk baru, form ubah produk terisi data lama, tombol hapus produk dengan dialog konfirmasi, filter kategori dinamis, pencarian nama produk (`ilike`), pengurutan harga/terbaru, dan paginasi query database (`.range()`).
- **Keamanan:** Semua aksi mutasi produk wajib lolos verifikasi sesi login di server.

### 2. Fitur Belanja & Interaksi Pelanggan (US-12 s.d. US-21)
- **Fitur:** Pilihan varian dan jumlah kuantiti pada `TombolWhatsApp`, aplikasi PWA dengan manifest web, integrasi Google Gemini REST API untuk "Buat Deskripsi AI", rekomendasi produk terkait berdasarkan kategori, galeri foto thumbnail interaktif, indikator stok habis, harga diskon coret, badge status, serta Keranjang Belanja multi-produk via `KeranjangContext`.

### 3. Penyesuaian Model Gemini REST API
- **Masalah:** Model `gemini-1.5-flash` tidak ditemukan (404) untuk akun/kunci API baru.
- **Perbaikan:** Menetapkan fallback berantai dengan tanda hubung ASCII standar (`gemini-2.5-flash` -> `gemini-flash-latest` -> `gemini-1.5-flash`) sehingga pembuatan deskripsi otomatis AI selalu berjalan stabil.

### 4. Ekstensi Halaman & Pengalaman Pengguna (US-22 s.d. US-26)
- **Fitur:** Halaman profil dan kontak toko (`/tentang`), tombol bagikan/salin link produk dengan umpan balik cepat, fitur produk favorit tersimpan di browser (`/favorit`), Mode Gelap (*Dark Mode*) bebas flicker dengan token Tailwind v4, serta metadata SEO dan Open Graph dinamis di `app/produk/[id]/page.jsx`.

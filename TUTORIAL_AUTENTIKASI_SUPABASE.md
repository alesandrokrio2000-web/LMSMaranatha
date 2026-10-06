# Tutorial Autentikasi Admin dengan Supabase

Panduan ini menjelaskan cara menyiapkan login admin (`admin.html`) untuk mengunggah materi LMS Digitalisasi Pembelajaran.

## Cara kerja singkat

- Pengunjung umum **tidak perlu login** untuk melihat materi, mengumpulkan tugas, dan mengerjakan tes.
- Admin login di `admin.html` memakai **email + password** (Supabase Auth).
- Setelah login, admin berstatus `authenticated`. Hak akses unggah/hapus materi hanya diberikan ke status ini lewat **Row Level Security (RLS)** di `supabase/admin.sql`.
- Siapa pun yang belum login (`anon`) tidak bisa mengubah materi, meskipun mengetahui anon key.

## Struktur proyek

```
lms-digitalisasi-pembelajaran/
├── index.html        halaman publik
├── admin.html        halaman login & dashboard admin
├── css/              style.css, admin.css
├── js/               config.js (koneksi Supabase), app.js, tes.js, admin.js
├── supabase/         setup.sql, admin.sql, update_v3.sql
├── assets/           logo_maranatha.png, bg_sekolah.jpg
└── TUTORIAL_AUTENTIKASI_SUPABASE.md
```

## Langkah 1 - Buat project Supabase

1. Daftar/masuk di https://supabase.com, lalu klik **New project**.
2. Isi nama project, password database (simpan baik-baik), dan pilih region terdekat (mis. Singapore).
3. Tunggu sampai project selesai dibuat.

## Langkah 2 - Jalankan SQL (urutan penting)

Buka **SQL Editor → New query**, lalu jalankan satu per satu:

1. Isi file `supabase/setup.sql` → klik **Run**.
2. Isi file `supabase/admin.sql` → klik **Run**.
3. Isi file `supabase/update_v3.sql` → klik **Run** (membuat saklar Postest dan 25 soal Postest).

Hasilnya: tabel `materi`, `tugas`, `hasil_tes`, bucket `materi` (publik) dan `tugas` (privat), serta hak akses admin.

## Langkah 3 - Aktifkan login Email

1. Buka **Authentication → Providers** (di beberapa versi: **Sign In / Providers**).
2. Pastikan **Email** aktif.
3. Untuk kemudahan, matikan **Confirm email** agar admin yang dibuat manual bisa langsung login (atau centang *Auto Confirm User* saat membuat user di Langkah 5).

## Langkah 4 - Matikan pendaftaran publik (WAJIB)

Karena hak admin diberikan ke semua pengguna yang login, pendaftaran harus ditutup supaya orang asing tidak bisa membuat akun sendiri.

1. Buka **Authentication → Sign In / Providers** (atau **Settings**).
2. Matikan opsi **Allow new users to sign up**.
3. Simpan.

## Langkah 5 - Buat akun admin

1. Buka **Authentication → Users**.
2. Klik **Add user → Create new user**.
3. Isi **Email** dan **Password** (minimal 8 karakter, gunakan yang kuat).
4. Centang **Auto Confirm User**, lalu klik **Create user**.

Untuk menambah admin lain, ulangi langkah ini. Untuk mengganti password, klik user tersebut lalu pilih reset/ubah password.

## Langkah 6 - Hubungkan website ke Supabase

1. Buka **Project Settings → API**.
2. Salin **Project URL** dan **anon public key**.
3. Buka `js/config.js`, lalu isi:

```js
SUPABASE_URL: 'https://xxxxxxxx.supabase.co',
SUPABASE_KEY: 'eyJhbGciOi... (anon public key)',
```

> **Jangan pernah** memakai `service_role` key di file frontend. Hanya gunakan **anon public key**.

## Langkah 7 - Atur URL situs (setelah deploy)

1. Deploy folder proyek ke Netlify / Vercel / GitHub Pages.
2. Di Supabase buka **Authentication → URL Configuration**.
3. Isi **Site URL** dengan alamat website kamu (mis. `https://lms-maranatha.netlify.app`).

Untuk uji coba lokal, jalankan lewat server lokal (mis. ekstensi *Live Server* di VS Code), bukan dengan klik dua kali file HTML.

## Langkah 8 - Uji coba

1. Buka `admin.html`, masuk dengan email & password dari Langkah 5.
2. Di tab **Materi**, isi judul, pilih file PDF/PPT/Word, klik **Unggah Materi**.
3. Buka `index.html` → menu **Materi**. Materi yang diunggah harus langsung tampil dan bisa dibuka.
4. Tab **Tugas Masuk** menampilkan tugas dari pengunjung (bisa diunduh), dan tab **Hasil Tes** menampilkan skor.

## Membuka dan menutup Postest

1. Login di `admin.html`, buka tab **Postest**.
2. Klik **Buka Postest** saat peserta sudah boleh mengerjakan. Klik **Tutup Postest** untuk menguncinya lagi.
3. Selama status DITUTUP, halaman Postest menampilkan pesan terkunci. Soal Postest dan penyimpanan skornya juga dikunci di database (lewat RLS), jadi tidak bisa dibuka dengan trik di browser.
4. Soal Pretest (25 soal, Materi 1-2) ada di `js/soal_pretest.js`. Soal Postest (25 soal, Materi 3-5) ada di tabel `soal_postest` dan bisa diubah lewat Table Editor.

## Pemecahan masalah

| Pesan / gejala | Penyebab & solusi |
|---|---|
| Login gagal: email atau password salah | Periksa akun di Authentication → Users. Pastikan sudah *confirmed*. |
| `Email not confirmed` | Centang Auto Confirm saat membuat user, atau matikan Confirm email. |
| `new row violates row-level security policy` saat unggah | `supabase/admin.sql` belum dijalankan, atau belum login. |
| Materi terunggah tapi tidak bisa dibuka | Bucket `materi` harus **Public** (Storage → materi → Edit bucket). |
| Daftar materi kosong di beranda | Cek `SUPABASE_URL` / `SUPABASE_KEY` di `js/config.js`, dan buka Console browser (F12). |
| Postest tetap terkunci | Pastikan `update_v3.sql` sudah dijalankan dan status di tab Postest admin adalah DIBUKA. |
| `Invalid API key` | Pastikan yang dipakai adalah **anon public key**, tanpa spasi tambahan. |
| File besar gagal diunggah | Batas default Supabase gratis 50 MB per file. |

## Catatan keamanan

- Gunakan password admin yang kuat dan unik.
- Jangan membagikan password admin lewat grup terbuka.
- Jaga agar **Allow new users to sign up** tetap mati.
- Halaman `admin.html` tetap bisa dibuka siapa pun, tetapi tanpa login tidak ada yang bisa diunggah, diubah, atau dilihat (keamanan dijaga oleh RLS di sisi database, bukan oleh tampilan).

# SoraPay

Web app pribadi: Spotify Playlist, TikTok/Instagram/Pinterest Downloader, Al-Qur'an, Mini Games,
Tourl (foto/video ke link), Folder Menu custom, dan **Fitur VIP** (login admin-managed, admin panel,
fitur custom, notifikasi Telegram, PWA installable).

## Struktur Folder

```
sorapay-vip/
├── index.html              <- seluruh aplikasi (frontend)
├── manifest.json            <- config PWA (installable app)
├── sw.js                     <- service worker (PWA)
├── icon-192.png, icon-512.png
├── package.json               <- dependency firebase-admin untuk /api
├── vercel.json
├── firestore.rules              <- security rules Firestore (WAJIB di-set di Firebase Console)
├── .env.example                  <- daftar env var yang dibutuhkan
├── .gitignore
├── api/
│   ├── config.js             <- kirim config Firebase (client) dari env var
│   ├── setup-admin.js         <- bootstrap akun admin dari ADMIN_EMAIL/ADMIN_PASSWORD
│   └── notify.js               <- kirim notifikasi aktivitas ke Telegram bot
└── README.md
```

---

## LANGKAH 1 — Bikin Project Firebase (gratis)

1. Buka [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build > Authentication** → tab **Sign-in method** → aktifkan **Email/Password**.
3. **Build > Firestore Database** → **Create database** → mode **production** → pilih lokasi server.
4. Tab **Rules** di Firestore → hapus isinya → **copy-paste seluruh isi file `firestore.rules`** → **Publish**.
5. ⚙️ **Project settings** → **Your apps** → klik **</> (Web)** → daftar app → catat 6 value `firebaseConfig`
   (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
6. Masih di Project settings → tab **Service accounts** → klik **Generate new private key** →
   sebuah file `.json` akan terdownload. **Buka file itu, copy SELURUH isinya** (nanti dipakai di Langkah 3).

---

## LANGKAH 2 — Bikin Bot Telegram (opsional, untuk notifikasi aktivitas)

1. Di Telegram, chat **@BotFather** → ketik `/newbot` → ikuti instruksi → catat **token** yang diberikan.
2. Chat bot **@userinfobot** untuk tahu **Chat ID** kamu sendiri (angka).
3. Buka chat dengan bot yang baru kamu buat, kirim pesan apa saja (supaya bot bisa kirim balik notifikasi ke kamu).

> Kalau langkah ini dilewati, fitur notifikasi otomatis nonaktif — tidak akan error, cuma diam saja.

---

## LANGKAH 3 — Upload ke GitHub

```bash
git init
git add .
git commit -m "Initial commit SoraPay"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

---

## LANGKAH 4 — Deploy ke Vercel + Isi Environment Variables

1. [vercel.com](https://vercel.com) → **Add New > Project** → pilih repo GitHub tadi.
2. **Sebelum klik Deploy**, buka **Environment Variables**, isi baris-baris ini:

   | Name (ketik PERSIS) | Value |
   |---|---|
   | `FIREBASE_API_KEY` | dari firebaseConfig |
   | `FIREBASE_AUTH_DOMAIN` | dari firebaseConfig |
   | `FIREBASE_PROJECT_ID` | dari firebaseConfig |
   | `FIREBASE_STORAGE_BUCKET` | dari firebaseConfig |
   | `FIREBASE_MESSAGING_SENDER_ID` | dari firebaseConfig |
   | `FIREBASE_APP_ID` | dari firebaseConfig |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | seluruh isi file JSON dari Langkah 1.6 (satu baris) |
   | `ADMIN_EMAIL` | email yang mau kamu pakai sebagai admin |
   | `ADMIN_PASSWORD` | password yang mau kamu pakai sebagai admin |
   | `TELEGRAM_BOT_TOKEN` | token dari @BotFather (Langkah 2) |
   | `TELEGRAM_CHAT_ID` | chat ID kamu (Langkah 2) |

3. Klik **Deploy**. Tunggu ~1-2 menit (lebih lama dari biasanya karena install `firebase-admin`).
4. Buka `https://nama-project-kamu.vercel.app` — begitu halaman **Fitur VIP** pertama kali dibuka,
   akun admin otomatis dibuatkan di belakang layar dari `ADMIN_EMAIL`/`ADMIN_PASSWORD` di atas.
5. Login pakai email & password itu → langsung masuk **Admin Panel**.

> **Ganti env var kapan pun** → harus **Redeploy** (Deployments > ⋯ > Redeploy) supaya kepakai.

---

## Yang Bisa Dilakukan Admin

- **Tambah Fitur VIP**: nama, deskripsi, harga, upload file HTML (dijalankan di iframe sandbox).
- **Buat Akun Konsumen**: satu-satunya cara pengguna biasa bisa punya akun — self-register **dimatikan**.
- **Kelola Pengguna**: lihat semua akun + status, **Ban/Buka Ban** kapan saja (akun yang dibanned otomatis
  ter-logout kalau mencoba masuk).
- **Atur Nomor WhatsApp**: tampil otomatis di halaman "Daftar Harga Fitur VIP" (dilihat calon pembeli
  sebelum punya akun).
- **Tambah Fitur Gratis (Non-VIP)**: upload HTML, langsung muncul di menu "Fitur Tambahan" — bisa diakses
  siapa saja tanpa login.
- **Buat Folder Menu**: kelompokkan beberapa fitur bawaan (Spotify, Downloader, dst) jadi satu folder custom
  di sidebar — misal folder "Musik & Video" isinya Spotify Playlist.

## Alur Pengguna Biasa (bukan admin)

1. Buka **Fitur VIP** → lihat form login, TIDAK ADA tombol daftar sendiri.
2. Kalau belum punya akun → klik **"Lihat Daftar Harga & Cara Berlangganan"** → lihat daftar fitur + harga
   + nomor WhatsApp admin → hubungi admin → admin buatkan akun lewat Admin Panel → dikasih email+password.
3. Login pakai akun yang diberikan admin.

---

## Soal "Download jadi APK"

File `.apk` asli butuh Android SDK/Gradle/signing yang di luar jangkauan tool ini. Project ini sudah
jadi **PWA** — di HP: buka web → menu browser → **"Install app" / "Add to Home Screen"**.

Kalau tetap butuh `.apk` fisik: deploy dulu ke Vercel, lalu buka [pwabuilder.com](https://www.pwabuilder.com),
masukkan link Vercel kamu → **Package for Stores > Android** → download gratis.

## Keamanan

- Password admin **tidak pernah** ditulis di kode sumber — hanya ada di Environment Variables Vercel,
  dan hanya diproses server-side lewat `/api/setup-admin.js`.
- File HTML yang diupload admin (VIP maupun fitur gratis) dijalankan di **iframe sandbox**
  (`sandbox="allow-scripts allow-forms allow-popups"`) — terisolasi dari halaman utama.
- `FIREBASE_SERVICE_ACCOUNT_JSON` memberi akses penuh ke project Firebase kamu — **jangan pernah**
  taruh di file yang di-commit ke GitHub, cuma di Environment Variables Vercel.

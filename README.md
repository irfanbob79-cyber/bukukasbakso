# 🍜 Bakso Josjis - Aplikasi Pembukuan & Manajemen Kas Warung Mandiri

Aplikasi web pembukuan kas warung bakso mandiri berbasis **Mobile-First Progressive Web App (PWA)** yang dirancang khusus untuk pemilik tunggal (*solo owner*), sistem 100% tunai, tanpa kasir, dan dapat dioperasikan dengan satu tangan (*thumb-friendly*).

---

## 🌟 Fitur Utama

### 1. Dashboard Ringkasan (Home)
- **Status Kas Fisik Hari Ini:** Uang masuk, total belanja hari ini, dan sisa uang fisik di laci/dompet.
- **Status Batch Adonan Aktif (Sistem Lampu Lalu Lintas):**
  - 🟢 **Segar:** Hari ke-1 pembuatan.
  - 🔵 **Normal:** Hari ke-2 pembuatan.
  - 🟡/🔴 **Peringatan:** Hari ke-3/4 (saatnya bersiap giling adonan baru).
  - Menampilkan ringkasan bahan & takaran yang digiling (contoh: *Daging Sapi (4 kg) • Tetelan (1 kg)*).
- **Aksi Cepat Warung:** Akses satu ketukan untuk tutup kasir, catat belanja, dan giling adonan.

### 2. Pencatatan Uang Masuk (Bakso & Es)
- **Omzet Bakso & Makanan:** Input uang masuk porsi bakso, mie, dan makanan berformat rupiah instan.
- **Penjualan Es & Minuman:**
  - Stepper jumlah cup terjual (`+` / `-`, `+5`, `-5`) serta chip preset (`20 cup`, `30 cup`, `40 cup`, `50 cup`, `60 cup`).
  - Nominal harga per cup (default Rp 4.000, dapat diubah bebas).
  - Subtotal omzet es otomatis terhitung: $\text{Cup} \times \text{Harga}$.
- **Kalkulator Laci Uang Fisik:** Penghitung lembaran uang kertas (100rb, 50rb, 20rb, 10rb, 5rb, 2rb, 1rb + koin) saat tutup warung.
- **Catatan Harian:** Textarea luas untuk mencatat kondisi warung (misal: *hujan sore, es teh laku keras*).

### 3. Belanja Operasional Terpisah
- **3 Kategori Belanja:**
  1. 🥬 **Belanja Pasar:** Sawi, toge, seledri, bumbu dapur, bihun, mie kuning.
  2. 🧊 **Belanja Bahan Es:** Es balok, es batu kristal, gula pasir, teh celup/tubruk, cup plastik, sedotan, sirup, jeruk peras.
  3. 🔥 **Gas & Operasional:** Tabung gas LPG 3kg, kantong kuah tebal, sabun cuci, kertas bungkus.
- **Multi-Item Entry:** Mencatat beberapa nota belanja sekaligus dalam satu sesi simpan.
- **Quick Presets Chips:** Satu klik tombol chip untuk mengisi nama belanjaan tanpa mengetik di HP.

### 4. Manajemen Batch Adonan Bakso (Siklus 2–4 Hari)
- **Nama Rincian Bahan Bebas (Custom):** Nama bahan bisa diketik bebas atau menggunakan chip cepat (`+ Daging Sapi`, `+ Tetelan`, `+ Daging Ayam`, dll).
- **Input Satuan / Takaran:** Kolom takaran berat/kemasan (`2 kg`, `3.5 kg`, `500 gr`, `1 paket`) dengan chip bantuan (`[1 kg]`, `[2 kg]`, `[3 kg]`, `[4 kg]`, `[5 kg]`, `[500 gr]`).
- **Penambahan/Pengurangan Baris Bahan:** Tombol `+ Tambah Bahan` untuk menambah pos bahan adonan baru.
- **Kalkulasi Rata-rata Modal per Hari:** Otomatis menghitung beban modal adonan per hari sesuai estimasi masa pakai (2, 3, atau 4 hari).

### 5. Menu Riwayat Khusus & Pencarian Tanggal
- **Pencarian Berdasarkan Tanggal:**
  - Date picker pemilih tanggal langsung.
  - Stepper tombol navigasi harian (`<` dan `>`) untuk mundur/maju hari.
  - Pilihan cepat: `[Hari Ini]`, `[Kemarin]`, `[7 Hari Terakhir]`, `[Semua]`.
- **Pencarian Kata Kunci:** Cari berdasarkan nama barang, nota, atau catatan (misal: *"es"*, *"gas"*, *"daging"*, *"cup"*).
- **Filter Jenis Transaksi:** Filter khusus Uang Masuk, Belanja Pasar, Belanja Es, Operasional, atau Batch Adonan.
- **Aksi Cepat:** Ubah dan hapus transaksi langsung di kartu riwayat.

### 6. Rekapitulasi Laba Bersih & Analisis Kinerja Es
- **Formula Laba Riil Masuk Kantong:**
  $$\text{Laba Bersih} = \sum \text{Omzet} - \left( \sum \text{Pasar} + \sum \text{Bahan Es} + \sum \text{Operasional} + \sum \text{Modal Adonan} \right)$$
- **Kinerja Jualan Es:** Menampilkan khusus total cup terjual, omzet es vs belanja bahan es, dan keuntungan bersih jualan es.
- **Ekspor & Cetak:** Ekspor data ke format CSV/Excel dan tombol cetak/simpan PDF ramah cetak.

### 7. Keamanan Data (Offline-First)
- Seluruh data tersimpan otomatis di perangkat lokal (LocalStorage).
- Tombol **Data** di navbar:
  - *Download File Cadangan (JSON)*
  - *Pulihkan Data dari File Cadangan*
  - *Muat Data Sampel Demo (7 Hari)*
  - *Hapus Bersih Data (Reset)*

---

## 🚀 Cara Menjalankan Aplikasi

### Persyaratan:
- Node.js (v18+ direkomendasikan)
- npm

### 1. Menjalankan Server Pengembangan (Dev):
```bash
npm run dev
```

Aplikasi dapat dibuka di browser:
- Di komputer: `http://localhost:5173/`
- Di smartphone (jaringan Wi-Fi yang sama): `http://<IP-Lokal-Komputer>:5173/` (contoh: `http://192.168.100.208:5173/`)

### 2. Membangun untuk Produksi (Build):
```bash
npm run build
```
File siap saji akan dibuat di folder `dist/`.

---

## 📱 PWA (Pasang di Layar Utama HP)
Aplikasi mendukung instalasi PWA:
- **Android (Chrome):** Buka link di Chrome $\rightarrow$ klik menu titik tiga di kanan atas $\rightarrow$ pilih **"Tambahkan ke Layar Utama" / "Install App"**.
- **iPhone (Safari):** Buka link di Safari $\rightarrow$ klik tombol **Share (kotak berpanah atas)** $\rightarrow$ pilih **"Add to Home Screen"**.
Aplikasi akan muncul seperti aplikasi native di HP Anda tanpa batas browser!


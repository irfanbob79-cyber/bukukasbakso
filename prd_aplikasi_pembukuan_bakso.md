# Product Requirement Document (PRD)

## Aplikasi Pembukuan & Manajemen Kas Warung Bakso Mandiri

### 1. Ringkasan Eksekutif & Tujuan Produk

* **Nama Produk (Tentatif):** *Bakso Josjis*

* **Target Pengguna:** Pemilik tunggal (solo owner) UMKM warung bakso tanpa kasir/karyawan admin.

* **Tujuan Utama:** Menggantikan pembukuan kertas manual menjadi aplikasi web/mobile yang ringkas, cepat diinput dengan satu tangan lewat ponsel, dan otomatis menghitung keuntungan bersih tanpa kerumitan pencatatan per butir/menu.

* **Platform Sasaran:** Responsive Web App (Mobile-first PWA) yang dapat dibuka mulus di browser smartphone maupun diinstal di layar utama (home screen).

### 2. Masalah & Solusi Kunci

| Masalah Operasional Lapangan | Solusi Sistem dalam Aplikasi | 
| ----- | ----- | 
| **Tidak mencatat per menu/porsi:** Pemilik sibuk melayani pembeli sehingga mustahil mencatat porsi satu per satu. | Input **Omzet Global Harian**: Pemilik cukup menghitung total uang tunai yang ada di laci saat tutup warung. | 
| **Adonan dibuat 2–3 hari sekali:** Biaya daging dan giling dikeluarkan sekaligus untuk masa pakai beberapa hari. | Modul **Batch Adonan**: Biaya adonan dicatat tersendiri dengan periode masa pakai (misal: Batch 1 untuk 3 hari), sehingga tidak merusak hitungan kas harian. | 
| **Banyak jenis pengeluaran kecil:** Belanja pasar (sayur/es) dan operasional (gas/plastik/sabun) sering tercampur. | **Kategori Belanja Fleksibel**: Pemisahan input instan untuk *Belanja Harian Pasar* dan *Biaya Lain-lain / Operasional*. | 
| **Transaksi 100% Tunai:** Belum membutuhkan integrasi gateway pembayaran perbankan/QRIS. | Arus kas disederhanakan murni berbasis **Uang Tunai (Cash-Flow)**: Uang Masuk vs. Uang Keluar. | 

### 3. Logika Bisnis & Formula Keuangan

1. **Sisa Kas Harian (Uang Fisik di Tangan):**
   

   $$
   \text{Sisa Kas Harian} = \text{Total Uang Masuk Tunai} - (\text{Belanja Pasar} + \text{Belanja Lain-lain})
   $$

2. **Total Modal Adonan per Batch:**
   

   $$
   \text{Modal Adonan} = \text{Biaya Daging/Tetelan} + \text{Bumbu/Tepung/Telur} + \text{Ongkos Giling} + \text{Biaya Terkait Lainnya}
   $$

3. **Keuntungan Bersih Riil (Periode Mingguan / Bulanan):**
   

   $$
   \text{Laba Bersih} = \sum \text{Uang Masuk} - \left( \sum \text{Belanja Pasar} + \sum \text{Belanja Lain-lain} + \sum \text{Modal Adonan} \right)
   $$

### 4. Fitur Utama & Kebutuhan Fungsional

#### Modul 1: Dashboard Ringkasan (Home)

* **Status Kas Hari Ini:**

  * Kartu Uang Masuk Harian.

  * Kartu Pengeluaran Harian (Pasar + Lain-lain).

  * Kartu Estimasi Uang Bersih hari ini.

* **Status Batch Adonan Aktif:**

  * Menampilkan batch adonan yang sedang berjalan (contoh: "Batch #4: Hari ke-2 dari 3 hari").

* **Tombol Cepat (Quick Action Floating Button):**

  * `+ Catat Penjualan Tutup Toko`

  * `+ Catat Belanja Harian / Lain-lain`

  * `+ Buat Batch Adonan Baru`

#### Modul 2: Pencatatan Penjualan Harian Global

* **Input Fields:**

  * Tanggal transaksi (default: hari ini).

  * Total Uang Masuk Tunai (input numerik besar dengan format mata uang otomatis `Rp`).

  * Catatan singkat opsional (contoh: *"Hujan deras sore hari"* atau *"Hari libur ramai"*).

* **Validasi:** Tidak boleh bernilai negatif; hanya boleh satu entri penjualan utama per hari (dapat diedit jika ada koreksi).

#### Modul 3: Pencatatan Pengeluaran (Belanja Pasar & Belanja Lain-lain)

* **Kategori Pengeluaran:**

  1. *Belanja Pasar Harian:* Sayuran (sawi, toge), bumbu dapur, es balok, kecap/saos, bihun/mie kuning.

  2. *Belanja Lain-lain:* Tabung gas LPG, kantong kresek/plastik kuah, mangkok/kertas bungkus, sabun cuci, sedotan/tusuk gigi.

* **Fitur Input Cepat (Multi-Item Entry):**

  * Pengguna bisa mengetik nama item belanja dan nominal biaya.

  * Tombol `+ Tambah Barang Belanja` untuk mencatat beberapa nota belanja sekaligus dalam satu kali simpan.

#### Modul 4: Manajemen Batch Adonan Bakso (Siklus 2–3 Hari)

* **Input Form Batch Adonan:**

  * Tanggal Pembuatan / Penggilingan.

  * Estimasi Masa Pakai (dropdown: 2 Hari, 3 Hari, atau 4 Hari).

  * Rincian Komponen Biaya:

    * Belanja Daging Sapi / Tetelan / Daging Ayam (Rp).

    * Bumbu, Tepung Premix, Telur, Es Batu Adonan (Rp).

    * Ongkos Penggilingan di Pasar (Rp).

    * Biaya Tambahan Adonan (ongkos bensin/plastik adonan) (Rp).

  * Kalkulasi Otomatis: Menghitung total modal batch adonan tersebut secara instan.

* **Riwayat Batch:** Daftar riwayat penggilingan adonan lampau beserta total biayanya.

#### Modul 5: Laporan & Rekapitulasi Laba Bersih

* **Filter Waktu:** 7 Hari Terakhir (Mingguan), Bulan Ini, atau Rentang Tanggal Manual.

* **Tabel / Kartu Rangkuman:**

  * Total Omzet Tunai.

  * Total Belanja Pasar.

  * Total Belanja Lain-lain.

  * Total Biaya Modal Seluruh Batch Adonan.

  * **Laba Bersih yang Masuk Kantong (Hasil Akhir).**

* **Opsi Ekspor:** Tombol simpan/cetak ringkasan ke format PDF atau format Excel/CSV sederhana.

### 5. Struktur Data & Skema Database (Lokal / SQLite / Supabase)

```
// Tabel: daily_sales (Penjualan Harian)
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "total_cash_income": 850000,
  "notes": "string (opsional)",
  "created_at": "timestamp"
}

// Tabel: expenses (Pengeluaran Operasional)
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "category": "MARKET" | "OPERATIONAL", // MARKET = Belanja Pasar, OPERATIONAL = Gas/Plastik/Lainnya
  "item_name": "Sawi, toge, es balok",
  "amount": 125000,
  "created_at": "timestamp"
}

// Tabel: dough_batches (Modal Adonan Berkala)
{
  "id": "uuid",
  "batch_number": 1,
  "grind_date": "YYYY-MM-DD",
  "estimated_days": 3,
  "meat_cost": 450000,
  "seasoning_flour_cost": 90000,
  "grinding_fee": 35000,
  "other_cost": 15000,
  "total_dough_cost": 590000,
  "notes": "string (opsional)",
  "created_at": "timestamp"
}

```

### 6. Desain Antarmuka & Pedoman UI/UX

1. **Prinsip Jempol (Thumb-Friendly):** Semua tombol aksi krusial diletakkan di bagian bawah layar smartphone agar mudah ditekan dengan satu tangan saat pemilik masih di warung.

2. **Ukuran Font Angka Jelas:** Angka nominal uang menggunakan ukuran besar (`text-xl` / `text-2xl`) dan warna kontras tinggi (Uang Masuk: Hijau gelap; Uang Keluar: Oranye/Merah bata; Laba Bersih: Biru dongker).

3. **Tanpa Form Rumit:** Kolom isian disederhanakan seminimal mungkin tanpa dropdown bertingkat yang memperlambat pekerjaan.

4. **Offline Capability (Penting untuk Lapangan):** Aplikasi tetap dapat dibuka dan diinput data meskipun sinyal internet di area pasar atau warung sedang tidak stabil (menggunakan LocalStorage / IndexedDB).

### 7. Prompt Siap Pakai untuk Antigravity / AI App Builder

Gunakan prompt terstruktur di bawah ini saat membuat aplikasi di Antigravity:

```
Buatkan aplikasi web responsive PWA "BukuBakso" untuk pembukuan UMKM warung bakso mandiri (single owner, 100% tunai, tanpa kasir).

Kebutuhan Utama:
1. Tidak ada rincian per menu/porsi. Penjualan harian hanya mencatat 'Total Uang Masuk Tunai (Rp)' global saat tutup warung.
2. Biaya operasional dibagi 2 kategori: 'Belanja Pasar Harian' (sayur, es, bumbu) dan 'Belanja Lain-lain' (gas LPG, kantong plastik, sabun, perlengkapan). Sediakan multi-input baris belanja.
3. Fitur khusus 'Batch Adonan Bakso (Siklus 2-3 Hari)': Form untuk mencatat modal giling (Biaya Daging, Tepung & Bumbu, Ongkos Giling, Biaya Lain) dengan estimasi masa pakai adonan.
4. Dashboard Utama: Menampilkan Kas Bersih Hari Ini, Status Batch Adonan Aktif, dan Riwayat Transaksi Terbaru.
5. Halaman Rekap Laba Bersih: Filter mingguan & bulanan yang otomatis menghitung: Total Uang Masuk dikurangi (Belanja Pasar + Belanja Lain-lain + Modal Adonan).
6. Tampilan mobile-first yang bersih, modern, kontras jelas, dan mudah diinput dengan satu tangan di HP. Gunakan Tailwind CSS.

```
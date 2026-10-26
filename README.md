# PWUTS_A04_25091397029 – NabungSampah (Kurir Penjemputan)

UTS Pemrograman Web – D4 Manajemen Informatika 2025
**Nama:** Lukman Hakim (25091397029) · **Kelompok:** 4 (A04) · **Proyek:** Pemetaan dan Penjemputan Bank Sampah Terintegrasi, Komplek Perumahan Puri Indah

## Fokus modul (Anggota 3)
Antarmuka **Kurir Penjemputan & Admin** (pendataan real-time lokasi & pemotongan tarif).

| Poin | File | Isi |
|---|---|---|
| 2.a | `index.html`, `css/style.css`, `js/app.js` | Homepage *mobile-first* responsif (Bootstrap 5 + CSS sendiri), ringkasan antrean harian, navigasi dimuat dengan Ajax (`$.load`) ke 2.b dan 2.c tanpa reload |
| 2.b | `pages/tugas.html` | Daftar tugas & alamat penjemputan (data tabel `pickup_requests`, `waste_types`, `waste_prices`), filter status, ubah status interaktif, simulator pendapatan bersih (kotor/bersih − flat Rp2.000), simulasi blokir login setelah 5 kali gagal |
| 2.c | `pages/form.html` | Form pendataan sampah real-time (`pickup_id`, `warga_id`, `jenis_id`, `kondisi`, `berat`, `total_harga`, `potongan_jemput`, `total_bersih`) dengan validasi jQuery dan popup hasil |

Data pendukung: `js/data.js`.

## Validasi form (2.c)
- Tugas penjemputan, jenis sampah, dan kondisi wajib dipilih.
- Berat harus > 0 dan ≤ 200 kg.
- Total harga harus ≥ Rp2.000 agar cukup dipotong tarif jemput.
- Jika valid: popup berhasil menampilkan total nominal bersih, status tugas menjadi *Selesai*, lalu kembali ke Daftar Tugas.

## Cara menjalankan
Ajax tidak berjalan lewat `file://`. Jalankan server lokal:

```
cd PWUTS_A04_25091397029
python -m http.server 8000
```
Buka `http://localhost:8000`.

## Catatan
- Harga per kg di `js/data.js` adalah **nilai contoh** (proposal tidak mencantumkan nominal); sampah bersih dibuat lebih mahal dari kotor. Admin dapat mengubahnya.
- Penyimpanan memakai `localStorage` sebagai pengganti server/database; pada versi lengkap `$.post` ke backend menggantikannya.
- Kata sandi simulasi login: `kurir123`.
- Sesuai proposal, hanya tiga jenis sampah: botol plastik, galon plastik, kardus.
- Warna dan font mengikuti Design Guideline proposal (putih, cokelat tua `#5D4037`, Segoe UI).

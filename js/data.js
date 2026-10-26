/* data.js - data simulasi (menggantikan tabel pickup_requests, waste_types, waste_prices, deposits)
   Disimpan di localStorage agar perubahan bertahan saat halaman dimuat ulang. */
(function (w) {
  var KEY = 'nabungsampah_kurir_v1';

  var DEFAULT = {
    tarifJemput: 2000, // potongan flat per penjemputan (Rp)
    // tabel waste_types
    jenis: [
      { id_jenis: 1, nama_jenis: 'Botol Plastik' },
      { id_jenis: 2, nama_jenis: 'Galon Plastik' },
      { id_jenis: 3, nama_jenis: 'Kardus' }
    ],
    // tabel waste_prices (Rp per kg). Nilai contoh: sampah bersih lebih mahal dari kotor.
    harga: {
      1: { kotor: 1500, bersih: 3000 },
      2: { kotor: 2000, bersih: 4000 },
      3: { kotor: 1000, bersih: 2000 }
    },
    // tabel pickup_requests (join users untuk nama & alamat warga)
    tugas: [
      { id_request: 101, warga_id: 11, nama: 'Bu Sari',     alamat: 'Blok A No. 5, Puri Indah',  jenis_id: 1, catatan: 'Ada di teras depan',      status: 'Menunggu' },
      { id_request: 102, warga_id: 12, nama: 'Pak Budi',    alamat: 'Blok B No. 12, Puri Indah', jenis_id: 3, catatan: 'Kardus sudah dilipat',    status: 'Menunggu' },
      { id_request: 103, warga_id: 13, nama: 'Bu Rina',     alamat: 'Blok C No. 3, Puri Indah',  jenis_id: 2, catatan: 'Bel rusak, ketuk pagar',  status: 'Menunggu' },
      { id_request: 104, warga_id: 14, nama: 'Pak Hendra',  alamat: 'Blok D No. 8, Puri Indah',  jenis_id: 1, catatan: '-',                       status: 'Selesai' },
      { id_request: 105, warga_id: 15, nama: 'Bu Wulan',    alamat: 'Blok A No. 21, Puri Indah', jenis_id: 3, catatan: 'Titip di pos satpam',     status: 'Menunggu' }
    ],
    // tabel deposits (+ deposit_items digabung per baris untuk kesederhanaan)
    setoran: [
      { id_deposit: 1, pickup_id: 104, warga_id: 14, jenis_id: 1, kondisi: 'bersih', berat: 4, total_harga: 12000, potongan_jemput: 2000, total_bersih: 10000, tgl_setor: '2026-10-25' }
    ]
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  w.NS = {
    load: function () {
      try {
        var raw = localStorage.getItem(KEY);
        if (raw) { return JSON.parse(raw); }
      } catch (e) { /* abaikan */ }
      return clone(DEFAULT);
    },
    save: function (data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* abaikan */ }
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
      return clone(DEFAULT);
    },
    rupiah: function (n) {
      return 'Rp' + Number(n).toLocaleString('id-ID');
    }
  };
})(window);

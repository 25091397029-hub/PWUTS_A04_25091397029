/* app.js - layout utama, routing Ajax (jQuery .load), tugas 2.b dan 2.c */
$(function () {
  var db = NS.load();
  var MAX_GAGAL = 5;
  var gagal = 0;
  var filterAktif = 'semua';

  /* ---------- Util ---------- */
  function namaJenis(id) {
    var j = db.jenis.filter(function (x) { return x.id_jenis == id; })[0];
    return j ? j.nama_jenis : '-';
  }
  function hitung(jenisId, kondisi, berat) {
    var h = db.harga[jenisId] ? db.harga[jenisId][kondisi] : 0;
    var total = Math.round((h || 0) * (parseFloat(berat) || 0));
    return { harga: h || 0, total: total, potong: db.tarifJemput, bersih: total - db.tarifJemput };
  }
  function esc(s) { return $('<div>').text(s).html(); }
  function pill(status) {
    return '<span class="pill pill-' + status.toLowerCase() + '">' + status + '</span>';
  }

  /* ---------- Popup ---------- */
  var popupCb = null;
  function popup(ok, title, html, cb) {
    $('#popupIcon').attr('class', 'modal-icon ' + (ok ? 'ok' : 'err')).text(ok ? '✓' : '!');
    $('#popupTitle').text(title);
    $('#popupBody').html(html);
    popupCb = cb || null;
    $('#popup').prop('hidden', false);
    $('#popupOk').trigger('focus');
  }
  $('#popupOk').on('click', function () {
    $('#popup').prop('hidden', true);
    if (popupCb) { var f = popupCb; popupCb = null; f(); }
  });

  /* ---------- Ringkasan (2.a) ---------- */
  function updateStats() {
    var total = db.tugas.length;
    var tunggu = db.tugas.filter(function (t) { return t.status === 'Menunggu'; }).length;
    var bersih = db.setoran.reduce(function (a, s) { return a + s.total_bersih; }, 0);
    $('#statTotal').text(total);
    $('#statMenunggu').text(tunggu);
    $('#statSelesai').text(total - tunggu);
    $('#statBersih').text(NS.rupiah(bersih));
  }
  $('#tanggalHariIni').text(new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));

  /* ---------- Routing Ajax ---------- */
  var routes = { beranda: 'pages/beranda.html', tugas: 'pages/tugas.html', form: 'pages/form.html' };

  function setActive(key) {
    $('.nav-link-app').removeClass('active').filter(function () {
      return $(this).attr('href') === '#' + key;
    }).addClass('active');
  }

  function loadPage(key) {
    if (!routes[key]) { key = 'beranda'; }
    setActive(key);
    $('#mainNav').removeClass('open');
    $('#btnMenu').attr('aria-expanded', 'false');
    $('#content').html('<div class="text-center text-muted py-5">Memuat...</div>');
    $('#content').load(routes[key], function (resp, status) {
      if (status === 'error') {
        $('#content').html('<div class="alert alert-danger">Gagal memuat halaman. Jalankan lewat server HTTP (mis. <code>python -m http.server</code>), bukan file://.</div>');
        return;
      }
      if (key === 'beranda') { initBeranda(); }
      if (key === 'tugas') { initTugas(); }
      if (key === 'form') { initForm(); }
      updateStats();
    });
  }

  $(document).on('click', 'a[data-page]', function (e) {
    e.preventDefault();
    var key = ($(this).attr('href') || '#beranda').replace('#', '');
    if (location.hash === '#' + key) { loadPage(key); } else { location.hash = key; }
  });
  $(window).on('hashchange', function () { loadPage(location.hash.replace('#', '') || 'beranda'); });

  $('#btnMenu').on('click', function () {
    var open = $('#mainNav').toggleClass('open').hasClass('open');
    $(this).attr('aria-expanded', open);
  });

  /* ---------- Beranda ---------- */
  function initBeranda() {
    var $w = $('#antreanBeranda').empty();
    var tunggu = db.tugas.filter(function (t) { return t.status === 'Menunggu'; });
    if (!tunggu.length) { $w.html('<p class="text-muted">Semua tugas sudah selesai.</p>'); return; }
    tunggu.forEach(function (t) {
      $w.append('<div class="sub-card d-flex justify-content-between align-items-center gap-2">' +
        '<div><strong>' + esc(t.nama) + '</strong><br><small class="text-muted">' + esc(t.alamat) + ' &middot; ' + namaJenis(t.jenis_id) + '</small></div>' +
        '<a href="#form" data-page="pages/form.html" class="btn btn-sm btn-primary-app" data-pilih="' + t.id_request + '">Data</a></div>');
    });
  }
  $(document).on('click', '[data-pilih]', function () { sessionStorage.setItem('pilihTugas', $(this).data('pilih')); });

  /* ---------- Tugas 2.b: Daftar Tugas ---------- */
  function renderTugas() {
    var $b = $('#tbodyTugas').empty();
    var list = db.tugas.filter(function (t) { return filterAktif === 'semua' || t.status === filterAktif; });
    if (!list.length) { $b.append('<tr><td colspan="6" class="text-center text-muted">Tidak ada tugas.</td></tr>'); return; }
    list.forEach(function (t) {
      var aksi = '<button type="button" class="btn btn-sm btn-secondary-app btn-toggle" data-id="' + t.id_request + '">Ubah Status</button> ';
      if (t.status === 'Menunggu') {
        aksi += '<a href="#form" data-page="pages/form.html" class="btn btn-sm btn-primary-app" data-pilih="' + t.id_request + '">Data</a>';
      }
      $b.append('<tr>' +
        '<td data-label="ID">#' + t.id_request + '</td>' +
        '<td data-label="Warga &amp; Alamat"><strong>' + esc(t.nama) + '</strong><br>' + esc(t.alamat) + '</td>' +
        '<td data-label="Jenis">' + namaJenis(t.jenis_id) + '</td>' +
        '<td data-label="Catatan">' + esc(t.catatan) + '</td>' +
        '<td data-label="Status">' + pill(t.status) + '</td>' +
        '<td data-label="Aksi">' + aksi + '</td></tr>');
    });
  }

  function simHitung() {
    var h = hitung($('#simJenis').val(), $('#simKondisi').val(), $('#simBerat').val());
    $('#simHarga').text(NS.rupiah(h.harga));
    $('#simTotal').text(NS.rupiah(h.total));
    $('#simPotong').text('-' + NS.rupiah(h.potong));
    $('#simBersih').text(h.bersih < 0 ? '-' + NS.rupiah(-h.bersih) : NS.rupiah(h.bersih))
      .toggleClass('text-danger', h.bersih < 0).toggleClass('text-success', h.bersih >= 0);
  }

  function initTugas() {
    filterAktif = 'semua';
    renderTugas();
    db.jenis.forEach(function (j) { $('#simJenis').append('<option value="' + j.id_jenis + '">' + j.nama_jenis + '</option>'); });
    simHitung();
    gagal = 0;
    $('#simGagal').text(0);
  }

  $(document).on('click', '.filter-btn', function () {
    filterAktif = $(this).data('filter');
    $('.filter-btn').removeClass('btn-primary-app').addClass('btn-secondary-app');
    $(this).removeClass('btn-secondary-app').addClass('btn-primary-app');
    renderTugas();
  });

  $(document).on('click', '.btn-toggle', function () {
    var id = $(this).data('id');
    db.tugas.forEach(function (t) {
      if (t.id_request == id) { t.status = (t.status === 'Menunggu') ? 'Selesai' : 'Menunggu'; }
    });
    NS.save(db);
    renderTugas();
    updateStats();
  });

  $(document).on('input change', '#simJenis, #simKondisi, #simBerat', simHitung);

  $(document).on('click', '#btnSimLogin', function () {
    var $msg = $('#simPesan');
    if (gagal >= MAX_GAGAL) { $msg.attr('class', 'small mt-1 text-danger').text('Akun diblokir. Hubungi admin atau tekan Reset.'); return; }
    if ($('#simPass').val() === 'kurir123') {
      gagal = 0; $('#simGagal').text(0);
      $msg.attr('class', 'small mt-1 text-success').text('Login berhasil.');
    } else {
      gagal++; $('#simGagal').text(gagal);
      if (gagal >= MAX_GAGAL) { $msg.attr('class', 'small mt-1 text-danger').text('Gagal 5 kali berturut-turut. Akun diblokir.'); }
      else { $msg.attr('class', 'small mt-1 text-warning-emphasis').text('Kata sandi salah. Sisa percobaan: ' + (MAX_GAGAL - gagal) + '.'); }
    }
    $('#simPass').val('');
  });
  $(document).on('click', '#btnSimReset', function () {
    gagal = 0; $('#simGagal').text(0); $('#simPesan').text(''); $('#simPass').val('');
  });

  /* ---------- Tugas 2.c: Form Pendataan ---------- */
  function hariIni() { return new Date().toISOString().slice(0, 10); }

  function hitungForm() {
    var h = hitung($('#jenis_id').val(), $('input[name=kondisi]:checked').val(), $('#berat').val());
    $('#total_harga').val(NS.rupiah(h.total));
    $('#potongan_jemput').val(NS.rupiah(h.potong));
    $('#total_bersih').val(h.bersih < 0 ? '-' + NS.rupiah(-h.bersih) : NS.rupiah(h.bersih));
    return h;
  }

  function isiTugas() {
    var id = $('#pickup_id').val();
    var t = db.tugas.filter(function (x) { return x.id_request == id; })[0];
    if (t) {
      $('#warga_id').val(t.warga_id);
      $('#alamat').val(t.nama + ' - ' + t.alamat);
      $('#jenis_id').val(t.jenis_id);
    } else {
      $('#warga_id, #alamat').val('');
    }
    hitungForm();
  }

  function initForm() {
    var $p = $('#pickup_id').empty().append('<option value="">-- Pilih tugas --</option>');
    db.tugas.filter(function (t) { return t.status === 'Menunggu'; }).forEach(function (t) {
      $p.append('<option value="' + t.id_request + '">#' + t.id_request + ' - ' + esc(t.nama) + '</option>');
    });
    var $j = $('#jenis_id').empty().append('<option value="">-- Pilih jenis --</option>');
    db.jenis.forEach(function (j) { $j.append('<option value="' + j.id_jenis + '">' + j.nama_jenis + '</option>'); });
    $('#tgl_setor').val(hariIni());
    var pre = sessionStorage.getItem('pilihTugas');
    if (pre) { $p.val(pre); sessionStorage.removeItem('pilihTugas'); }
    isiTugas();
  }

  $(document).on('change', '#pickup_id', isiTugas);
  $(document).on('input change', '#jenis_id, input[name=kondisi], #berat', function () {
    hitungForm();
    $(this).removeClass('is-invalid');
  });
  $(document).on('click', '#btnResetForm', function () {
    setTimeout(function () { $('.is-invalid').removeClass('is-invalid'); $('.invalid-msg').hide(); isiTugas(); }, 0);
  });

  $(document).on('submit', '#formSetoran', function (e) {
    e.preventDefault();
    var ok = true;
    $('.is-invalid').removeClass('is-invalid');
    $('#msgKondisi, #msgTotal').hide();

    if (!$('#pickup_id').val()) { $('#pickup_id').addClass('is-invalid'); ok = false; }
    if (!$('#jenis_id').val()) { $('#jenis_id').addClass('is-invalid'); ok = false; }
    var kondisi = $('input[name=kondisi]:checked').val();
    if (!kondisi) { $('#msgKondisi').show(); ok = false; }

    var berat = parseFloat($('#berat').val());
    if (isNaN(berat) || berat <= 0) {
      $('#msgBerat').text('Berat harus lebih dari 0 kg.');
      $('#berat').addClass('is-invalid'); ok = false;
    } else if (berat > 200) {
      $('#msgBerat').text('Berat maksimal 200 kg per penjemputan.');
      $('#berat').addClass('is-invalid'); ok = false;
    }

    if (ok) {
      var h = hitungForm();
      if (h.total < db.tarifJemput) {
        $('#msgTotal').text('Total harga ' + NS.rupiah(h.total) + ' belum cukup untuk dipotong tarif jemput ' + NS.rupiah(db.tarifJemput) + '.').show();
        ok = false;
      }
    }
    if (!ok) {
      popup(false, 'Data belum valid', 'Periksa kembali isian yang ditandai merah.');
      return;
    }

    // Simulasi submit ke server: pada versi produksi diganti $.post('api/setoran', data)
    var h2 = hitungForm();
    var pid = parseInt($('#pickup_id').val(), 10);
    db.setoran.push({
      id_deposit: db.setoran.length + 1,
      pickup_id: pid,
      warga_id: parseInt($('#warga_id').val(), 10),
      jenis_id: parseInt($('#jenis_id').val(), 10),
      kondisi: kondisi,
      berat: berat,
      total_harga: h2.total,
      potongan_jemput: h2.potong,
      total_bersih: h2.bersih,
      tgl_setor: hariIni()
    });
    db.tugas.forEach(function (t) { if (t.id_request === pid) { t.status = 'Selesai'; } });
    NS.save(db);
    updateStats();

    popup(true, 'Data berhasil disimpan',
      'Total harga: <strong>' + NS.rupiah(h2.total) + '</strong><br>' +
      'Potongan jemput: <strong>-' + NS.rupiah(h2.potong) + '</strong><br>' +
      'Total nominal bersih: <strong>' + NS.rupiah(h2.bersih) + '</strong>',
      function () { location.hash = 'tugas'; });
  });

  /* ---------- Mulai ---------- */
  updateStats();
  loadPage(location.hash.replace('#', '') || 'beranda');
});

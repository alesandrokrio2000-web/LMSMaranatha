/* =========================================================
   tes.js - Pretest (soal lokal) & Postest (soal dari Supabase,
   hanya tersedia saat dibuka oleh admin)
   ========================================================= */
const TES = { Pretest: SOAL_PRETEST, Postest: [] };

function renderSoal(j) {
  $('#soal' + j).innerHTML = TES[j].map((s, i) =>
    `<div class="q"><p>${i + 1}. ${s.q}</p>` +
    s.o.map((t, k) => [t, k]).sort(() => Math.random() - .5)       // acak urutan pilihan
      .map(([t, k]) => `<label class="opt"><input type="radio" name="${j}${i}" value="${k}">${t}</label>`).join('') +
    '</div>').join('');
  $('#msg' + j).className = 'msg';
}

async function nilai(j) {
  const nama = $('#nama' + j).value.trim(), m = $('#msg' + j), soal = TES[j];
  if (!nama) return say(m, 'Isi nama terlebih dahulu.');
  let benar = 0, kosong = 0;
  soal.forEach((s, i) => {
    const c = document.querySelector(`input[name="${j}${i}"]:checked`);
    c ? (+c.value === s.a && benar++) : kosong++;
  });
  if (kosong) return say(m, `Masih ada ${kosong} soal yang belum dijawab.`);

  const skor = Math.round(benar / soal.length * 100);
  m.className = 'msg ok';
  m.innerHTML = `${j} selesai. Benar ${benar} dari ${soal.length}<div class="score">${skor}</div>`;
  if (db) {
    const { error } = await db.from('hasil_tes').insert({ nama, jenis: j, skor });
    if (error) m.innerHTML += `<small>(Skor gagal disimpan: ${error.message})</small>`;
  }
}

/* ---------- Postest: cek apakah sudah dibuka admin ---------- */
async function cekPostest() {
  const lock = $('#postestLock'), form = $('#postestForm');
  const kunci = pesan => { $('#lockMsg').textContent = pesan; lock.classList.remove('hidden'); form.classList.add('hidden'); };
  if (!db) return kunci('Supabase belum dikonfigurasi.');

  const { data } = await db.from('pengaturan').select('nilai').eq('kunci', 'postest_aktif').maybeSingle();
  if (!data || data.nilai !== 'true') return kunci('Postest akan dibuka oleh admin setelah sesi pelatihan selesai.');

  const { data: rows, error } = await db.from('soal_postest').select('*').order('no');
  if (error || !rows || !rows.length) return kunci('Soal Postest belum tersedia. Hubungi admin.');

  TES.Postest = rows.map(r => ({ q: r.pertanyaan, o: r.opsi, a: r.jawaban }));
  renderSoal('Postest');
  lock.classList.add('hidden'); form.classList.remove('hidden');
}

$('#btnPretest').onclick = () => nilai('Pretest');
$('#btnPostest').onclick = () => nilai('Postest');
$('#btnCekPostest').onclick = cekPostest;
renderSoal('Pretest');

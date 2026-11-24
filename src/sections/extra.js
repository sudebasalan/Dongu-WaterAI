/**
 * DÖNGÜ — Yeni bölümler: Su İzim uygulaması, Değer Akış Haritası,
 * Maliyet & Uygulanabilirlik, Yol Haritası, Kaynaklar
 */
import { VALUE_STREAM, WATER_DATA } from '../data/config.js';

// ── SU İZİM UYGULAMASI ─────────────────────────────────────────────────────
const APP_FEATURES = [
  { icon: '📅', title: 'Günlük özet', text: `Kişi başı günlük tüketim ve ulusal hedef olan ${WATER_DATA.nationalDailyTargetLiters} litre ile karşılaştırma.` },
  { icon: '🧩', title: 'Alan dağılımı', text: 'Mutfak, banyo, tuvalet ve çamaşır için ayrı ayrı kullanım.' },
  { icon: '🕒', title: 'Saatlik harita', text: 'Gün içinde suyun en çok hangi saatlerde kullanıldığı.' },
  { icon: '🏘️', title: 'Mahalle karşılaştırması', text: 'Kimlik gizli kalarak çevredeki evlerle anonim kıyas.' },
  { icon: '💡', title: 'Kişisel öneriler', text: '“Duş sürenizi 2 dakika kısaltırsanız ayda yaklaşık X litre tasarruf edersiniz.”' },
  { icon: '🗓️', title: 'Takvim', text: 'Vardiya, tatil, misafir gibi istisnaları bildirme; yanlış alarmı önler.' },
  { icon: '🚨', title: 'Uyarılar', text: 'Bilgi, uyarı ve acil olmak üzere üç seviyeli kaçak ve arıza bildirimleri.' },
  { icon: '🔄', title: 'Döngü Oranı', text: 'Kullandığınız suyun ne kadarının ilçenizin arıtma tesisinde arıtılıp şehre geri döndüğü.' },
];

export function renderAppFeatures() {
  const grid = document.getElementById('app-features');
  if (!grid) return;
  grid.innerHTML = APP_FEATURES.map(f => `
    <div class="card app-feature fade-up">
      <div class="app-feature-icon" aria-hidden="true">${f.icon}</div>
      <h4>${f.title}</h4>
      <p>${f.text}</p>
    </div>`).join('');
}

// ── DEĞER AKIŞ HARİTASI ────────────────────────────────────────────────────
const fmt = n => Number(n).toLocaleString('tr-TR');

export function initValueStream() {
  const root = document.getElementById('vsm-root');
  if (!root) return;

  root.innerHTML = `
    <div class="vsm-toggle" role="tablist" aria-label="Durum seçimi">
      <button class="vsm-btn is-on" role="tab" aria-selected="true" data-state="current">${VALUE_STREAM.current.label}</button>
      <button class="vsm-btn" role="tab" aria-selected="false" data-state="future">${VALUE_STREAM.future.label}</button>
    </div>

    <div class="vsm-info"><strong>Bilgi akışı</strong><span data-k="info"></span></div>

    <div class="vsm-flow" aria-label="Su akışı">
      <div class="vsm-box"><span class="vsm-name">Baraj</span><span class="vsm-val"><b data-k="dam"></b> L çekilir</span></div>
      <div class="vsm-arrow" aria-hidden="true">→</div>
      <div class="vsm-box is-loss"><span class="vsm-name">Şebeke</span><span class="vsm-val"><b data-k="networkLoss"></b> L kayıp</span></div>
      <div class="vsm-arrow" aria-hidden="true">→</div>
      <div class="vsm-box"><span class="vsm-name">Daire girişi</span><span class="vsm-val"><b data-k="home"></b> L</span></div>
      <div class="vsm-arrow" aria-hidden="true">→</div>
      <div class="vsm-box"><span class="vsm-name">Kullanım</span><span class="vsm-val"><b data-k="useful"></b> L faydalı</span></div>
      <div class="vsm-arrow" aria-hidden="true">→</div>
      <div class="vsm-box"><span class="vsm-name">Atık su</span><span class="vsm-val"><b data-k="sewer"></b> L <span data-k="sewerVerb"></span></span></div>
    </div>

    <div class="vsm-lower">
      <div class="vsm-box is-loss"><span class="vsm-name">Evde kaçak</span><span class="vsm-val"><b data-k="leak"></b> L/gün</span></div>
      <div class="vsm-box is-loop" data-loop>
        <span class="vsm-name">İlçe arıtma tesisi</span>
        <span class="vsm-val"><b data-k="returned"></b> L arıtılıp şehre geri döner (park, sokak, sanayi)</span>
      </div>
    </div>

    <div class="vsm-lead">Kaçağı fark etme süresi: <strong data-k="leadTime"></strong></div>

    <div class="vsm-metrics">
      <div class="vsm-metric"><span>Şebeke suyu / daire / gün</span><strong><span data-k="home"></span> L</strong></div>
      <div class="vsm-metric"><span>Kişi başı / gün</span><strong><span data-k="perCapita"></span> L</strong></div>
      <div class="vsm-metric"><span>Barajdan çekilen</span><strong><span data-k="dam"></span> L</strong></div>
      <div class="vsm-metric"><span>Döngü oranı</span><strong>%<span data-k="cycleRate"></span></strong></div>
    </div>
    <p class="vsm-note">Örnek: 4 kişilik daire, günlük değerler. Varsayımlar: kişi başı 150 L/gün, şebeke kaybı %${WATER_DATA.turkeyNetworkLossPct},
      ilçe tesisinde geri kazanım payı %${WATER_DATA.cityReusePct} (Türkiye'nin 2030 hedefi). Gerçek değerler pilot uygulamada ölçülecektir.</p>`;

  function setState(key) {
    const d = VALUE_STREAM[key];
    root.querySelectorAll('[data-k]').forEach(el => {
      const v = d[el.dataset.k];
      el.textContent = typeof v === 'number' ? fmt(v) : (v ?? '–');
    });
    root.querySelector('[data-loop]').classList.toggle('is-hidden', !d.loop);
    root.querySelectorAll('.vsm-btn').forEach(b => {
      const on = b.dataset.state === key;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    root.classList.toggle('is-future', key === 'future');
  }

  root.querySelectorAll('.vsm-btn').forEach(b => b.addEventListener('click', () => setState(b.dataset.state)));
  setState('current');
}

const WASTES = [
  ['Şebeke kaybı', 'Su daireye ulaşmadan kaybolur.'],
  ['Kaçak', 'Sessiz damlama ve akan rezervuar.'],
  ['Aşırı kullanım', 'Gereğinden uzun duş, açık bırakılan musluk.'],
  ['Tek kullanımlık atım', 'Kullanılan su arıtılsa bile yeniden kullanılmadan doğaya bırakılır.'],
  ['Yanlış kalitede kullanım', 'Park sulamada ve sokak temizliğinde içme suyu kullanılır.'],
  ['Bilgi gecikmesi', 'Sorun ancak 30 gün sonra faturayla fark edilir.'],
  ['Gereksiz enerji', 'Kaybolan su için de pompalama ve arıtma yapılır.'],
];

export function renderWastes() {
  const el = document.getElementById('vsm-wastes');
  if (!el) return;
  el.innerHTML = WASTES.map(([t, d], i) => `
    <li class="waste-item fade-up"><span class="waste-no">${i + 1}</span><div><strong>${t}</strong><span>${d}</span></div></li>`).join('');
}

// ── MALİYET & UYGULANABİLİRLİK ─────────────────────────────────────────────
const COST_PRINCIPLES = [
  { icon: '📡', title: 'Tek sensör', text: 'Her musluğa değil, yalnızca sayaç yanına bir sensör.' },
  { icon: '🔧', title: 'Kolay kurulum', text: 'Tesisatı kırmaya ya da sayacı değiştirmeye gerek yok.' },
  { icon: '🏭', title: 'İlçe/şehir ölçeğinde arıtma', text: 'Büyük tesiste birim maliyet düşer; mevcut atık su tesisleri genişletilebilir.' },
  { icon: '📏', title: 'Veriyle planlama', text: 'Tesise gelecek yük gerçek kullanım verisiyle tahmin edilir; gereksiz kapasite kurulmaz.' },
  { icon: '🛰️', title: 'Uzaktan izleme', text: 'Bakım ekibi yalnızca gerektiğinde sahaya gider.' },
];
const WINNERS = [
  { who: 'Ev sahibi ve kiracı', what: 'Daha düşük fatura, erken kaçak uyarısı, su hasarından korunma' },
  { who: 'Bina yönetimi', what: 'Ortak tesisat kaçağının bulunması, daha düşük ortak gider' },
  { who: 'Belediye', what: 'Talep tahmini, kayıp-kaçakla mücadele, ulusal su hedeflerine katkı' },
];

export function renderCost() {
  const p = document.getElementById('cost-principles');
  const w = document.getElementById('cost-winners');
  if (p) p.innerHTML = COST_PRINCIPLES.map(c => `
    <div class="card cost-card fade-up"><div class="app-feature-icon" aria-hidden="true">${c.icon}</div><h4>${c.title}</h4><p>${c.text}</p></div>`).join('');
  if (w) w.innerHTML = WINNERS.map(x => `
    <div class="winner fade-up"><strong>${x.who}</strong><span>${x.what}</span></div>`).join('');
}

// ── YOL HARİTASI ───────────────────────────────────────────────────────────
const ROADMAP = [
  { phase: '1. Prototip', time: 'Hackathon', text: 'Sensör prototipi, örnek veriyle kullanım ayırma modeli, Su İzim uygulama maketi.' },
  { phase: '2. Pilot bina', time: '0–6 ay', text: '1 apartmanda (20–40 daire) sensör kurulumu, öğrenme dönemi, kaçak uyarıları.' },
  { phase: '3. Arıtma entegrasyonu', time: '6–12 ay', text: 'Pilot ilçenin atık su arıtma tesisiyle veri bağlantısı; geri kazanılan suyun uygulamada Döngü Oranı olarak gösterilmesi.' },
  { phase: '4. İlçe', time: '12–24 ay', text: 'İlçe genelinde binalar, ilçe su karnesi, tesis yük tahmini ve belediye ile anonim veri paylaşımı.' },
  { phase: '5. Şehir', time: '24+ ay', text: 'Belediye ve su idaresiyle ölçekleme.' },
];

export function renderRoadmap() {
  const el = document.getElementById('roadmap-list');
  if (!el) return;
  el.innerHTML = ROADMAP.map(r => `
    <li class="roadmap-item fade-up">
      <div class="roadmap-dot" aria-hidden="true"></div>
      <div class="roadmap-time">${r.time}</div>
      <h4>${r.phase}</h4>
      <p>${r.text}</p>
    </li>`).join('');
}

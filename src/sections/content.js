/**
 * DÖNGÜ — İçerik render fonksiyonları — config.js'ten veri okur ve DOM'a yazar
 */
import { TEAM, LOGOS, PROJECT, WATER_DATA, TARIFF } from '../data/config.js';

// ── LOGOLAR ────────────────────────────────────────────────────────────────
function logoItem(src, name) {
  const div = document.createElement('div');
  div.className = 'logo-item';
  const img = new Image();
  img.src = src;
  img.alt = name + ' logosu';
  img.onload = () => div.appendChild(img);
  img.onerror = () => {
    const ph = document.createElement('div');
    ph.className = 'logo-placeholder';
    ph.textContent = name;
    div.appendChild(ph);
  };
  return div;
}

export function renderLogos(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';
  el.appendChild(logoItem(LOGOS.wilo, 'Wilo Türkiye'));
  el.appendChild(logoItem(LOGOS.imece, 'imece'));
}

// ── TAKIM ──────────────────────────────────────────────────────────────────
export function renderTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const avatarEmojis = ['🧑‍💻', '⚙️', '🎨'];

  TEAM.members.forEach((m, i) => {
    const card = document.createElement('div');
    card.className = 'team-card fade-up';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', `${m.name} — ${m.role}`);

    const photoHTML = `
      <div class="team-photo" aria-hidden="true">
        <img src="${m.photo}" alt="${m.name} fotoğrafı" onerror="this.style.display='none'; this.parentElement.innerHTML='${avatarEmojis[i]}';" />
      </div>`;

    card.innerHTML = `
      <div class="team-card-inner">
        ${photoHTML}
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role}</div>
        <div class="team-uni">${m.university}</div>
        <p class="team-contribution">${m.contribution}</p>
      </div>`;
    grid.appendChild(card);
  });
}

// ── PROBLEM İSTATİSTİKLERİ ──────────────────────────────────────────────────
export function renderProblemStats() {
  const container = document.getElementById('problem-stats-cards');
  if (!container) return;

  container.innerHTML = `
    <div class="problem-stat fade-up">
      <div>
        <div class="stat-number">38 <span style="font-size:1.5rem">Ton</span></div>
        <div class="stat-unit">/ev/yıl kaçak israfı</div>
      </div>
      <div>
        <p style="font-size:0.9rem; color:var(--gray-300);">Ortalama bir evde sızıntı ve kaçakların yıllık su israfı (~10.000 galon).</p>
        <span class="source-label">${WATER_DATA.sourceEPA}</span>
      </div>
    </div>

    <div class="problem-stat fade-up">
      <div>
        <div class="stat-number">%32</div>
        <div class="stat-unit">şebeke su kaybı</div>
      </div>
      <div>
        <p style="font-size:0.9rem; color:var(--gray-300);">Türkiye genelinde şebekede kaybolan su oranı (2023). Su hem şebekede hem evde kayboluyor.</p>
        <span class="source-label">${WATER_DATA.sourceTurkey}</span>
      </div>
    </div>

    <div class="problem-stat fade-up">
      <div>
        <div class="stat-number">120 <span style="font-size:1.5rem">L</span></div>
        <div class="stat-unit">kişi/gün ulusal hedef</div>
      </div>
      <div>
        <p style="font-size:0.9rem; color:var(--gray-300);">2026–2035 Ulusal Su Planı 2030 hedefi. Şu anki tüketim ortalama 130 L. Ölçmediğimizi azaltamayız.</p>
        <span class="source-label">${WATER_DATA.sourceTurkey}</span>
      </div>
    </div>
  `;
}

// ── NEDEN KARTLARI ─────────────────────────────────────────────────────────
const WHY_ITEMS = [
  {
    icon: '📊',
    title: 'Fatura Neden Harcadığımızı Söylemez',
    text: 'Fatura yalnızca ne kadar harcadığımızı söyler. Mutfakta mı, duşta mı, yoksa görünmeyen bir sızıntıda mı kaybolduğunu bilemeyiz.',
  },
  {
    icon: '🚽',
    title: 'Görünmeyen Gizli Kaçaklar',
    text: 'Klozet rezervuarı sessizce akar, musluk saniyede bir damlar. Evlerin %9\'unda günde 190 litreyi aşan gizli kaçak vardır.',
  },
  {
    icon: '🔄',
    title: 'Kullanılan Suyun Kaybolması',
    text: 'Kullanılan su kanalizasyona gidip çoğu zaman tek kullanımda kaybolur. Oysa ilçe ya da şehir ölçeğinde arıtılıp parklarda, sokak temizliğinde ve sanayide yeniden kullanılabilir.',
  },
  {
    icon: '🔔',
    title: 'Basit Yöntemlerin Yetersizliği',
    text: 'Sabit eşikler küçük sızıntıları yakalayamaz; gece sıfır kuralı hidroforlu veya vardiyalı binalarda sürekli yanlış alarm üretir.',
  },
];

export function renderWhy() {
  const grid = document.getElementById('why-grid');
  if (!grid) return;
  grid.innerHTML = '';
  WHY_ITEMS.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'why-card fade-up';
    card.innerHTML = `
      <div class="why-icon" aria-hidden="true">${item.icon}</div>
      <div class="why-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</div>
      <h4>${item.title}</h4>
      <p>${item.text}</p>`;
    grid.appendChild(card);
  });
}

// ── SU İMZALARI VE CİHAZ TANIMA (HYDROSENSE) ────────────────────────────────
const SIGNATURE_ITEMS = [
  {
    icon: '🚽',
    device: 'Tuvalet Rezervuarı',
    flowType: 'Ani Yüksek Debi + Dolum',
    desc: 'Kısa, yüksek debili sifon akışı ve ardından rezervuarın 40–60 saniyelik sabit dolma döngüsü.',
  },
  {
    icon: '🚿',
    device: 'Duş & Banyo',
    flowType: 'Uzun & Sabit Sürekli Akış',
    desc: '6–12 dakika kesintisiz, 7–9 L/dk stabil profil. Tipik sabah ve akşam tepe saatleri.',
  },
  {
    icon: '🧺',
    device: 'Çamaşır / Bulaşık',
    flowType: 'Periyodik Darbeli Dolumlar',
    desc: '15–20 dakika aralıklarla tekrarlayan 3–4 kademeli su alma döngüsü ve ventil vuruş basıncı.',
  },
  {
    icon: '🚰',
    device: 'Mutfak Musluğu',
    flowType: 'Kısa & Sık Açma-Kapamalar',
    desc: '10–45 saniyelik çoklu tetiklemeler, değişken debi seviyeleri ve sık vana kapatma vuruşu.',
  }
];

export function renderSignatures() {
  const container = document.getElementById('signatures-grid');
  if (!container) return;
  container.innerHTML = '';

  SIGNATURE_ITEMS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card signature-card fade-up';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <span style="font-size:2rem;">${s.icon}</span>

      </div>
      <h4 style="margin-bottom:0.25rem;">${s.device}</h4>
      <div style="font-size:0.78rem; font-weight:600; color:var(--teal); text-transform:uppercase; margin-bottom:0.5rem;">${s.flowType}</div>
      <p style="font-size:0.88rem; color:var(--gray-300);">${s.desc}</p>
    `;
    container.appendChild(card);
  });
}

// ── 3 SEVİYELİ UYARI KARTLARI ───────────────────────────────────────────────
const ALERT_LEVELS = [
  {
    level: '🟢 1. Seviye: Bilgi',
    border: 'rgba(46,158,107,0.4)',
    bg: 'rgba(46,158,107,0.08)',
    badge: 'Farkındalık & Koçluk',
    title: 'Haftalık Su Ritmi Değişimi',
    example: '"Bu hafta duş kullanımınız %20 arttı. Günlük ortalamanız 128 litreye ulaştı (Ulusal hedef: 120 L)."',
    action: 'Davranışsal geri bildirim'
  },
  {
    level: '🟡 2. Seviye: Uyarı',
    border: 'rgba(237,174,73,0.4)',
    bg: 'rgba(237,174,73,0.08)',
    badge: 'Gizli Kaçak Tespiti',
    title: 'Sıfırlanmayan Akış & Anomali',
    example: '"Gece 03:00\'te bile akış sıfıra inmiyor (0,08 L/dk). Rezervuarda sızıntı tespit edildi. Ayda ~45 TL israf."',
    action: 'Kullanıcıya bakım önerisi'
  },
  {
    level: '🔴 3. Seviye: Acil',
    border: 'rgba(209,73,91,0.5)',
    bg: 'rgba(209,73,91,0.1)',
    badge: 'Boru Patlağı / Unutulan Vana',
    title: 'Yüksek Risk & Otomatik Koruma',
    example: '"Tatil modundasınız ancak 40 dakikadır kesintisiz 12 L/dk akış var! Olası boru patlağı."',
    action: 'İsteğe bağlı ana vana otomatik kesilir'
  }
];

export function renderAlertLevels() {
  const grid = document.getElementById('alert-levels-grid');
  if (!grid) return;
  grid.innerHTML = '';

  ALERT_LEVELS.forEach(a => {
    const card = document.createElement('div');
    card.className = 'card fade-up';
    card.style.border = `1px solid ${a.border}`;
    card.style.background = a.bg;
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <span style="font-weight:700; font-size:0.9rem;">${a.level}</span>
        <span class="source-label">${a.badge}</span>
      </div>
      <h4 style="margin-bottom:0.5rem;">${a.title}</h4>
      <p style="font-size:0.9rem; color:var(--white); font-style:italic; margin-bottom:1rem; background:rgba(0,0,0,0.2); padding:0.75rem; border-radius:var(--radius-sm);">${a.example}</p>
      <div style="font-size:0.8rem; color:var(--gray-300); display:flex; align-items:center; gap:0.4rem;">
        <span>⚡ Aksiyon:</span> <strong>${a.action}</strong>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── YZ KARTLARI ────────────────────────────────────────────────────────────
const AI_ITEMS = [
  {
    badge: 'YZ-1 · Su İmzası',
    title: 'Akış İmzası & Cihaz Tanıma',
    simple: 'Tüm eve tek bir toplam tüketim yazar; hangi cihazın ne kadar harcadığı bilinemez.',
    sunabzi: 'HydroSense metodolojisi: Musluk açıldığında oluşan basınç ve akış dalgasını analiz ederek tuvalet, duş, çamaşır veya lavaboyu %97,9 doğrulukla tanır.',
    tech: 'Washington Üniversitesi HydroSense araştırmasına dayanan özellik çıkarımı. Basınç geçici rejimleri (transients) ve wavelet dönüşümü ile armatür tespiti. Etiketli veri ihtiyacını azaltan denetimsiz kümeleme (semi-supervised clustering).',
  },
  {
    badge: 'YZ-2 · Evi Tanıma',
    title: '2–4 Haftalık Öğrenme & İstisna Yönetimi',
    simple: 'Tek bir sabit eşik kullanır. Gece çalışan, tatilde olan veya misafiri gelen evde sürekli yanlış alarm verir.',
    sunabzi: 'Uygulama üzerinden mikro-doğrulamalarla evin 2-4 haftalık normal ritmini öğrenir. Vardiya, tatil veya temizlik günü gibi durumları anlar.',
    tech: 'Bağlamsal zaman serisi baseline hesaplama. Kullanıcı bildirimleriyle Bayesian güncelleme; tatil modunda eşik anında sıfıra indirgenir, gece vardiyasında uyku periyodu otomatik kaydırılır.',
  },
  {
    badge: 'YZ-3 · Arıtma Optimizasyonu',
    title: 'İlçe Arıtma Tesisi Yük Tahmini',
    simple: 'Arıtma tesisleri gelen atık suyu ancak tesise ulaştığında görür; pompalar ve havalandırma sabit programla çalışır.',
    sunabzi: 'Dairelerden gelen anonim kullanım verisiyle tesise ne zaman ne kadar atık su geleceğini önceden tahmin eder. Wilo pompaları ve arıtma kademeleri bu yüke göre çalışır; geri kazanılan suyun dağıtımı talebe göre planlanır.',
    tech: 'İlçe bazında toplulaştırılmış saatlik tüketim serileri üzerinde zaman serisi tahmini. Tahmin edilen giriş yükü ile pompa devir hızı ve havalandırma ayar noktaları önceden ayarlanır; park sulama ve sanayi talebi ile geri kazanılan su arzı eşleştirilir.',
  },
];

export function renderAI() {
  const grid = document.getElementById('ai-grid');
  if (!grid) return;
  grid.innerHTML = '';
  AI_ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'ai-card fade-up';
    const techId = `tech-${item.badge.replace(/[^a-zA-Z0-9]/g, '')}`;
    card.innerHTML = `
      <div class="ai-badge">${item.badge}</div>
      <h4>${item.title}</h4>
      <div class="comparison-row">
        <div class="comp-item old">
          <span class="comp-label">Geleneksel</span>
          <span>${item.simple}</span>
        </div>
        <div class="comp-item new">
          <span class="comp-label">DÖNGÜ</span>
          <span>${item.sunabzi}</span>
        </div>
      </div>
      <button class="tech-toggle" aria-expanded="false" aria-controls="${techId}">
        ⚙ Teknik detay & Literatür
      </button>
      <div class="tech-detail" id="${techId}" aria-hidden="true">
        ${item.tech}
      </div>`;

    const btn = card.querySelector('.tech-toggle');
    const detail = card.querySelector('.tech-detail');
    btn.addEventListener('click', () => {
      const open = detail.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      detail.setAttribute('aria-hidden', !open);
      btn.textContent = open ? '✕ Kapat' : '⚙ Teknik detay & Literatür';
    });

    grid.appendChild(card);
  });
}

// ── İLÇE DÖNGÜ HESAPLAYICI ───────────────────────────────────────────────────
export function initGraywaterCalculator() {
  const pop = document.getElementById('calc-pop');
  const rate = document.getElementById('calc-rate');
  if (!pop || !rate) return;
  const $ = id => document.getElementById(id);
  const fmt = n => Math.round(n).toLocaleString('tr-TR');

  function update() {
    const people = parseInt(pop.value, 10);
    const r = parseInt(rate.value, 10) / 100;
    $('calc-pop-val').textContent = fmt(people);
    $('calc-rate-val').textContent = `%${rate.value}`;

    // Varsayım: kişi başı 130 L/gün kullanım; ~%90'ı atık su olarak tesise ulaşır
    const wastePerPersonL = WATER_DATA.dailyLitersPerPerson * 0.9;
    const returnedPerPersonL = wastePerPersonL * r;
    const dailyM3 = (people * returnedPerPersonL) / 1000;
    const monthlyM3 = dailyM3 * 30;
    const pools = monthlyM3 / 2500; // olimpik havuz ≈ 2.500 m³

    $('calc-month-m3').textContent = `${fmt(monthlyM3)} m³`;
    $('calc-pools').textContent = `≈ ${fmt(pools)} olimpik havuz / ay`;
    $('calc-person-l').textContent = `${returnedPerPersonL.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} L/gün`;
    $('calc-day-m3').textContent = `İlçe toplamı: ${fmt(dailyM3)} m³/gün`;
  }
  pop.addEventListener('input', update);
  rate.addEventListener('input', update);
  update();
}

// ── SINIRLAR VE MAHREMİYET ──────────────────────────────────────────────────
const LIMITS = [
  {
    icon: '🔒',
    title: 'Mahremiyet ve Veri Güvenliği (KVKK)',
    text: 'Literatür araştırmaları, su sensörü verisinden evdeki aktivitelerin (duş, tıraş, yemek) %82,69 doğrulukla tahmin edilebildiğini göstermektedir. Bu nedenle ham dakika verisi uç cihazda (ESP32) özetlenir; sunucuya veya belediyeye yalnızca anonim, toplu veriler iletilir. "Evde yokum" bilgisi asla dışarıya açılmaz.',
  },
  {
    icon: '🏢',
    title: 'Tek Ev Değil, Bina Ölçeği Arıtma',
    text: 'Gri su arıtma ünitesi tek bir daire için yüksek kurulum ve bakım maliyetlidir. Bu nedenle sistem apartman/site ölçeğinde ortak bodrum ünitesi (kompakt filtre + UV) veya bahçeli sitelerde bitkili filtre yatakları ile çözülür.',
  },
  {
    icon: '📡',
    title: 'Mekanik ve Akıllı Sayaç Uyumu',
    text: 'Türkiye genelinde mekanik sayaçlar yaygındır. DÖNGÜ sensör modülü boruyu kesmeden veya sayacı değiştirmeden, sayaç yanına takılan harici debi/basınç adaptörü ile çalışacak şekilde prototiplenmiştir.',
  },
  {
    icon: '⚡',
    title: 'Sensör Maliyeti ve Hedef Fiyat',
    text: 'Washington Üniversitesi HydroSense benzeri tek nokta ölçüm mimarisi tercih edilerek her musluğa ayrı sayaç koyma maliyetinden kaçınılmıştır. Rakamlar ticari kesinlikte değil, hackathon Ar-Ge hedef maliyetidir.',
  },
  {
    icon: '📊',
    title: 'Doğrulama ve Sentetik Veri',
    text: 'Algoritma simülasyonları ve kaçak sınıflandırması sentetik veri üzerinde test edilmiştir. Gerçek bina tesisatında pilot uygulama ile saha doğrulamasının yapılması planlanmaktadır.',
  },
  {
    icon: '🔔',
    title: 'Yanlış Alarm Yönetimi',
    text: 'Otomatik ana vana kesme özelliği isteğe bağlıdır; kritik durumlarda kullanıcının onayına öncelik verilir. 3 seviyeli bildirim mimarisi gereksiz panik oluşturmayı önler.',
  },
];

export function renderLimits() {
  const grid = document.getElementById('limits-grid');
  if (!grid) return;
  grid.innerHTML = '';
  LIMITS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'limit-card fade-up';
    card.innerHTML = `
      <div class="limit-icon" aria-hidden="true">${item.icon}</div>
      <div>
        <h4>${item.title}</h4>
        <p>${item.text}</p>
      </div>`;
    grid.appendChild(card);
  });
}

// ── VİZYON KARTLARI (ŞEHİRLER ODAĞI) ────────────────────────────────────────
const VISION_ITEMS = [
  { icon: '🏠', title: '1. Daire Ölçeği', text: 'Kaçak uyarısı, armatür bazlı tüketim haritası ve kişiselleştirilmiş Su İzim tasarruf koçluğu.' },
  { icon: '🏢', title: '2. Bina Ölçeği', text: 'Kolon ve ortak tesisat kaçak tespiti; bina yönetimine ortak hattaki kaybın bildirilmesi.' },
  { icon: '🏭', title: '3. İlçe Ölçeği', text: 'İlçe arıtma tesisi: tesise gelecek yükün tahmini, arıtılan suyun parklara ve sanayiye geri kazandırılması, şebeke kaçaklarının yerinin bulunması.' },
  { icon: '🌆', title: '4. Şehir Ölçeği', text: 'Belediyelere ve su idarelerine dinamik saatlik su talep haritası; akıllı şehir kuraklık erken uyarı sistemi.' },
];

export function renderVision() {
  const grid = document.getElementById('vision-grid');
  if (!grid) return;
  grid.innerHTML = '';
  VISION_ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'vision-card fade-up';
    card.innerHTML = `
      <div class="vision-icon" aria-hidden="true">${item.icon}</div>
      <h4>${item.title}</h4>
      <p>${item.text}</p>`;
    grid.appendChild(card);
  });
}

// ── AKILLI ŞEHİR SU KAYIP & TALEP HARİTASI (SCADA PANELİ) ─────────────────
const DISTRICTS_DATA = [
  {
    id: 'caddebostan',
    name: 'Caddebostan · Hat-4B',
    status: 'critical',
    statusLabel: '🔴 Kritik Şebeke Kaçağı',
    lossRate: '%41 Kayıp',
    buildings: '340 Bina',
    savedM3: '4.200 m³/ay',
    lossLitersHour: '34.000 L/saat',
    desc: 'Ana dağıtım sayacı debisi ile bina giriş sensörleri toplamı arasında 34 m³/saat fark tespit edildi! Şebekedeki %32\'lik kaybın kaynağı sokak düzeyinde bulundu.',
    action: '⚡ Belediye ekipleri Bağdat Cad. 142 önüne yönlendirildi. Tahmini kurtarma: 24.500 m³/ay.',
  },
  {
    id: 'moda',
    name: 'Moda · Hat-1A',
    status: 'good',
    statusLabel: '🟢 Normal Dağıtım',
    lossRate: '%9 Kayıp (İdeal)',
    buildings: '520 Bina',
    savedM3: '8.400 m³/ay',
    lossLitersHour: '1.200 L/saat',
    desc: 'Şebeke basıncı dengeli, anormal gece akışı yok. İlçe tesisine gelen yük tahminle uyumlu.',
    action: 'Dengeli şebeke; Wilo terfi pompaları eko modda çalışıyor.',
  },
  {
    id: 'fenerbahce',
    name: 'Fenerbahçe · Hat-2C',
    status: 'good',
    statusLabel: '🟢 Yüksek Geri Kazanım',
    lossRate: '%11 Kayıp',
    buildings: '480 Bina',
    savedM3: '11.800 m³/ay',
    lossLitersHour: '2.100 L/saat',
    desc: 'İlçe arıtma tesisinde arıtılan suyun önemli bir kısmı park sulaması ve sokak temizliğinde yeniden kullanılıyor.',
    action: 'Bölgesel şebeke su talebi %38 oranında düşürüldü.',
  },
  {
    id: 'goztepe',
    name: 'Göztepe · Hat-3A',
    status: 'warning',
    statusLabel: '🟡 Sabah Tepe Talep Uyarısı',
    lossRate: '%18 Kayıp',
    buildings: '500 Bina',
    savedM3: '5.600 m³/ay',
    lossLitersHour: '4.500 L/saat',
    desc: '07:30–08:45 arası eş zamanlı duş talebi pik yaptı. Tesisat basıncı sınırda.',
    action: 'Belediye hidroforları debi talebini otomatik dengeledi.',
  },
];

export function initCityHeatmap() {
  const container = document.getElementById('city-heatmap-container');
  if (!container) return;

  let activeIndex = 0; // Varsayılan olarak Caddebostan (kritik kaçak)

  function render() {
    const active = DISTRICTS_DATA[activeIndex];

    container.innerHTML = `
      <div class="card fade-up" style="background:rgba(11,42,74,0.7); border:1px solid rgba(15,163,177,0.3); padding:2rem; backdrop-filter:blur(12px); box-shadow:var(--shadow-lg);">
        
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.75rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1.25rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem;">
              <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#2E9E6B; box-shadow:0 0 8px #2E9E6B;"></span>
              <span style="font-size:0.75rem; font-weight:700; color:var(--teal); text-transform:uppercase; letter-spacing:0.1em;">
                Akıllı Şehir Paneli &middot; Temsili Senaryo
              </span>
            </div>
            <h3 style="font-size:1.35rem; color:var(--white);">Mahalle Şebeke Kayıp & Talep Haritası</h3>
            <p style="font-size:0.85rem; color:var(--gray-300);">Binalardan gelen anonim su sensörü toplamları ile belediye ana sayaçları karşılaştırılır.</p>
            <p style="font-size:0.75rem; color:var(--amber); margin-top:0.35rem;">Bu panel bir tasarım örneğidir; mahalle adları ve rakamlar gerçek ölçüm değil, temsili senaryodur.</p>
          </div>

          <div style="display:flex; gap:1rem; flex-wrap:wrap;">
            <div style="background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.1); text-align:center;">
              <div style="font-size:0.68rem; color:var(--gray-300);">Pilot Binalar</div>
              <strong style="color:var(--teal); font-size:1.1rem;">1.840</strong>
            </div>
            <div style="background:rgba(255,255,255,0.05); padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.1); text-align:center;">
              <div style="font-size:0.68rem; color:var(--gray-300);">Aylık Kurtarılan Su</div>
              <strong style="color:var(--green); font-size:1.1rem;">29.800 m³</strong>
            </div>
            <div style="background:rgba(209,73,91,0.15); padding:0.5rem 1rem; border-radius:var(--radius-md); border:1px solid rgba(209,73,91,0.4); text-align:center;">
              <div style="font-size:0.68rem; color:var(--red);">Aktif Şebeke Kaçağı</div>
              <strong style="color:var(--red); font-size:1.1rem;">1 Kritik Hat</strong>
            </div>
          </div>
        </div>

        <!-- 4 Mahalle Butonları Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
          ${DISTRICTS_DATA.map((d, i) => `
            <button class="district-btn" data-index="${i}" style="
              text-align:left;
              background:${i === activeIndex ? 'rgba(15,163,177,0.18)' : 'rgba(255,255,255,0.03)'};
              border:1px solid ${i === activeIndex ? 'var(--teal)' : 'rgba(255,255,255,0.08)'};
              border-radius:var(--radius-md);
              padding:1rem;
              cursor:pointer;
              transition:all 0.25s ease;
              color:var(--white);
              position:relative;
              overflow:hidden;
            ">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <span style="font-weight:700; font-size:0.9rem;">${d.name}</span>
                <span style="font-size:0.7rem; font-weight:700; padding:0.2em 0.6em; border-radius:var(--radius-full); background:${d.status === 'critical' ? 'rgba(209,73,91,0.2)' : d.status === 'warning' ? 'rgba(237,174,73,0.2)' : 'rgba(46,158,107,0.2)'}; color:${d.status === 'critical' ? 'var(--red)' : d.status === 'warning' ? 'var(--amber)' : 'var(--green)'};">
                  ${d.lossRate}
                </span>
              </div>
              <div style="font-size:0.78rem; color:var(--gray-300);">${d.buildings} &middot; ${d.savedM3}</div>
              ${i === activeIndex ? '<div style="position:absolute; bottom:0; left:0; right:0; height:3px; background:var(--teal);"></div>' : ''}
            </button>
          `).join('')}
        </div>

        <!-- Seçilen Mahalle Detay Kartı -->
        <div style="background:rgba(0,0,0,0.3); border-radius:var(--radius-md); padding:1.5rem; border:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <div style="font-size:1.05rem; font-weight:700; color:var(--white);">
              ${active.statusLabel} &mdash; <span style="color:var(--teal);">${active.name}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--gray-300);">
              Şebekeden Kaçan Debi: <strong style="color:${active.status === 'critical' ? 'var(--red)' : 'var(--white)'};">${active.lossLitersHour}</strong>
            </div>
          </div>

          <p style="font-size:0.9rem; color:var(--gray-100); margin-bottom:1rem; line-height:1.6;">
            ${active.desc}
          </p>

          <div style="background:rgba(255,255,255,0.04); border-left:3px solid ${active.status === 'critical' ? 'var(--red)' : 'var(--teal)'}; padding:0.75rem 1rem; border-radius:0 var(--radius-sm) var(--radius-sm) 0; font-size:0.85rem; color:var(--gray-300);">
            <strong>Belediye Eylem Protokolü:</strong> ${active.action}
          </div>
        </div>

      </div>
    `;

    // Buton tıklamaları
    container.querySelectorAll('.district-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx !== activeIndex) {
          activeIndex = idx;
          render();
        }
      });
    });
  }

  render();
}

// ── KAPANIŞ ────────────────────────────────────────────────────────────────
export function renderClosing() {
  const teamEl = document.getElementById('closing-team');
  if (teamEl) {
    teamEl.textContent = `${TEAM.name} · ${TEAM.members.map(m => m.name).join(' · ')}`;
  }
  const emailEl = document.getElementById('closing-email');
  const emailText = document.getElementById('email-text');
  if (emailEl && TEAM.contact) {
    emailEl.href = `mailto:${TEAM.contact}`;
    if (emailText) emailText.textContent = TEAM.contact;
  }
  const heroLabel = document.getElementById('hero-team-label');
  if (heroLabel && TEAM.name !== '[TAKIM ADI]') {
    heroLabel.textContent = `${TEAM.name} · ${TEAM.event}`;
  }
}

// ── TELEFON MOCKUP (SU İZİM UYGULAMASI) ─────────────────────────────────────
export function renderPhoneMockup() {
  const screen = document.getElementById('phone-screen');
  if (!screen) return;

  screen.innerHTML = `
    <div class="phone-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.4rem; margin-bottom:0.5rem;">
      <span style="font-weight:700; color:var(--teal);">💧 Su İzim</span>
      <span style="font-size:0.6rem; color:var(--gray-300);">Canlı · Wi-Fi</span>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.4rem;">
      <span style="font-size:0.75rem; font-weight:700;">Bugün: 98 L</span>
      <span style="font-size:0.62rem; color:var(--green); font-weight:600;">✓ Hedefin altında (120 L)</span>
    </div>

    <!-- Döngü Oranı Rozeti -->
    <div style="background:rgba(46,158,107,0.15); border:1px solid rgba(46,158,107,0.3); border-radius:8px; padding:0.4rem; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-size:0.65rem; color:var(--white);">🔄 Arıtılıp geri dönen</span>
      <strong style="color:var(--green); font-size:0.85rem;">%15 · 13 L</strong>
    </div>

    <!-- Tüketim Dağılımı Mini Bar -->
    <div style="margin-bottom:0.5rem;">
      <div style="display:flex; justify-content:space-between; font-size:0.6rem; color:var(--gray-300); margin-bottom:0.2rem;">
        <span>🚿 Duş %42</span>
        <span>🚽 Tuvalet %28</span>
        <span>🚰 Mutfak %18</span>
        <span>🧺 Diğer %12</span>
      </div>
      <div style="display:flex; height:5px; border-radius:3px; overflow:hidden; background:rgba(255,255,255,0.1);">
        <div style="width:42%; background:var(--teal);"></div>
        <div style="width:28%; background:var(--green);"></div>
        <div style="width:18%; background:var(--amber);"></div>
        <div style="width:12%; background:var(--gray-500);"></div>
      </div>
    </div>

    <div class="phone-stat-row">
      <span class="phone-stat-label">Bu Ay Harcanan</span>
      <span class="phone-stat-value">2,4 m³</span>
    </div>
    <div class="phone-stat-row">
      <span class="phone-stat-label">Ay Sonu Tahmini</span>
      <span class="phone-stat-value">240–280 TL</span>
    </div>

    <!-- 3 Seviyeli Uyarı Kartı Önizlemesi -->
    <div class="phone-alert" style="background:rgba(237,174,73,0.12); border-color:rgba(237,174,73,0.35); color:var(--amber);">
      <strong>🟡 Uyarı: Gece Kesintisiz Akış</strong>
      03:00–04:30 arası kesintisiz 0,08 L/dk akış var. Klozet rezervuar sızıntısına benziyor. Tahmini kayıp: ~45 TL/ay.
    </div>
    <div style="font-size:0.58rem; color:var(--gray-500); margin-top:0.35rem; text-align:center;">
      HydroSense algoritmaları ile armatür ayrımı aktif
    </div>
  `;

  const mockup = document.getElementById('phone-mockup');
  if (mockup) {
    setTimeout(() => {
      mockup.classList.add('phone-vibrating');
      setTimeout(() => mockup.classList.remove('phone-vibrating'), 1500);
    }, 800);
  }
}

/**
 * DÖNGÜ — Ana Giriş Noktası
 * Tüm bölümleri başlatır, scroll animasyonlarını, 3D sahneyi ve jüri sunum modunu yönetir.
 */
import './styles/main.css';
import './styles/sections.css';

import { initHeroCanvas } from './sections/hero.js';
import { initWaterChart } from './sections/problem.js';
import { initSimulation } from './sections/simulation.js';
import {
  renderLogos, renderProblemStats, renderWhy,
  renderSignatures, renderAlertLevels, initGraywaterCalculator,
  renderAI, renderVision, initCityHeatmap,
  renderClosing, renderPhoneMockup,
} from './sections/content.js';
import { WaterMeterScene } from './three/scene.js';
import { renderVideoSlots } from './sections/video.js';
import {
  renderAppFeatures, initValueStream, renderWastes,
  renderCost, renderRoadmap,
} from './sections/extra.js';

// ── Render ─────────────────────────────────────────────────────────────────
renderLogos('hero-logos');
renderLogos('closing-logos');
renderProblemStats();
renderWhy();
renderSignatures();
renderAlertLevels();
initGraywaterCalculator();
renderAI();
renderVision();
initCityHeatmap();
renderClosing();
renderPhoneMockup();
renderAppFeatures();
initValueStream();
renderWastes();
renderCost();
renderRoadmap();
renderVideoSlots();

// Her konu bölümünün sonuna takım imzası
document.querySelectorAll('section').forEach(sec => {
  if (['hero', 'closing'].includes(sec.id)) return;
  const host = sec.id === 'solution' ? sec.querySelector('.solution-intro') : sec.querySelector(':scope > .container');
  if (!host || host.querySelector('.team-sign')) return;
  const sign = document.createElement('div');
  sign.className = 'team-sign';
  sign.innerHTML = '<img src="/assets/logos/hm-light.svg" alt="" aria-hidden="true"><span>HydraMind Ekibi</span>';
  host.appendChild(sign);
});

// ── Hero canvas ─────────────────────────────────────────────────────────────
initHeroCanvas();

// ── Su grafiği ─────────────────────────────────────────────────────────────
initWaterChart();

// ── Simülasyon ─────────────────────────────────────────────────────────────
initSimulation();

// ── Navbar scroll ──────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── Fade-up gözlemcisi ─────────────────────────────────────────────────────
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      fadeObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

function observeFadeUps() {
  document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));
}
observeFadeUps();

// ── Three.js Çözüm bölümü ─────────────────────────────────────────────────
const threeCanvas = document.getElementById('three-canvas');
const threeFallback = document.getElementById('three-fallback');
let threeScene = null;

if (threeCanvas) {
  threeScene = new WaterMeterScene(threeCanvas);
  const ok = threeScene.init();
  if (!ok && threeFallback) {
    threeCanvas.style.display = 'none';
    threeFallback.style.display = 'flex';
    threeFallback.style.alignItems = 'center';
    threeFallback.style.justifyContent = 'center';
    threeFallback.style.height = '100%';
  }
}

// ── Scroll-driven 3D adımlar (6 Adım) ──────────────────────────────────────
const solutionWrapper = document.getElementById('solution-wrapper');
const steps = document.querySelectorAll('.solution-step');
const TOTAL_STEPS = 6;

function getScrollStep() {
  if (!solutionWrapper) return 0;
  const rect = solutionWrapper.getBoundingClientRect();
  const scrolled = -rect.top;
  const totalHeight = rect.height - window.innerHeight;
  if (scrolled <= 0) return 0;
  if (scrolled >= totalHeight) return TOTAL_STEPS - 1;
  return Math.min(TOTAL_STEPS - 1, Math.floor((scrolled / totalHeight) * TOTAL_STEPS));
}

let currentStep = -1;
function updateStep() {
  const step = getScrollStep();
  if (step === currentStep) return;
  currentStep = step;

  steps.forEach((s, i) => {
    s.classList.toggle('active', i === step);
  });

  if (threeScene) threeScene.setStep(step);

  // Telefon mockup adımında (Adım 4) titreşim tetikle
  if (step === 4) {
    const mockup = document.getElementById('phone-mockup');
    if (mockup) {
      mockup.classList.remove('phone-vibrating');
      void mockup.offsetWidth; // reflow
      mockup.classList.add('phone-vibrating');
    }
  }
}

window.addEventListener('scroll', updateStep, { passive: true });
updateStep();

// ── Vizyon yakınlaşma animasyonu ───────────────────────────────────────────
const visionZoom = document.getElementById('vision-zoom');
const zoomBubbles = [
  document.getElementById('zoom-1'),
  document.getElementById('zoom-2'),
  document.getElementById('zoom-3'),
  document.getElementById('zoom-4'),
];

if (visionZoom) {
  const visionObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      zoomBubbles.forEach((b, i) => {
        if (!b) return;
        setTimeout(() => {
          if (i === 0) b.className = 'zoom-bubble';
          else if (i === 1) b.className = 'zoom-bubble expanding';
          else if (i === 2) b.className = 'zoom-bubble expanding';
          else b.className = 'zoom-bubble large';
        }, i * 300);
      });
      visionObs.disconnect();
    }
  }, { threshold: 0.4 });
  visionObs.observe(visionZoom);
}

// Three.js canvas boyut yönetimi
function resizeThreeCanvas() {
  if (!threeCanvas) return;
  const wrap = document.getElementById('solution-canvas-wrap');
  if (!wrap) return;
  threeCanvas.style.width = '100%';
  threeCanvas.style.height = '100%';
}
window.addEventListener('resize', resizeThreeCanvas);
resizeThreeCanvas();

// Yeni fade-up elemanları için MutationObserver
const mutObs = new MutationObserver(observeFadeUps);
mutObs.observe(document.body, { childList: true, subtree: true });

// ── JÜRİ SUNUM MODU (KLAVYE VE TAM EKRAN SLAYT GEZİNTİSİ) ─────────────────
function initPresentationMode() {
  const btn = document.getElementById('btn-presentation-mode');
  const hud = document.getElementById('presentation-hud');
  const hudTitle = document.getElementById('hud-title');
  const hudPrev = document.getElementById('hud-prev');
  const hudNext = document.getElementById('hud-next');
  const hudExit = document.getElementById('hud-exit');

  const slides = [
    { id: 'hero', title: 'Kapak' },
    { id: 'problem', title: 'Problem' },
    { id: 'why', title: 'Dört Temel Neden' },
    { id: 'bridge', title: 'Çözümümüz' },
    { id: 'solution', title: 'Nasıl Ölçüyoruz?' },
    { id: 'solution', step: 0, title: '3D · 1/6 Su Akar' },
    { id: 'solution', step: 1, title: '3D · 2/6 Sensör Dinler' },
    { id: 'solution', step: 2, title: '3D · 3/6 Veri Yola Çıkar' },
    { id: 'solution', step: 3, title: '3D · 4/6 Su İmzası Çözülür' },
    { id: 'solution', step: 4, title: '3D · 5/6 Su İzim Uygulaması' },
    { id: 'solution', step: 5, title: '3D · 6/6 Arıtma & Geri Dönüş' },
    { id: 'signatures', title: 'Su İmzası & İstisnalar' },
    { id: 'app', title: 'Su İzim Uygulaması' },
    { id: 'graywater', title: 'İlçe Arıtma & Döngü' },
    { id: 'valuestream', title: 'Değer Akış Haritası' },
    { id: 'ai-section', title: 'Yapay Zekâ Katmanı' },
    { id: 'simulation', title: 'Canlı Simülasyon' },
    { id: 'cost', title: 'Maliyet & Uygulanabilirlik' },
    { id: 'vision', title: 'Evden Şehre' },
    { id: 'roadmap', title: 'Yol Haritası' },
    { id: 'closing', title: 'Kapanış' },
  ];

  let currentSlide = 0;
  let isPresentationActive = false;

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= slides.length) index = slides.length - 1;
    currentSlide = index;
    const s = slides[currentSlide];

    if (s.step !== undefined) {
      // 3D Deneyim adımı — solution-wrapper içinde hassas kaydırma yap
      const solutionWrap = document.getElementById('solution-wrapper');
      if (solutionWrap) {
        const wrapRect = solutionWrap.getBoundingClientRect();
        const wrapperTop = window.scrollY + wrapRect.top;
        const totalHeight = solutionWrap.offsetHeight - window.innerHeight;
        const targetScroll = wrapperTop + (s.step / TOTAL_STEPS) * totalHeight + 15;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });

        // Gecikmesiz 3D sahne güncellemesi
        currentStep = s.step;
        steps.forEach((el, i) => el.classList.toggle('active', i === s.step));
        if (threeScene) threeScene.setStep(s.step);

        if (s.step === 4) {
          const mockup = document.getElementById('phone-mockup');
          if (mockup) {
            mockup.classList.remove('phone-vibrating');
            void mockup.offsetWidth;
            mockup.classList.add('phone-vibrating');
          }
        }
      }
    } else {
      // Normal sayfa bölümü
      const el = document.getElementById(s.id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (hudTitle) {
      hudTitle.textContent = `${currentSlide + 1}/${slides.length} · ${s.title}`;
    }
  }

  function toggleMode(activate) {
    isPresentationActive = activate !== undefined ? activate : !isPresentationActive;
    if (hud) hud.style.display = isPresentationActive ? 'flex' : 'none';
    if (btn) {
      btn.style.background = isPresentationActive ? 'rgba(15,163,177,0.35)' : 'transparent';
      btn.textContent = isPresentationActive ? '🖥️ Çık (Esc)' : '🖥️ Sunum Modu (F)';
    }
    if (isPresentationActive) {
      goToSlide(currentSlide);
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  btn?.addEventListener('click', () => toggleMode());
  hudExit?.addEventListener('click', () => toggleMode(false));
  hudPrev?.addEventListener('click', () => goToSlide(currentSlide - 1));
  hudNext?.addEventListener('click', () => goToSlide(currentSlide + 1));

  window.addEventListener('keydown', e => {
    // F tuşu: sunum modunu aç/kapat
    if (e.key === 'f' || e.key === 'F') {
      if (document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        toggleMode();
      }
    } else if (isPresentationActive || e.key === 'PageDown' || e.key === 'PageUp') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      } else if (e.key === 'Escape') {
        toggleMode(false);
      }
    }
  });
}
initPresentationMode();

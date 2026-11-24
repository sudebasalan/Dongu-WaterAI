/**
 * DÖNGÜ — Etkileşimli 24-Saat Debi & Algoritma Simülasyonu
 * Üç yöntemi (Sabit eşik, Gece sıfır, DÖNGÜ YZ) karşılaştırır ve ilçe arıtma
 * tesisinde arıtılıp şehre geri dönen payı gösterir.
 * Sentetik veri — tüm rakamlar simülasyon ve analiz amaçlıdır.
 */
import { Chart } from 'chart.js/auto';
import { SIMULATION, TARIFF, WATER_DATA } from '../data/config.js';

// ── Veri üretimi ───────────────────────────────────────────────────────────
function generateData(leakActive, leakLevel, nightPersonActive, graywaterActive) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const baseProfile = [...SIMULATION.normalDayProfile];

  // Gece uyanık kişi — gece 01-03 arası meşru su kullanımı
  if (nightPersonActive) {
    baseProfile[1] = 0.8;
    baseProfile[2] = 0.6;
    baseProfile[3] = 0.4;
  }

  // Kaçak debisi
  const leakLPM = leakActive
    ? [0.08, 0.18, 0.35][leakLevel - 1]
    : 0;

  // İlçe arıtma döngüsü: kullanılan suyun ~%90'ı atık su olarak tesise ulaşır,
  // bunun WATER_DATA.cityReusePct kadarı arıtılıp şehre geri kazandırılır.
  // Evin şebekeden çektiği su değişmez; geri dönen pay ayrı gösterilir.
  const returnShare = 0.9 * (WATER_DATA.cityReusePct / 100);
  const recycledData = [];
  const gridData = hours.map(h => {
    const rawFlow = Math.max(0, baseProfile[h] + (Math.random() - 0.5) * 0.06);
    const returnedLPM = graywaterActive ? rawFlow * returnShare : 0;
    recycledData.push(parseFloat(returnedLPM.toFixed(3)));
    return Math.max(0, rawFlow + leakLPM);
  });

  return { hours, gridData, recycledData, leakLPM };
}

// ── Fatura hesaplama ───────────────────────────────────────────────────────
function calcMonthlyBill(dataLPM, graywaterActive) {
  // Toplam L/saat → günlük m³ → aylık m³
  const dailyM3 = dataLPM.reduce((s, v) => s + v * 60, 0) / 1000;
  const monthlyM3 = dailyM3 * 30;
  const waterCost = monthlyM3 * TARIFF.pricePerM3_TL;
  const sewerageCost = waterCost * TARIFF.sewerageMultiplier;
  return Math.round(TARIFF.fixedMonthlyFee_TL + waterCost + sewerageCost);
}

// ── Durum hesaplama ────────────────────────────────────────────────────────
function calcStatus(data, leakActive, leakLPM, nightPersonActive) {
  const threshold = SIMULATION.thresholdAlarm_LPM;
  const hasOverThreshold = data.some(v => v > threshold);
  const hasNightFlow = data.slice(0, 5).some(v => v > 0.1);
  const baseline = SIMULATION.normalDayProfile;
  const deviation = data.map((v, i) => v - baseline[i]);
  const anomalyScore = deviation.reduce((s, d) => s + Math.max(0, d), 0) / 24;

  return {
    threshold: {
      alarm: leakActive && leakLPM >= threshold,
      miss: leakActive && leakLPM < threshold,
    },
    nightRule: {
      alarm: hasNightFlow,
      falseAlarm: nightPersonActive && !leakActive,
    },
    sunabzi: {
      detected: leakActive && anomalyScore > 0.035,
      falseAlarm: false,
    },
  };
}

// ── Durum kartları güncelle ────────────────────────────────────────────────
function updateMethodCards(status, leakActive, nightPerson, graywaterActive) {
  // Sabit Eşik
  const thEl = document.getElementById('threshold-status');
  if (thEl) {
    if (!leakActive) {
      thEl.className = 'method-status status-ok'; thEl.textContent = '✓ Eşik altı (Normal)';
    } else if (status.threshold.alarm) {
      thEl.className = 'method-status status-warn'; thEl.textContent = '⚠ Kaçak algılandı (Büyük)';
    } else {
      thEl.className = 'method-status status-miss'; thEl.textContent = '⚠ Küçük kaçak gözden kaçtı!';
    }
  }

  // Gece Sıfır Kuralı
  const nrEl = document.getElementById('night-rule-status');
  if (nrEl) {
    if (status.nightRule.falseAlarm) {
      nrEl.className = 'method-status status-warn'; nrEl.textContent = '✗ Yanlış Alarm! (Uyanık sakin)';
    } else if (leakActive) {
      nrEl.className = 'method-status status-warn'; nrEl.textContent = '⚠ Gece kaçak tespit edildi';
    } else {
      nrEl.className = 'method-status status-ok'; nrEl.textContent = '✓ Gece akışı yok';
    }
  }

  // DÖNGÜ (Öğrenen Model)
  const snEl = document.getElementById('sunabzi-status');
  if (snEl) {
    if (leakActive && status.sunabzi.detected) {
      snEl.className = 'method-status status-warn'; snEl.textContent = '✓ Kaçak başarıyla yakalandı';
    } else if (nightPerson) {
      snEl.className = 'method-status status-ok'; snEl.textContent = '✓ Normal (Gece rutini biliniyor)';
    } else if (graywaterActive) {
      snEl.className = 'method-status status-ok'; snEl.textContent = `✓ Döngü takibi aktif (%${WATER_DATA.cityReusePct} geri dönüş)`;
    } else {
      snEl.className = 'method-status status-ok'; snEl.textContent = '✓ Normal profil';
    }
  }
}

// ── Fatura kartı güncelle ─────────────────────────────────────────────────
function updateBillCard(bill, leakActive, leakLPM, graywaterActive, returnedLitersDay = 0) {
  const billEl = document.getElementById('sim-bill');
  const noteEl = document.getElementById('sim-bill-note');

  if (billEl) {
    billEl.textContent = `~${bill.toLocaleString('tr-TR')} TL`;
    billEl.className = 'sim-bill-amount' + (leakActive ? ' elevated' : '');
  }

  if (noteEl) {
    if (graywaterActive && leakActive) {
      const extra = Math.round(leakLPM * 60 * 24 * 30 / 1000 * TARIFF.pricePerM3_TL * (1 + TARIFF.sewerageMultiplier));
      noteEl.innerHTML = `
        <span style="color:var(--amber);">⚠ Kaçak maliyeti: ~${extra} TL/ay</span><br>
        <span style="color:var(--green);">🔄 Bugün kullandığınız suyun ~${returnedLitersDay} litresi ilçe tesisinde arıtılıp şehre geri döndü.</span>
      `;
    } else if (graywaterActive) {
      noteEl.innerHTML = `<strong style="color:var(--green);">🔄 İlçe Arıtma Döngüsü:</strong> Bugün kullandığınız suyun ~${returnedLitersDay} litresi ilçe tesisinde arıtılıp park sulaması, sokak temizliği ve sanayi için şehre geri döndü. Bu bilgi Su İzim'de Döngü Oranı olarak görünür.`;
    } else if (leakActive) {
      const extra = Math.round(leakLPM * 60 * 24 * 30 / 1000 * TARIFF.pricePerM3_TL * (1 + TARIFF.sewerageMultiplier));
      noteEl.innerHTML = `<span style="color:var(--red);">Kaçak nedeniyle faturaya yansıyan tahmini ek maliyet: ~${extra} TL/ay</span>`;
    } else {
      noteEl.textContent = 'Kaçak başlatın ya da İlçe Arıtma Döngüsünü açarak suyunuzun ne kadarının geri döndüğünü izleyin.';
    }
  }
}

export function initSimulation() {
  const simChart = document.getElementById('simChart');
  if (!simChart) return;

  let leakActive = false;
  let leakLevel = 1;
  let nightPerson = false;
  let graywaterActive = false;

  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Grafik başlat
  const initial = generateData(false, 1, false, false);
  const chart = new Chart(simChart, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Şebekeden Çekilen Debi (L/dk)',
          data: initial.gridData,
          borderColor: '#0FA3B1',
          backgroundColor: 'rgba(15, 163, 177, 0.1)',
          borderWidth: 2.2,
          pointRadius: 3,
          pointBackgroundColor: '#0FA3B1',
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Arıtılıp Şehre Geri Dönen Pay (L/dk)',
          data: Array(24).fill(0),
          borderColor: '#2E9E6B',
          backgroundColor: 'rgba(46, 158, 107, 0.15)',
          borderWidth: 2,
          borderDash: [4, 3],
          pointRadius: 2,
          pointBackgroundColor: '#2E9E6B',
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Kaçak Katkısı',
          data: Array(24).fill(null),
          borderColor: 'rgba(209, 73, 91, 0.7)',
          backgroundColor: 'rgba(209, 73, 91, 0.08)',
          borderWidth: 2,
          borderDash: [5, 3],
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        },
        {
          label: `Sabit Eşik (${SIMULATION.thresholdAlarm_LPM} L/dk)`,
          data: Array(24).fill(SIMULATION.thresholdAlarm_LPM),
          borderColor: 'rgba(237, 174, 73, 0.5)',
          borderWidth: 1.5,
          borderDash: [4, 4],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500 },
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          labels: { color: '#A8C0CF', boxWidth: 14, font: { size: 11.5 } },
        },
        tooltip: {
          backgroundColor: '#0D3461',
          borderColor: '#0FA3B1',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#A8C0CF',
          callbacks: {
            label: ctx => `${ctx.dataset.label}: ${ctx.raw !== null ? ctx.raw.toFixed(2) : '—'} L/dk`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#A8C0CF', maxTicksLimit: 12 },
        },
        y: {
          min: 0,
          grid: { color: 'rgba(255,255,255,0.07)' },
          ticks: {
            color: '#A8C0CF',
            callback: v => `${v.toFixed(1)}`,
          },
          title: { display: true, text: 'Debi (L/dk)', color: '#6B8A9A' },
        },
      },
    },
  });

  function updateChart() {
    const { gridData, recycledData, leakLPM } = generateData(leakActive, leakLevel, nightPerson, graywaterActive);
    chart.data.datasets[0].data = gridData;

    // Gri su verisi
    if (graywaterActive) {
      chart.data.datasets[1].data = recycledData;
    } else {
      chart.data.datasets[1].data = Array(24).fill(0);
    }

    // Kaçak verisi
    if (leakActive) {
      chart.data.datasets[2].data = Array(24).fill(leakLPM);
    } else {
      chart.data.datasets[2].data = Array(24).fill(null);
    }

    chart.update();
    const bill = calcMonthlyBill(gridData, graywaterActive);
    const status = calcStatus(gridData, leakActive, leakLPM, nightPerson);
    updateMethodCards(status, leakActive, nightPerson, graywaterActive);
    const returnedLitersDay = Math.round(recycledData.reduce((sum, v) => sum + v * 60, 0));
    updateBillCard(bill, leakActive, leakLPM, graywaterActive, returnedLitersDay);
  }

  // ── Kontroller ──────────────────────────────────────────────────────────
  const leakToggle = document.getElementById('leak-toggle');
  const leakSizeSlider = document.getElementById('leak-size');
  const leakSizeGroup = document.getElementById('leak-size-group');
  const leakSizeVal = document.getElementById('leak-size-val');
  const nightToggle = document.getElementById('night-person');
  const graywaterToggle = document.getElementById('graywater-toggle');
  const resetBtn = document.getElementById('sim-reset-btn');

  const leakLabels = ['küçük (klozet)', 'orta (musluk)', 'büyük (boru)'];

  if (leakToggle) {
    leakToggle.addEventListener('change', e => {
      leakActive = e.target.checked;
      e.target.setAttribute('aria-checked', leakActive);
      if (leakSizeGroup) {
        leakSizeGroup.style.opacity = leakActive ? '1' : '0.4';
        leakSizeGroup.style.pointerEvents = leakActive ? 'auto' : 'none';
      }
      updateChart();
    });
  }

  if (leakSizeSlider) {
    leakSizeSlider.addEventListener('input', e => {
      leakLevel = parseInt(e.target.value, 10);
      if (leakSizeVal) leakSizeVal.textContent = leakLabels[leakLevel - 1];
      e.target.setAttribute('aria-valuenow', leakLevel);
      if (leakActive) updateChart();
    });
  }

  if (nightToggle) {
    nightToggle.addEventListener('change', e => {
      nightPerson = e.target.checked;
      e.target.setAttribute('aria-checked', nightPerson);
      updateChart();
    });
  }

  if (graywaterToggle) {
    graywaterToggle.addEventListener('change', e => {
      graywaterActive = e.target.checked;
      e.target.setAttribute('aria-checked', graywaterActive);
      updateChart();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      leakActive = false; leakLevel = 1; nightPerson = false; graywaterActive = false;
      if (leakToggle) leakToggle.checked = false;
      if (leakSizeSlider) leakSizeSlider.value = 1;
      if (nightToggle) nightToggle.checked = false;
      if (graywaterToggle) graywaterToggle.checked = false;
      if (leakSizeVal) leakSizeVal.textContent = 'küçük';
      if (leakSizeGroup) { leakSizeGroup.style.opacity = '0.4'; leakSizeGroup.style.pointerEvents = 'none'; }
      updateChart();
    });
  }

  // İlk render
  updateChart();
}

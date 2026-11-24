/**
 * Su kıtlığı bar grafiği (Chart.js)
 */
import { Chart } from 'chart.js/auto';
import { WATER_DATA } from '../data/config.js';

export function initWaterChart() {
  const canvas = document.getElementById('waterChart');
  if (!canvas) return;

  // Kaynak etiketlerini doldur
  const sourceText = WATER_DATA.sourceCapita || WATER_DATA.source || 'DSİ verileri';
  const sourceLabel = document.getElementById('chart-source-label');
  if (sourceLabel) sourceLabel.textContent = `Kaynak: ${sourceText}`;
  const waterSourceLabel = document.getElementById('water-source-label');
  if (waterSourceLabel) waterSourceLabel.textContent = `Kaynak: ${sourceText}`;

  const labels = WATER_DATA.perCapitaM3.map(d => d.projected ? `${d.year} (Proj.)` : String(d.year));
  const values = WATER_DATA.perCapitaM3.map(d => d.value);
  const bgColors = WATER_DATA.perCapitaM3.map(d =>
    d.projected
      ? 'rgba(237, 174, 73, 0.6)'
      : d.value <= WATER_DATA.scarcityThreshold
        ? 'rgba(209, 73, 91, 0.75)'
        : 'rgba(15, 163, 177, 0.75)'
  );
  const borderColors = WATER_DATA.perCapitaM3.map(d =>
    d.projected ? '#EDAE49' : d.value <= WATER_DATA.scarcityThreshold ? '#D1495B' : '#0FA3B1'
  );

  const chart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Kişi başı su (m³/yıl)',
        data: values.map(() => 0), // Başlangıçta 0 — animasyon ile dolacak
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1200, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw.toLocaleString('tr-TR')} m³/kişi/yıl`,
            afterLabel: ctx => ctx.raw <= WATER_DATA.scarcityThreshold ? '⚠ Su fakirliği eşiğinin altında' : '',
          },
          backgroundColor: '#0D3461',
          borderColor: '#0FA3B1',
          borderWidth: 1,
          titleColor: '#fff',
          bodyColor: '#A8C0CF',
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#A8C0CF' },
        },
        y: {
          min: 800,
          max: 1800,
          grid: { color: 'rgba(255,255,255,0.07)' },
          ticks: {
            color: '#A8C0CF',
            callback: v => v.toLocaleString('tr-TR'),
          },
        },
      },
    },
  });

  // Su fakirliği eşik çizgisi — plugin
  Chart.register({
    id: 'scarcityLine',
    afterDraw(ch) {
      const { ctx: c, scales: { y } } = ch;
      const yVal = y.getPixelForValue(WATER_DATA.scarcityThreshold);
      c.save();
      c.setLineDash([6, 4]);
      c.strokeStyle = 'rgba(209,73,91,0.7)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(ch.chartArea.left, yVal);
      c.lineTo(ch.chartArea.right, yVal);
      c.stroke();
      c.restore();
    }
  });

  // IntersectionObserver ile animasyon tetikleme
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      chart.data.datasets[0].data = values;
      chart.update();
      obs.disconnect();
    }
  }, { threshold: 0.4 });
  obs.observe(canvas);
}

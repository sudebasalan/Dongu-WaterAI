/**
 * Hero bölümü — Canvas su dalgası animasyonu
 */
export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h, rings = [];
  const isMobile = () => window.innerWidth < 768;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Halka sınıfı
  class Ring {
    constructor(x, y, delay = 0) {
      this.cx = x; this.cy = y;
      this.r = 0;
      this.maxR = Math.max(w, h) * 0.5;
      this.speed = 0.4 + Math.random() * 0.3;
      this.alpha = 0;
      this.delay = delay;
      this.age = -delay;
    }
    update(dt) {
      this.age += dt;
      if (this.age < 0) return;
      this.r += this.speed * dt * 60;
      this.alpha = Math.max(0, 0.15 * (1 - this.r / this.maxR));
    }
    draw(ctx) {
      if (this.age < 0 || this.alpha <= 0.001) return;
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(15, 163, 177, ${this.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    isDone() { return this.age > 0 && this.r >= this.maxR; }
  }

  // Belirli merkezlerden sürekli halka yay
  const centers = [
    { x: 0.5, y: 0.5 },
    { x: 0.2, y: 0.7 },
    { x: 0.8, y: 0.3 },
  ];

  function spawnRings() {
    centers.forEach((c, i) => {
      rings.push(new Ring(w * c.x, h * c.y, i * 0.8));
    });
  }
  spawnRings();

  let last = performance.now();
  function tick(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    ctx.clearRect(0, 0, w, h);

    // Gradient arka plan
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.5);
    grad.addColorStop(0, 'rgba(13,52,97,0.9)');
    grad.addColorStop(1, 'rgba(7,30,53,0.98)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    rings = rings.filter(r => !r.isDone());
    rings.forEach(r => { r.update(dt); r.draw(ctx); });

    if (rings.length < (isMobile() ? 6 : 12)) spawnRings();

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/**
 * Жеңил конфетти жарылуусу — китепканасыз, бир canvas менен.
 * Анимация бүткөндө canvas өзү өчүп калат.
 */
const COLORS = ['#22d3ee', '#8b5cf6', '#f472b6', '#facc15', '#4ade80'];
const DURATION = 2800;

export function fireConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, { position: 'fixed', inset: '0', zIndex: '3000', pointerEvents: 'none' });
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas.remove();

  // Ар бир бөлүкчө экрандын ортосунан жогору карай атылат
  const parts = Array.from({ length: 180 }, () => ({
    x: canvas.width / 2,
    y: canvas.height * 0.65,
    vx: (Math.random() - 0.5) * 18,
    vy: -Math.random() * 17 - 6,
    size: Math.random() * 7 + 5,
    rot: Math.random() * Math.PI,
    vrot: (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));

  const start = performance.now();
  const step = (now: number) => {
    const t = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = Math.max(0, 1 - t / DURATION);

    for (const p of parts) {
      p.vy += 0.42; // тартылуу күчү
      p.vx *= 0.99; // аба каршылыгы
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }

    if (t < DURATION) requestAnimationFrame(step);
    else canvas.remove();
  };
  requestAnimationFrame(step);
}

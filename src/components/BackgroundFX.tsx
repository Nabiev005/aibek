import { useEffect, useRef } from 'react';
import type { Theme } from '../hooks/useTheme';
import { SCENE_COLORS } from '../lib/palette';

/* ------------------------------------------------------------------
 * Бүт барактын артындагы интерактивдүү фон — эки катмар:
 *
 *  1. АВРОРА (WebGL шейдер): теманын түстөрүндө суюктуктай агып турган
 *     жарык толкундар. Скролл кылганда агым жылат, чычкандын
 *     тегерегинде жарык пайда болот.
 *
 *  2. ЧЕКИТ-ТОРЧО (Canvas 2D): чычкан жакындаганда чекиттер жанып,
 *     четке түртүлөт. Басканда толкун тарайт, өзүнөн-өзү да толкундар чыгат.
 * ------------------------------------------------------------------ */

type Props = { theme: Theme; reduced: boolean };

/* ======================= 1. Аврора шейдери ======================= */

const VERTEX = `
  attribute vec2 aPos;
  void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAGMENT = `
  precision mediump float;
  uniform vec2 uRes;
  uniform float uTime;
  uniform vec2 uMouse;     // 0..1
  uniform float uScroll;   // скролл (экран бийиктигинде)
  uniform vec3 uBg, uA, uB, uC;
  uniform float uIntensity;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  // Бир нече катмар ызы-чуу (fractal Brownian motion)
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = vec2(uv.x * aspect, uv.y);
    float t = uTime * 0.05;

    // "Domain warping" — ызы-чуунун ичине ызы-чуу: суюктук сыяктуу агым
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
    vec2 r = vec2(fbm(p * 1.4 + 4.0 * q + vec2(1.7, 9.2) + t * 1.5 + uScroll * 0.35),
                  fbm(p * 1.4 + 4.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p * 1.4 + 4.0 * r);

    vec3 col = mix(uA, uB, clamp(f * f * 2.2, 0.0, 1.0));
    col = mix(col, uC, clamp(length(q) * 0.7 - 0.3, 0.0, 1.0) * 0.7);
    float mask = smoothstep(0.32, 0.9, f);

    // Чычкандын тегерегиндеги жарык
    vec2 m = vec2(uMouse.x * aspect, uMouse.y);
    float glow = exp(-length(p - m) * 3.2);

    vec3 outc = mix(uBg, col, clamp(mask * uIntensity + glow * 0.32, 0.0, 1.0));

    // Четтерин караңгылатуу (виньетка)
    outc = mix(outc, uBg, smoothstep(0.45, 1.15, length(uv - 0.5) * 1.35) * 0.65);

    gl_FragColor = vec4(outc, 1.0);
  }
`;

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/* ======================= 2. Чекит-торчо ======================= */

const GAP = 30; // чекиттердин аралыгы (px)
const MOUSE_RADIUS = 170; // чычкандын таасир радиусу
const RIPPLE_SPEED = 0.55; // толкундун ылдамдыгы (px/ms)
const RIPPLE_LIFE = 2400; // толкундун өмүрү (ms)
const RIPPLE_WIDTH = 70;

export function BackgroundFX({ theme, reduced }: Props) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const glCanvas = glRef.current;
    const dotCanvas = dotsRef.current;
    const ctx = dotCanvas?.getContext('2d');
    if (!glCanvas || !dotCanvas || !ctx) return;

    const colors = SCENE_COLORS[theme];
    const mouse = { x: -9999, y: -9999, u: 0.5, v: 0.5 };
    const smoothMouse = { u: 0.5, v: 0.5 };
    const ripples: { x: number; y: number; start: number }[] = [];

    /* ---------- WebGL даярдоо ---------- */
    const gl = glCanvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    let program: WebGLProgram | null = null;
    const uniforms: Record<string, WebGLUniformLocation | null> = {};

    if (gl) {
      const compile = (type: number, src: string) => {
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
      gl.linkProgram(program);
      gl.useProgram(program);

      // Бүт экранды жапкан бир үч бурчтук
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      ['uRes', 'uTime', 'uMouse', 'uScroll', 'uBg', 'uA', 'uB', 'uC', 'uIntensity'].forEach(
        (name) => (uniforms[name] = gl.getUniformLocation(program!, name)),
      );
      gl.uniform3fv(uniforms.uBg, hexToRgb(colors.bg));
      gl.uniform3fv(uniforms.uA, hexToRgb(colors.a));
      gl.uniform3fv(uniforms.uB, hexToRgb(colors.b));
      gl.uniform3fv(uniforms.uC, hexToRgb(colors.c));
      gl.uniform1f(uniforms.uIntensity, theme === 'dark' ? 0.78 : 0.34);
    }

    /* ---------- Өлчөмдөр ---------- */
    let width = 0;
    let height = 0;
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // Аврора жумшак болгондуктан жарым резолюция жетиштүү — тезирээк иштейт
      const scale = 0.5;
      glCanvas.width = Math.ceil(width * scale);
      glCanvas.height = Math.ceil(height * scale);
      if (gl) {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.uniform2f(uniforms.uRes, glCanvas.width, glCanvas.height);
      }
      const dpr = Math.min(window.devicePixelRatio, 2);
      dotCanvas.width = width * dpr;
      dotCanvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ---------- Тартуу ---------- */
    const drawAurora = (time: number) => {
      if (!gl) return;
      smoothMouse.u += (mouse.u - smoothMouse.u) * 0.05;
      smoothMouse.v += (mouse.v - smoothMouse.v) * 0.05;
      gl.uniform1f(uniforms.uTime, time / 1000);
      gl.uniform2f(uniforms.uMouse, smoothMouse.u, smoothMouse.v);
      gl.uniform1f(uniforms.uScroll, window.scrollY / Math.max(1, height));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const dotColor = theme === 'dark' ? colors.particles : colors.b;
    const glowColor = colors.a;

    const drawDots = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      // Эскирген толкундарды өчүрүү
      for (let i = ripples.length - 1; i >= 0; i--) if (now - ripples[i].start > RIPPLE_LIFE) ripples.splice(i, 1);

      const baseAlpha = theme === 'dark' ? 0.16 : 0.2;
      const offsetX = (width % GAP) / 2;
      const offsetY = (height % GAP) / 2;

      for (let x = offsetX; x < width; x += GAP) {
        for (let y = offsetY; y < height; y += GAP) {
          let k = 0; // таасирдин күчү 0..1
          let dx = 0;
          let dy = 0;

          // Чычкандын таасири: жанат жана четке түртүлөт
          const mx = x - mouse.x;
          const my = y - mouse.y;
          const md = Math.hypot(mx, my);
          if (md < MOUSE_RADIUS) {
            const f = 1 - md / MOUSE_RADIUS;
            k = Math.max(k, f);
            dx += (mx / (md || 1)) * f * 14;
            dy += (my / (md || 1)) * f * 14;
          }

          // Толкундардын таасири
          for (const r of ripples) {
            const age = now - r.start;
            const radius = age * RIPPLE_SPEED;
            const rd = Math.hypot(x - r.x, y - r.y);
            const band = Math.abs(rd - radius);
            if (band < RIPPLE_WIDTH) {
              const f = (1 - band / RIPPLE_WIDTH) * (1 - age / RIPPLE_LIFE);
              k = Math.max(k, f);
              dx += ((x - r.x) / (rd || 1)) * f * 8;
              dy += ((y - r.y) / (rd || 1)) * f * 8;
            }
          }

          const size = 1.3 + k * 2.6;
          ctx.globalAlpha = baseAlpha + k * 0.75;
          ctx.fillStyle = k > 0.25 ? glowColor : dotColor;
          ctx.fillRect(x + dx - size / 2, y + dy - size / 2, size, size);
        }
      }
      ctx.globalAlpha = 1;
    };

    // Анимацияны азайтуу режими — бир гана статикалык кадр
    if (reduced) {
      drawAurora(8000);
      drawDots(0);
      const onResize = () => {
        resize();
        drawAurora(8000);
        drawDots(0);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    /* ---------- Окуялар ---------- */
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      }
      mouse.u = e.clientX / width;
      mouse.v = 1 - e.clientY / height;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    // Басканда (же телефондо тийгенде) толкун тарайт
    const onDown = (e: PointerEvent) => ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() });

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);

    // Ар 3.5 секундда туш келди жерден өзүнөн-өзү толкун
    const autoRipple = window.setInterval(() => {
      if (document.hidden) return;
      ripples.push({ x: Math.random() * width, y: Math.random() * height, start: performance.now() });
    }, 3500);

    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      drawAurora(now);
      drawDots(now);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(autoRipple);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      if (gl && program) gl.deleteProgram(program);
    };
  }, [theme, reduced]);

  return (
    <div className="bg-fx" aria-hidden="true">
      <canvas ref={glRef} className="bg-fx__aurora" />
      <canvas ref={dotsRef} className="bg-fx__dots" />
    </div>
  );
}

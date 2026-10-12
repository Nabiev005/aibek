import { useEffect, useRef } from 'react';
import { loadThree } from '../lib/loadThree';
import { SCENE_COLORS } from '../lib/palette';
import type { Theme } from '../hooks/useTheme';

/* ------------------------------------------------------------------
 * Hero фонундагы интерактивдүү 3D сахна (монитордун артында):
 *  - айланып турган каркас (wireframe) кабык
 *  - бөлүкчөлөр булуту
 * Баары чычканды ээрчип бурулат.
 * ------------------------------------------------------------------ */

type Props = { theme: Theme; reduced: boolean };

export function HeroScene({ theme, reduced }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);
  const setThemeRef = useRef<((t: Theme) => void) | null>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};

    loadThree()
      .then((THREE) => {
        const mount = mountRef.current;
        if (disposed || !mount) return;

        /* --- Негизги объекттер --- */
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 7);

        const group = new THREE.Group();
        scene.add(group);

        /* --- 1. Каркас кабык (монитордун артында) --- */
        const wireGeo = new THREE.IcosahedronGeometry(2.6, 1);
        const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.18 });
        const wire = new THREE.Mesh(wireGeo, wireMat);
        group.add(wire);

        /* --- 2. Бөлүкчөлөр булуту --- */
        const COUNT = window.innerWidth < 768 ? 900 : 1800;
        const positions = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
          // Сферанын ичинде туш келди чекит (2.6..6 радиус аралыгында)
          const r = 2.6 + Math.random() * 3.4;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
          positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
          positions[i * 3 + 2] = r * Math.cos(phi);
        }
        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMat = new THREE.PointsMaterial({
          size: 0.03,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.8,
          depthWrite: false,
        });
        const points = new THREE.Points(pointsGeo, pointsMat);
        scene.add(points);

        /* --- Теманы колдонуу (түстөр) --- */
        const applyTheme = (t: Theme) => {
          const c = SCENE_COLORS[t];
          wireMat.color.set(c.wire);
          pointsMat.color.set(c.particles);
          // Караңгы фондо жарык кошулат, жарык фондо кадимки аралаштыруу
          pointsMat.blending = t === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending;
          pointsMat.needsUpdate = true;
        };
        applyTheme(themeRef.current);

        /* --- Өлчөм --- */
        const resize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          // Компьютерде каркас оң жакта (монитордун артында), телефондо жогорку оң бурчта жана кичине
          const desktop = w > 900;
          group.position.set(desktop ? 2.2 : 0.9, desktop ? 0 : 2.2, 0);
          group.scale.setScalar(desktop ? 1 : 0.6);
        };
        const ro = new ResizeObserver(() => {
          resize();
          if (reduced) render();
        });
        ro.observe(mount);
        resize();

        const render = () => renderer.render(scene, camera);

        setThemeRef.current = (t) => {
          applyTheme(t);
          if (reduced) render();
        };

        /* --- Reduced motion: бир гана статикалык кадр --- */
        if (reduced) {
          render();
          cleanup = () => {
            ro.disconnect();
            dispose();
          };
          return;
        }

        /* --- Чычкан --- */
        const mouse = { x: 0, y: 0 }; // максаттуу маани (-1..1)
        const smooth = { x: 0, y: 0 }; // жумшартылган маани
        const onPointerMove = (e: PointerEvent) => {
          mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('pointermove', onPointerMove);

        /* --- Экранда көрүнбөсө рендерди токтотуу (үнөмдөө) --- */
        let visible = true;
        const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
        io.observe(mount);

        /* --- Анимация цикли --- */
        const clock = new THREE.Clock();
        let raf = 0;
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible) return;
          const t = clock.getElapsedTime();

          // Чычканды жумшак ээрчүү (lerp)
          smooth.x += (mouse.x - smooth.x) * 0.05;
          smooth.y += (mouse.y - smooth.y) * 0.05;

          group.rotation.y = smooth.x * 0.6;
          group.rotation.x = -smooth.y * 0.4;
          wire.rotation.y = -t * 0.08;
          wire.rotation.z = t * 0.05;

          points.rotation.y = t * 0.03 - smooth.x * 0.25; // параллакс
          points.rotation.x = smooth.y * 0.15;

          render();
        };
        loop();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('pointermove', onPointerMove);
          io.disconnect();
          ro.disconnect();
          dispose();
        };

        function dispose() {
          [wireGeo, pointsGeo].forEach((g) => g.dispose());
          [wireMat, pointsMat].forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        }
      })
      .catch((err) => console.warn('Three.js жүктөлгөн жок:', err));

    return () => {
      disposed = true;
      setThemeRef.current = null;
      cleanup();
    };
  }, [reduced]);

  // Тема өзгөргөндө сахнаны кайра түзбөй, түстөрдү гана алмаштырабыз
  useEffect(() => {
    themeRef.current = theme;
    setThemeRef.current?.(theme);
  }, [theme]);

  return <div ref={mountRef} className="hero__scene" aria-hidden="true" />;
}

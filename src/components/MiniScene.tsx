import { useEffect, useRef } from 'react';
import { loadThree } from '../lib/loadThree';
import { SCENE_COLORS } from '../lib/palette';
import type { Theme } from '../hooks/useTheme';

/* ------------------------------------------------------------------
 * Бөлүмдөрдү кооздоо үчүн кичинекей 3D объект:
 * каркас форма + чокуларында жаркыраган чекиттер.
 * Экранда көрүнгөндө гана анимацияланат.
 * ------------------------------------------------------------------ */

type Shape = 'torusKnot' | 'octahedron';
type Props = { shape: Shape; theme: Theme; reduced: boolean; className?: string };

export function MiniScene({ shape, theme, reduced, className = '' }: Props) {
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

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mount.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.z = 6;

        // Форманы тандоо
        const geometry =
          shape === 'torusKnot'
            ? new THREE.TorusKnotGeometry(1.2, 0.36, 140, 16)
            : new THREE.OctahedronGeometry(1.6, 2);

        const wireMat = new THREE.MeshBasicMaterial({ wireframe: true, transparent: true, opacity: 0.35 });
        const mesh = new THREE.Mesh(geometry, wireMat);

        const dotsMat = new THREE.PointsMaterial({ size: 0.045, transparent: true, opacity: 0.9, depthWrite: false });
        const dots = new THREE.Points(geometry, dotsMat);

        const obj = new THREE.Group();
        obj.add(mesh, dots);
        scene.add(obj);

        const applyTheme = (t: Theme) => {
          const c = SCENE_COLORS[t];
          wireMat.color.set(c.wire);
          dotsMat.color.set(c.a);
        };
        applyTheme(themeRef.current);

        const render = () => renderer.render(scene, camera);
        const resize = () => {
          const w = mount.clientWidth;
          const h = mount.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          render();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(mount);
        resize();

        setThemeRef.current = (t) => {
          applyTheme(t);
          render();
        };

        const dispose = () => {
          geometry.dispose();
          wireMat.dispose();
          dotsMat.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };

        if (reduced) {
          obj.rotation.set(0.4, 0.6, 0);
          render();
          cleanup = () => {
            ro.disconnect();
            dispose();
          };
          return;
        }

        let visible = false;
        const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        io.observe(mount);

        // Чычканга жараша бир аз ыкталат
        const tilt = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          tilt.x = (e.clientY / window.innerHeight - 0.5) * 0.6;
          tilt.y = (e.clientX / window.innerWidth - 0.5) * 0.6;
        };
        window.addEventListener('pointermove', onMove);

        let raf = 0;
        const clock = new THREE.Clock();
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible) return;
          const t = clock.getElapsedTime();
          obj.rotation.x += (tilt.x + t * 0.25 - obj.rotation.x) * 0.06;
          obj.rotation.y += (tilt.y + t * 0.35 - obj.rotation.y) * 0.06;
          obj.position.y = Math.sin(t * 1.2) * 0.12; // калкып туруу
          render();
        };
        loop();

        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener('pointermove', onMove);
          io.disconnect();
          ro.disconnect();
          dispose();
        };
      })
      .catch((err) => console.warn('Three.js жүктөлгөн жок:', err));

    return () => {
      disposed = true;
      setThemeRef.current = null;
      cleanup();
    };
  }, [shape, reduced]);

  useEffect(() => {
    themeRef.current = theme;
    setThemeRef.current?.(theme);
  }, [theme]);

  return <div ref={mountRef} className={`mini-scene ${className}`} aria-hidden="true" />;
}

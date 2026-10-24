import { useEffect, useRef } from 'react';
import { createSignalRoutes, nearestSignal, pointOnSignal } from './signalGeometry';
import styles from './SignalField.module.scss';

const ROUTES = createSignalRoutes();

/** Decorative routing lens. Frames are requested only by input, resize, or appearance changes. */
export function SignalField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let active = -1;
    let progress = 0.5;
    let ink = '#ffffff';
    let accent = '#f2f2f2';
    let paths: Path2D[] = [];
    let halo: CanvasGradient | null = null;

    const draw = () => {
      frame = 0;
      if (!visible || document.hidden || !width || !height) return;
      context.clearRect(0, 0, width, height);
      if (halo) {
        context.globalAlpha = 1;
        context.fillStyle = halo;
        context.fillRect(0, 0, width, height);
      }
      paths.forEach((path, index) => {
        context.globalAlpha = index === active ? 0.85 : 0.13;
        context.strokeStyle = index === active ? accent : ink;
        context.lineWidth = index === active ? 1.5 : 1;
        context.stroke(path);
        for (const endpoint of [ROUTES[index][0], ROUTES[index][3]]) {
          context.beginPath();
          context.arc(endpoint.x * width, endpoint.y * height, 2.5, 0, Math.PI * 2);
          context.fillStyle = index === active ? accent : ink;
          context.fill();
        }
      });
      context.globalAlpha = 0.24;
      context.strokeStyle = accent;
      for (const radius of [28, 42, 70]) {
        context.beginPath();
        context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        context.stroke();
      }
      if (active >= 0) {
        const marker = pointOnSignal(ROUTES[active], progress);
        context.globalAlpha = 1;
        context.fillStyle = accent;
        context.beginPath();
        context.arc(marker.x * width, marker.y * height, 4, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
    };
    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const style = getComputedStyle(canvas);
      ink = style.getPropertyValue('--text-primary').trim();
      accent = style.getPropertyValue('--primary-color').trim();
      paths = ROUTES.map((route) => {
        const path = new Path2D();
        path.moveTo(route[0].x * width, route[0].y * height);
        path.bezierCurveTo(
          route[1].x * width,
          route[1].y * height,
          route[2].x * width,
          route[2].y * height,
          route[3].x * width,
          route[3].y * height
        );
        return path;
      });
      halo = context.createRadialGradient(
        width / 2,
        height / 2,
        4,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.45
      );
      halo.addColorStop(0, `${accent}14`);
      halo.addColorStop(1, `${accent}00`);
      schedule();
    };
    const reset = () => {
      active = -1;
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      progress = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, width)));
      active = nearestSignal(ROUTES, progress, (event.clientY - rect.top) / Math.max(1, height));
      schedule();
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        active = -1;
      } else schedule();
    };
    const resize = new ResizeObserver(rebuild);
    resize.observe(canvas);
    const appearance = new MutationObserver(rebuild);
    appearance.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        active = -1;
      }
    });
    intersection.observe(canvas);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', reset);
    canvas.addEventListener('pointercancel', reset);
    motion.addEventListener('change', reset);
    pointer.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    rebuild();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      appearance.disconnect();
      intersection.disconnect();
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', reset);
      canvas.removeEventListener('pointercancel', reset);
      motion.removeEventListener('change', reset);
      pointer.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  return (
    <div className={styles.field} aria-hidden="true">
      <canvas ref={ref} />
      <span className={styles.core}>
        CLI<span>PROXY</span>
      </span>
    </div>
  );
}

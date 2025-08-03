import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type Params = {
  container: RefObject<HTMLElement | null>;
  img: RefObject<HTMLImageElement | null>;
  min?: number;      // мин. масштаб (обычно fitScale)
  max?: number;      // макс. масштаб
  step?: number;     // шаг зума для кнопок/клавиш
};

export function useZoomPan({ container, img, min = 0.1, max = 8, step = 0.2 } : Params) {
  const [{ scale, x, y }, setState] = useState({ scale: 1, x: 0, y: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

  // Вычисление Fit масштаба относительно натуральных размеров
  const computeFitScale = useCallback((noUpscale: boolean = true) => {
    const c = container.current, i = img.current;
    if (!c || !i || !i.naturalWidth || !i.naturalHeight) return 1;
    const cw = c.clientWidth, ch = c.clientHeight;
    const iw = i.naturalWidth, ih = i.naturalHeight;
    const fitRaw = Math.min(cw / iw, ch / ih);
    const fit = noUpscale ? Math.min(1, fitRaw) : fitRaw;
    return fit > 0 ? fit : 1;
  }, [container, img]);

  const centerForScale = useCallback((s: number) => {
    const c = container.current, i = img.current;
    if (!c || !i || !i.naturalWidth || !i.naturalHeight) return { x: 0, y: 0 };
    const cw = c.clientWidth, ch = c.clientHeight;
    const iw = i.naturalWidth * s, ih = i.naturalHeight * s;
    return {
      x: Math.round((cw - iw) / 2),
      y: Math.round((ch - ih) / 2),
    };
  }, [container, img]);

  const setFit = useCallback((noUpscale: boolean = true) => {
    const s = computeFitScale(noUpscale);
    const pos = centerForScale(s);
    setState({ scale: s, ...pos });
  }, [computeFitScale, centerForScale]);

  const set100 = useCallback(() => {
    const pos = centerForScale(1);
    setState({ scale: 1, ...pos });
  }, [centerForScale]);

  const reset = useCallback(() => setFit(true), [setFit]);

  // Зум вокруг фокальной точки (координата курсора)
  const zoomTo = useCallback((newScale: number, cx?: number, cy?: number) => {
    if (!container.current) {
      return;
    }
    setState(s => {
      const c = container.current!;
      const rect = c.getBoundingClientRect();
      const mx = (cx ?? (rect.left + rect.width / 2)) - rect.left;
      const my = (cy ?? (rect.top + rect.height / 2)) - rect.top;

      const ns = clamp(newScale, min, max);
      // сохраняем фокусную точку: (mx - x) пропорционально масштабу
      const k = ns / s.scale;
      const nx = mx - (mx - s.x) * k;
      const ny = my - (my - s.y) * k;
      return { scale: ns, x: nx, y: ny };
    });
  }, [container, min, max]);

  const zoomIn = useCallback(() => zoomTo(scale + step), [zoomTo, scale, step]);
  const zoomOut = useCallback(() => zoomTo(scale - step), [zoomTo, scale, step]);

  // Wheel/trackpad
  const onWheel = useCallback((e: WheelEvent) => {
    if (!container.current) return;
    if (e.ctrlKey || e.metaKey) {
      // pinch-to-zoom на трекпадах посылает wheel с ctrlKey
      e.preventDefault();
      const delta = -e.deltaY; // вверх — увеличить
      const factor = Math.exp(delta * 0.0015); // плавный зум
      zoomTo(scale * factor, e.clientX, e.clientY);
    }
  }, [zoomTo, scale, container]);

  // Drag
  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!container.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, [container]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    setState(s => {
      const dx = e.clientX - last.current.x;
      const dy = e.clientY - last.current.y;
      last.current = { x: e.clientX, y: e.clientY };
      return { ...s, x: s.x + dx, y: s.y + dy };
    });
  }, []);

  const onPointerUp = useCallback((e: PointerEvent) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }, []);

  // Привязка событий к контейнеру
  useEffect(() => {
    const c = container.current;
    if (!c) return;
    const wheel = (e: WheelEvent) => onWheel(e);
    const pd = (e: PointerEvent) => onPointerDown(e);
    const pm = (e: PointerEvent) => onPointerMove(e);
    const pu = (e: PointerEvent) => onPointerUp(e);
    c.addEventListener('wheel', wheel, { passive: false });
    c.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);
    return () => {
      c.removeEventListener('wheel', wheel);
      c.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
    };
  }, [container, onWheel, onPointerDown, onPointerMove, onPointerUp]);

  return {
    state: { scale, x, y },
    actions: { setFit, set100, reset, zoomIn, zoomOut, zoomTo },
    computeFitScale,
  };
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { getOriginalUrl, getThumbUrl } from "@/features/photos/photos.cache";
import {
  CornerDownRight,
  Minus,
  MonitorSmartphone,
  Percent,
  Plus,
  Scan,
} from "lucide-react";
import { Button } from "../ui/button";
import { useZoomPan } from "@/hooks/useZoomPan";
import { cn } from "@/lib/utils";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { useAppSelector } from "@/hooks";
import { photosSelectors } from "@/features/photos";

type ImageViewerProps = {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImageViewer({ id, open, onOpenChange }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const meta = useAppSelector((s) => id ? photosSelectors.selectPhotoById(s, id): undefined);

  const [thumb, setThumb] = useState<string>();
  const [orig, setOrig] = useState<string>();
  const src = orig ?? thumb;
  const [loaded, setLoaded] = useState(false);

  const { state, actions, computeFitScale } = useZoomPan({
    container: containerRef,
    img: imgRef,
    min: 0.1,
    max: 10,
    step: 0.25,
  });

  const fitScale = computeFitScale();
  const near = (a: number, b: number) =>
    Math.abs(a - b) / Math.max(b, 1e-6) < 0.05;
  const zoomLabel = near(state.scale, fitScale)
    ? "Fit"
    : `${Math.round(state.scale * 100)}%`;

  // Подгружаем thumb -> orig
  useEffect(() => {
    let alive = true;
    setThumb(undefined);
    setOrig(undefined);
    setLoaded(false);
    if (!open || !id) return;
    (async () => {
      const t = await getThumbUrl(id);
      if (alive) setThumb(t);
      const o = await getOriginalUrl(id);
      if (alive) setOrig(o);
    })();
    return () => {
      alive = false;
    };
  }, [open, id]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !open) return;
    const ro = new ResizeObserver(() => {
      // если сейчас близко к fit — сохраняем режим fit при ресайзе;
      const fit = computeFitScale(true);
      const near = Math.abs(state.scale - fit) / fit < 0.05;
      if (near) actions.setFit(true);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, containerRef, computeFitScale, actions, state.scale]);

  // Зум/пан с fit под контейнер

  // Авто-fit при открытии (и когда известны натуральные размеры)
  useEffect(() => {
    if (!open) return;
    const fit = computeFitScale();
    actions.zoomTo(fit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, src]); // когда поменялся источник → пересчитать fit

  // DoubleClick: toggle 100% / Fit
  const onDoubleClick = () => {
    const fit = computeFitScale(true);
    const nearFit = Math.abs(state.scale - fit) / fit < 0.05;
    if (nearFit) {
      actions.set100();
    } else {
      actions.setFit(true);
    }
  };

  // Шорткаты
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") actions.zoomIn();
      if (e.key === "-") actions.zoomOut();
      if (e.key.toLowerCase() === "0") actions.set100();
      if (e.key.toLowerCase() === "f") actions.setFit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, actions]);

  // Для Slider
  const sliderValue = useMemo(
    () => Math.round(state.scale * 100),
    [state.scale]
  );
  const setSlider = (v: number[]) => {
    const fit = computeFitScale();
    // min — не ниже 25% от fit, чтобы не «пропадало»
    const min = Math.max(0.25 * fit, 0.05);
    actions.zoomTo(Math.max(min, v[0] / 100));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 min-w-[96vw] w-[96vw] h-[92vh]" aria-describedby="121">
        <DialogTitle>{meta?.name}</DialogTitle>
        {/* Toolbar */}
        <div className="absolute left-1/2 -translate-x-1/2 top-2 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-full px-2 py-1">
          {/* индикатор масштаба */}
          <Badge variant="secondary" className="gap-1">
            <Percent className="h-3.5 w-3.5" /> {zoomLabel}
          </Badge>
          {/* (опц.) индикатор оригинала */}
          {orig && (
            <Badge
              variant="outline"
              className="gap-1"
              title="Оригинальное качество загружено"
            >
              <MonitorSmartphone className="h-3.5 w-3.5" /> HD
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={actions.zoomOut}
            title="Уменьшить (-)"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Slider
            className="w-56"
            value={[sliderValue]}
            min={10}
            max={800}
            step={5}
            onValueChange={setSlider}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={actions.zoomIn}
            title="Увеличить (+)"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <Button
            size="sm"
            variant="secondary"
            onClick={()=> actions.setFit()}
            title="По размеру (F)"
          >
            <Scan className="h-4 w-4 mr-1" /> Fit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={actions.set100}
            title="1:1 (0)"
          >
            <CornerDownRight className="h-4 w-4 mr-1" /> 100%
          </Button>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="relative w-full h-full bg-black/85 overflow-hidden cursor-grab active:cursor-grabbing"
        >
          {src ? (
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={() => {
                setLoaded(true);
                actions.setFit(true);
              }}
              onDoubleClick={onDoubleClick}
              className={cn(
                "select-none will-change-transform",
                loaded ? "opacity-100" : "opacity-0"
              )}
              draggable={false}
              style={{
                transform: `translate(${state.x}px, ${state.y}px) scale(${state.scale})`,
                transformOrigin: "top left",
                // отключаем CSS-скейлинг качества (пусть браузер использует исходник)
                imageRendering: "auto",
                maxWidth: "none",
                maxHeight: "none",
              }}
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
              Загрузка…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

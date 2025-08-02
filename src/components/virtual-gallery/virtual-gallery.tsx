import { photosSelectors } from "@/features/photos";
import { useAppSelector } from "@/hooks";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PhotoThumb } from "../photo-thumb";

export const VirtualGallery = () => {
  const ids = useAppSelector(photosSelectors.selectPhotoIds);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = parentRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [parentRef.current]);
  
  const itemSize = 120,
    gap = 8;
  const cols = Math.max(1, Math.floor((width + gap) / (itemSize + gap)));
  const rows = Math.ceil(ids.length / cols);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemSize + gap,
    overscan: 6,
  });

  const itemsByRow = useMemo(() => {
    const res: string[][] = [];
    for (let r = 0; r < rows; r++) {
      res[r] = ids.slice(r * cols, r * cols + cols) as string[];
    }
    return res;
  }, [ids, rows, cols]);

  if (!ids.length)
    return (
      <div className="text-sm text-slate-600">
        Добавь изображения, чтобы начать.
      </div>
    );

  return (
    <div ref={parentRef} className="border rounded p-2 h-[70vh] overflow-auto">
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((vi) => (
          <div
            key={vi.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${vi.start}px)`,
              paddingBottom: gap,
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, minmax(${itemSize}px, 1fr))`,
              gap,
            }}
          >
            {itemsByRow[vi.index]?.map((id) => (
              <PhotoThumb key={id} id={id} size={itemSize} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

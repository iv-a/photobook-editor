import { getUrl, photosSelectors } from "@/features/photos";
import { useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";

type PhotoThumbProps = {
  id: string;
  size?: number;
};

export const PhotoThumb = ({ id, size = 120 }: PhotoThumbProps) => {
  const meta = useAppSelector((s) => photosSelectors.selectById(s, id));
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let alive = true;
    
    const cb = async () => {
      const u = await getUrl(id, true);
      if (alive) {
        setUrl(u);
      }
    };

    cb();

    return () => {
      alive = false;
    }
  });

  if (!meta) {
    return null;
  }

  return (
    <div style={{ width: size, height: size }} className="overflow-hidden rounded border">
      {url ? (
        <img src={url} alt={meta.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div className="w-full h-full grid place-items-center text-xs text-slate-500">Загрузка…</div>
      )}
    </div>
  );
};

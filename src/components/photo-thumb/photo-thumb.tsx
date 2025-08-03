import { photosSelectors } from "@/features/photos";
import { useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { getThumbUrl } from "@/features/photos/photos.cache";

type PhotoThumbProps = {
  id: string;
  size?: number;
};

export const PhotoThumb = ({ id, size = 240 }: PhotoThumbProps) => {
  const meta = useAppSelector((s) => photosSelectors.selectPhotoById(s, id));
  const [url, setUrl] = useState<string>();

  useEffect(() => {
    let alive = true;
    
    const cb = async () => {
      const u = await getThumbUrl(id);
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
    <div style={{ width: size }} className="overflow-hidden grid place-items-center max-h-[200px]">
      {url ? (
        <img src={url} alt={meta.name} className="object-contain" />
      ) : (
        <div className="text-xs text-muted-foreground">Загрузка…</div>
      )}
      <p className="text-xs text-muted-foreground mb-1">{meta.name}</p>
    </div>
  );
};

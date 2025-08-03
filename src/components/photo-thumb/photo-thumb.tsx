import { getUrl, photosSelectors } from "@/features/photos";
import { useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";

type PhotoThumbProps = {
  id: string;
  size?: number;
};

export const PhotoThumb = ({ id, size = 120 }: PhotoThumbProps) => {
  const meta = useAppSelector((s) => photosSelectors.selectPhotoById(s, id));
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
    <Card style={{ width: size, height: size }} className="overflow-hidden grid place-items-center bg-muted">
      {url ? (
        <img src={url} alt={meta.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      ) : (
        <div className="text-xs text-muted-foreground">Загрузка…</div>
      )}
    </Card>
  );
};

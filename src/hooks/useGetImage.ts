import { photosSelectors } from "@/features/photos";
import { useAppSelector } from "./hooks";
import { useEffect, useState } from "react";
import { getOriginalUrl, getThumbUrl } from "@/features/photos/photos.cache";

export const useGetImage = (id: string | undefined) => {
  const meta = useAppSelector((s) =>
    id ? photosSelectors.selectPhotoById(s, id) : undefined
  );

  const [thumb, setThumb] = useState<string>();
  const [orig, setOrig] = useState<string>();
  const [loaded, setLoaded] = useState(false);

  const src = orig ?? thumb;

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
  }, [id]);

  return {
    meta,
    src,
    loaded,
    thumb,
    orig,
  }
};

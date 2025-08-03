import { pairsSelectors } from "@/features/pairs";
import { photosSelectors } from "@/features/photos";
import { clearAllPhotos } from "@/features/photos/photos.thunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatBytes } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

export const StorageInfo =  () => {
  const dispatch = useAppDispatch();
  const [usage, setUsage] = useState<number>(0);
  const [quota, setQuota] = useState<number>(0);
  const [persisted, setPersisted] = useState<boolean | undefined>(undefined);
  const photoCount = (useAppSelector(photosSelectors.selectPhotoIds)).length;
  const pairCount = (useAppSelector(pairsSelectors.selectPairIds)).length;

  const refresh = async () => {
    const est = await navigator.storage?.estimate();
    setUsage(est?.usage ?? 0);
    setQuota(est?.quota ?? 0);
    const p = await navigator.storage?.persisted?.();
    setPersisted(p);
  }

  useEffect(() => { refresh(); }, []);

  const ratio = quota ? (usage / quota) * 100 : 0;

  return (
    <Card className="p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Хранилище</div>
        <div className="text-xs text-muted-foreground">Фото: {photoCount} • Пары: {pairCount} {persisted ? '• Persist' : ''}</div>
      </div>
      <Progress value={ratio} className="w-full" />
      <div className="text-xs text-muted-foreground">{formatBytes(usage)} / {formatBytes(quota)}</div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={refresh}>Обновить</Button>
        <Button variant="secondary" onClick={async ()=>{ await navigator.storage?.persist?.(); refresh(); }}>Persist</Button>
        <Button variant="destructive" onClick={()=>dispatch(clearAllPhotos()).then(refresh)}>Очистить всё</Button>
      </div>
    </Card>
  );
}

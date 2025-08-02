import { pairsSelectors } from "@/features/pairs";
import { photosSelectors } from "@/features/photos";
import { clearAllPhotos } from "@/features/photos/photos.thunks";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatBytes } from "@/lib/utils";
import { useEffect, useState } from "react";

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

  const ratio = quota ? Math.min(1, usage / quota) : 0;

  return (
    <section className="border rounded p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Хранилище</div>
        <div className="text-xs text-slate-600">
          Фото: {photoCount} • Пары: {pairCount}
        </div>
      </div>

      <div className="w-full h-2 bg-slate-200 rounded">
        <div className="h-2 rounded" style={{ width: `${ratio * 100}%`, background: 'linear-gradient(90deg,#93c5fd,#60a5fa)' }} />
      </div>
      <div className="text-xs text-slate-600">
        {formatBytes(usage)} / {formatBytes(quota)} {persisted ? '• Persist' : ''}
      </div>

      <div className="flex gap-2">
        <button className="border rounded px-3 py-1 text-sm" onClick={refresh}>Обновить</button>
        <button
          className="border rounded px-3 py-1 text-sm"
          onClick={async () => { await navigator.storage?.persist?.(); refresh(); }}
        >
          Запросить persist
        </button>
        <button
          className="border rounded px-3 py-1 text-sm text-red-600 border-red-200"
          onClick={() => dispatch(clearAllPhotos()).then(refresh)}
          title="Удалить из IndexedDB и очистить состояние"
        >
          Очистить всё
        </button>
      </div>
    </section>
  );
}

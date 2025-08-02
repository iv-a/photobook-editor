import { pairingActions, pairingSelectors } from "@/features/pairing";
import { pairsActions } from "@/features/pairs";
import { photosSelectors } from "@/features/photos";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect } from "react";
import { PhotoThumb } from "../photo-thumb";

export const PairingPanel = () => {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(photosSelectors.selectPhotoIds);
  const baseId = useAppSelector(pairingSelectors.selectBaseId);
  const candId = useAppSelector(pairingSelectors.selectCurrentCandidateId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!baseId) return;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
          dispatch(pairingActions.nextCandidate());
          break;
        case "Enter": {
          if (candId) {
            dispatch(pairsActions.keepPair(baseId, candId));
          }
          break;
        }
        case "x":
        case "X": {
          if (candId) {
            dispatch(pairingActions.rejectPair({baseId, candId}));
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dispatch, baseId, candId]);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside className="border rounded p-2 h-[70vh] overflow-auto">
        <div className="text-sm font-medium mb-2">Выбор базового фото</div>
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))' }}>
          {ids.map(id => (
            <button
              key={id}
              className={`rounded border ${baseId === id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => dispatch(pairingActions.setBase(id))}
              title={id}
            >
              <PhotoThumb id={id} size={80} />
            </button>
          ))}
        </div>
      </aside>

      <main className="border rounded p-3 flex flex-col gap-3">
        <div className="flex items-center gap-3 justify-center">
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">База</div>
            {baseId ? <PhotoThumb id={baseId} size={240} /> : <div className="text-sm text-slate-500">Выбери фото слева</div>}
          </div>
          <div className="text-2xl">+</div>
          <div className="text-center">
            <div className="text-xs text-slate-500 mb-1">Кандидат</div>
            {candId ? <PhotoThumb id={candId} size={240} /> : <div className="text-sm text-slate-500">Нет кандидатов</div>}
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          <button className="border rounded px-3 py-1" onClick={() => dispatch(pairingActions.nextCandidate())} disabled={!baseId}>
            Другая пара (→)
          </button>
          <button
            className="border rounded px-3 py-1"
            onClick={() => baseId && candId && dispatch(pairsActions.keepPair(baseId, candId))}
            disabled={!baseId || !candId}
          >
            Оставить (Enter)
          </button>
          <button
            className="border rounded px-3 py-1"
            onClick={() => baseId && candId && dispatch(pairingActions.rejectPair({ baseId, candId }))}
            disabled={!baseId || !candId}
          >
            Не предлагать (X)
          </button>
        </div>
      </main>
    </div>
  );
};

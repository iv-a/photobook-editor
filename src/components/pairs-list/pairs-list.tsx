
import { pairsActions, pairsSelectors } from "@/features/pairs";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { PhotoThumb } from "../photo-thumb";
import { Card } from "../ui/card";
import { pairActions } from "@/features/pair";

export const PairsList = () => {
  const dispatch = useAppDispatch();
  const pairs = useAppSelector(pairsSelectors.selectAllPairs);

  if (!pairs.length) return null;

  return (
    <section className="border rounded p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">Сохранённые пары</h2>
        <div className="text-xs text-slate-500">{pairs.length}</div>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {pairs.map(p => (
          <Card key={p.id} className="border rounded p-2 flex items-center gap-2" onClick={() => dispatch(pairActions.openPair({baseId: p.leftId, candId: p.rightId}))}>
            <PhotoThumb id={p.leftId} size={110} />
            <div className="text-2xl">+</div>
            <PhotoThumb id={p.rightId} size={110} />
            <button
              className="ml-auto border rounded px-2 py-1 text-sm"
              onClick={() => dispatch(pairsActions.removePair(p.id))}
              title="Удалить пару"
            >
              ✕
            </button>
          </Card>
        ))}
      </div>
    </section>
  );
}

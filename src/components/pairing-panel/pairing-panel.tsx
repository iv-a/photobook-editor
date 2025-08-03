import { pairingActions, pairingSelectors } from "@/features/pairing";
import { pairsActions } from "@/features/pairs";
import { photosSelectors } from "@/features/photos";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { SelectableThumb } from "../selectable-thumb";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { PairingProgress } from "../pairing-progress";
import { ImageViewer } from "../image-viewer";

export const PairingPanel = () => {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(photosSelectors.selectPhotoIds);
  const baseId = useAppSelector(pairingSelectors.selectBaseId);
  const candId = useAppSelector(pairingSelectors.selectCurrentCandidateId);
  const [viewer, setViewer] = useState<{ id?: string; open: boolean }>({
    open: false,
  });
  const { left } = useAppSelector(pairingSelectors.selectProgress);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!baseId) return;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowRight":
          dispatch(pairingActions.nextCandidate());
          if (candId) {
            dispatch(pairingActions.markSeen({ baseId, candId }));
          }
          break;
        case "Enter": {
          if (candId) {
            dispatch(pairsActions.keepPair(baseId, candId));
            dispatch(pairingActions.markSeen({ baseId, candId }));
          }
          break;
        }
        case "x":
        case "X": {
          if (candId) {
            dispatch(pairingActions.rejectPair({ baseId, candId }));
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, baseId, candId]);

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <Card className="p-3 h-[70vh]">
        <div className="text-sm font-medium mb-2">Выбор базового фото</div>
        <ScrollArea className="pr-2 h-[90%]">
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
            }}
          >
            {ids.map((id) => (
              <SelectableThumb
                key={id}
                id={id}
                selected={baseId === id}
                onSelect={() => dispatch(pairingActions.setBase(id))}
                onOpen={() => {
                  if (baseId === id) setViewer({ id, open: true });
                }}
              />
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">База</div>
            {baseId ? (
              <SelectableThumb
                id={baseId}
                onSelect={() => {}}
                onOpen={() => setViewer({ id: baseId, open: true })}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Выбери фото слева
              </div>
            )}
          </div>
          <div className="text-2xl">+</div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-1">Кандидат</div>
            {candId ? (
              <SelectableThumb
                id={candId}
                onSelect={() => {}}
                onOpen={() => setViewer({ id: candId, open: true })}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                Нет кандидатов
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!baseId || left === 0}
              onClick={() => {
                if (baseId && candId)
                  dispatch(pairingActions.markSeen({ baseId, candId }));
                dispatch(pairingActions.nextCandidate());
              }}
            >
              Другая пара (→)
            </Button>
            <Button
              disabled={!baseId || !candId}
              onClick={() => {
                if (baseId && candId) {
                  dispatch(pairingActions.markSeen({ baseId, candId }));
                  dispatch(pairsActions.keepPair(baseId, candId));
                }
              }}
            >
              Оставить (Enter)
            </Button>
            <Button
              variant="outline"
              disabled={!baseId || !candId}
              onClick={() =>
                baseId &&
                candId &&
                dispatch(pairingActions.rejectPair({ baseId, candId }))
              }
            >
              Не предлагать (X)
            </Button>
            <Button
              variant="outline"
              disabled={!baseId || left > 0}
              onClick={() =>
                baseId && dispatch(pairingActions.clearSeenForBase(baseId))
              }
              title="Начать заново для выбранной базы"
            >
              Сбросить просмотренных
            </Button>
          </div>
          <PairingProgress />
        </div>
      </Card>

      <ImageViewer
        id={viewer.id}
        open={viewer.open}
        onOpenChange={(v) => setViewer((p) => ({ ...p, open: v }))}
      />
    </div>
  );
};

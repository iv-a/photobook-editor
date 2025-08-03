import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useGetImage } from "@/hooks/useGetImage";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { pairActions, pairSelectors } from "@/features/pair";
import { Button } from "../ui/button";
import { pairingActions, pairingSelectors } from "@/features/pairing";
import { pairsActions } from "@/features/pairs";
import { PairingProgress } from "../pairing-progress";
import { useEffect } from "react";

export const PairViewer = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(pairSelectors.isOpen);
  const isMatchMode = useAppSelector(pairSelectors.isMatchMode);

  const baseId = useAppSelector(pairSelectors.baseId);
  const candId = useAppSelector(pairSelectors.candId);
  const { left } = useAppSelector(pairingSelectors.selectProgress);
  const { src: baseSrc, meta: baseMeta } = useGetImage(baseId);

  const { src: candSrc, meta: candMeta } = useGetImage(candId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!baseId || !isMatchMode) return;

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
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, baseId, candId, isMatchMode]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          dispatch(pairActions.closePair());
        }
      }}
    >
      <DialogContent className="p-5 min-w-[96vw] w-[96vw] max-h-[92vh]">
        {isMatchMode && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-lg px-2 py-2 opacity-0 hover:opacity-100">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={!baseId || left === 0}
                  onClick={() => {
                    if (baseId && candId) {
                      dispatch(pairingActions.markSeen({ baseId, candId }));
                    }
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
                  Сохранить пару (Enter)
                </Button>
                <Button
                  variant="outline"
                  disabled={!baseId}
                  onClick={() =>
                    baseId && dispatch(pairingActions.clearSeenForBase(baseId))
                  }
                  title="Начать заново для выбранной базы"
                >
                  Сбросить просмотренные
                </Button>
              </div>
              <PairingProgress />
            </div>
          </div>
        )}
        <DialogTitle hidden />
        <div className="max-w-[100%] max-h-[100%] grid grid-cols-2 overflow-hidden">
          {baseSrc ? (
            <div className="flex flex-col justify-self-end  gap-1">
              <img
                src={baseSrc}
                alt=""
                className={cn("select-none object-contain grow-1")}
              />
              <p className="text-xs text-muted-foreground mb-1">
                {baseMeta?.name}
              </p>
            </div>
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
              Загрузка…
            </div>
          )}
          {candSrc ? (
            <div className="flex flex-col justify-self-start gap-1">
              <img
                src={candSrc}
                alt=""
                className={cn("select-none object-contain grow-1")}
              />
              <p className="text-xs text-muted-foreground mb-1">
                {candMeta?.name}
              </p>
            </div>
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
              Загрузка…
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

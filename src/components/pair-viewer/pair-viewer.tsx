import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { useGetImage } from "@/hooks/useGetImage";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { pairActions, pairSelectors } from "@/features/pair";
import { Button } from "../ui/button";
import { pairingActions, pairingSelectors } from "@/features/pairing";
import { pairsActions } from "@/features/pairs";
import { PairingProgress } from "../pairing-progress";
import { useEffect, useState } from "react";

export const PairViewer = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(pairSelectors.isOpen);
  const isMatchMode = useAppSelector(pairSelectors.isMatchMode);

  const baseId = useAppSelector(pairSelectors.baseId);
  const candId = useAppSelector(pairSelectors.candId);
  const { left } = useAppSelector(pairingSelectors.selectProgress);
  const { src: baseSrc, meta: baseMeta } = useGetImage(baseId);

  const { src: candSrc, meta: candMeta } = useGetImage(candId);
  const [isReversed, setIsReversed] = useState<boolean>(false);

  let leftContent = baseSrc ? (
    <div className="grid grid-rows-[1fr_max-content] min-h-0">
      <div className="flex items-center justify-center overflow-hidden min-h-0">
        <img
          src={baseSrc}
          alt=""
          className={cn("max-w-full max-h-full object-contain")}
        />
      </div>

      <p className="text-xs text-muted-foreground px-2 py-1 text-center whitespace-normal break-words">
        {baseMeta?.name}
      </p>
    </div>
  ) : (
    <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
      Загрузка…
    </div>
  );

  let rightContent = candSrc ? (
    <div className="grid grid-rows-[1fr_max-content] min-h-0">
      <div className="flex items-center justify-center overflow-hidden min-h-0">
        <img
          src={candSrc}
          alt=""
          className={cn("max-w-full max-h-full object-contain")}
        />
      </div>

      <p className="text-xs text-muted-foreground px-2 py-1 text-center whitespace-normal break-words">
        {candMeta?.name}
      </p>
    </div>
  ) : (
    <div className="w-full h-full grid place-items-center text-sm text-muted-foreground">
      Загрузка…
    </div>
  );

  if (isReversed) {
    [leftContent, rightContent] = [rightContent, leftContent];
  }

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
      <DialogContent className="p-5 min-w-[95vw] w-[95vw] max-h-[95vh] h-[95vh] min-h-0">
        {isMatchMode && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-md border rounded-lg px-2 py-2 opacity-0 hover:opacity-100">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!baseId}
                  onClick={() => setIsReversed((prev) => !prev)}
                  title="Поменять местами"
                >
                  Поменять местами
                </Button>
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
        <div className={cn("grid grid-cols-2 w-full h-full min-h-0")}>
          {leftContent}
          {rightContent}
          </div>
      </DialogContent>
    </Dialog>
  );
};

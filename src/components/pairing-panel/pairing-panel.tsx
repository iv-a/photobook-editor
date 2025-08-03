import { pairingActions, pairingSelectors } from "@/features/pairing";
import { photosSelectors } from "@/features/photos";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { SelectableThumb } from "../selectable-thumb";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { ImageViewer } from "../image-viewer";
import { PhotoThumb } from "../photo-thumb";
import { pairActions } from "@/features/pair";

export const PairingPanel = () => {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(photosSelectors.selectPhotoIds);
  const baseId = useAppSelector(pairingSelectors.selectBaseId);
  const candId = useAppSelector(pairingSelectors.selectCurrentCandidateId);
  const [viewer, setViewer] = useState<{ id?: string; open: boolean }>({
    open: false,
  });

  useEffect(() => {
    if (!baseId || !candId) {
      return;
    }
    dispatch(pairActions.setPair({ baseId, candId }));
  }, [baseId, candId, dispatch]);

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
              <PhotoThumb id={baseId} size={500} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Выбери фото слева
              </div>
            )}
          </div>
        </div>

        <Separator />
        <Button
          disabled={!baseId}
          onClick={() => {
            if (baseId && candId) {
              dispatch(pairActions.openPair({ baseId, candId }));
              dispatch(pairActions.setMode('match'));
            }
          }}
        >
          Начать подбор
        </Button>
      </Card>

      <ImageViewer
        id={viewer.id}
        open={viewer.open}
        onOpenChange={(v) => setViewer((p) => ({ ...p, open: v }))}
      />
    </div>
  );
};

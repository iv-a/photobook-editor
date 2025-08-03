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
import { pairActions } from "@/features/pair";
import { useGetImage } from "@/hooks/useGetImage";
import { cn } from "@/lib/utils";

export const PairingPanel = () => {
  const dispatch = useAppDispatch();
  const ids = useAppSelector(photosSelectors.selectPhotoIds);
  const baseId = useAppSelector(pairingSelectors.selectBaseId);
  const candId = useAppSelector(pairingSelectors.selectCurrentCandidateId);
  const [viewer, setViewer] = useState<{ id?: string; open: boolean }>({
    open: false,
  });
  const { src, meta } = useGetImage(baseId);

  useEffect(() => {
    if (!baseId || !candId) {
      return;
    }
    dispatch(pairActions.setPair({ baseId, candId }));
  }, [baseId, candId, dispatch]);

  return (
    <div className="grid gap-4 md:grid-cols-[320px_1fr]">
      <Card className="p-3 h-[70vh]">
        <div className="text-sm font-medium mb-2">Выбор базового фото</div>
        <ScrollArea className="pr-2 h-[90%]">
          <div
            className="grid gap-2 p-2"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
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

      <Card className="p-4 flex flex-col gap-3 h-[70vh] justify-between">
        <div className="flex flex-col items-center gap-4 text-center min-h-0">
          <p className="flex flex-col gap-1 text-xs text-muted-foreground mb-1">
            База
          </p>
          {baseId ? (
            <div className="grow-1 shrink-1 max-h-[90%]">
              <img
                src={src}
                alt=""
                className={cn("select-none object-contain max-h-full")}
              />
              <p className="text-xs text-muted-foreground mb-1">{meta?.name}</p>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Выбери фото слева
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Separator />
          <Button
            disabled={!baseId}
            onClick={() => {
              if (baseId && candId) {
                dispatch(pairActions.openPair({ baseId, candId }));
                dispatch(pairActions.setMode("match"));
              }
            }}
          >
            Начать подбор
          </Button>
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

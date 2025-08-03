import { useAppDispatch } from "@/hooks";
import { cn } from "@/lib/utils";
import { useRef } from "react";
import { Button } from "../ui/button";
import { deletePhotos } from "@/features/photos";
import { X } from "lucide-react";
import { PhotoThumb } from "../photo-thumb";

type SelectableThumbProps = {
  id: string;
  selected?: boolean;
  onSelect: VoidFunction;
  onOpen: VoidFunction;
}

export const SelectableThumb = ({ id, selected, onSelect,  onOpen }: SelectableThumbProps) => {
  const dispatch = useAppDispatch();
  const clickTimer = useRef<number | null>(null);

  return (
    <div className={cn("relative rounded", selected && "ring-2 ring-primary")}>
      <Button
        variant="secondary" size="icon"
        className="absolute top-1 right-1 z-10 h-6 w-6"
        title="Удалить"
        onClick={(e) => { e.stopPropagation(); dispatch(deletePhotos([id])); }}
      >
        <X className="h-4 w-4" />
      </Button>

      <div
        onClick={() => {
          clickTimer.current = window.setTimeout(() => onSelect(), 180);
        }}
        onDoubleClick={() => {
          if (clickTimer.current) { clearTimeout(clickTimer.current); clickTimer.current = null; }
          onOpen();
        }}
      >
        <PhotoThumb id={id} size={120} />
      </div>
    </div>
  );
  
}

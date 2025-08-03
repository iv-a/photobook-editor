import { importFiles } from "@/features/photos";
import { useAppDispatch } from "@/hooks";
import { useCallback, useRef, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export const FileDrop = () => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setIsOver] = useState(false);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || !files.length) {
        return;
      }

      dispatch(importFiles(Array.from(files)));
    },
    [dispatch]
  );

  return (
    <Card
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onFiles(e.dataTransfer.files);
      }}
      className={`p-3 ${isOver ? 'bg-muted' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Button
          onClick={() => inputRef.current?.click()}
        >
          Выбрать файлы
        </Button>
        <span className="text-sm text-muted-foreground">или перетащи сюда</span>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.currentTarget.files)}
      />
    </Card>
  );
};

import { importFiles } from "@/features/photos";
import { useAppDispatch } from "@/hooks";
import { useCallback, useRef, useState } from "react";

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
    <div
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
      className={`border p-3 rounded ${isOver ? "bg-slate-100" : "bg-white"}`}
    >
      <div className="flex items-center gap-2">
        <button
          className="border rounded px-3 py-1"
          onClick={() => inputRef.current?.click()}
        >
          Выбрать файлы
        </button>
        <span className="text-sm text-slate-600">или перетащи сюда</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => onFiles(e.currentTarget.files)}
      />
    </div>
  );
};

// import { Button } from "@/components/ui/button";
import { ThemeProvider } from "@/contexts/theme/provider";
import { bootstrapPhotos } from "@/features/photos";
import { useAppDispatch } from "@/hooks";
import { useEffect } from "react";
import { FileDrop } from "../file-drop";
import { PairingPanel } from "../pairing-panel";
import { PairsList } from "../pairs-list/pairs-list";

export const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapPhotos());
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist();
    }
  }, [dispatch]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="max-w-5xl mx-auto p-4 flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Photobook — локальный импорт изображений</h1>
      <FileDrop />
      <PairingPanel />
      <PairsList />
      <p className="text-xs text-slate-500">
        Хоткеи: → — следующая, Enter — оставить, X — не предлагать.
      </p>
    </div>
    </ThemeProvider>
  );
};

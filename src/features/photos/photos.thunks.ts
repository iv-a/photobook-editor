import { createAsyncThunk } from "@reduxjs/toolkit";
import { clearAllPhotosFromDB, decodeImageSize, readAllMeta, removeManyFromDB, saveOneToDB } from "./photos.repo";
import { photosActions } from "./photos.slice";
import { revokeAll, revokeMany, seedTemp } from "./photos.cache";
import { pairingActions } from "../pairing";
import { pairsActions } from "../pairs";
import type { RootState } from "@/store";

export const bootstrapPhotos = createAsyncThunk('photos/bootstrap', async (_, { dispatch }) => {
  const meta = await readAllMeta();
  if (meta.length) {
    dispatch(photosActions.upsertMany(meta));
  };
  return meta.length;
});

export const importFiles = createAsyncThunk('photos/import', async (files: File[], { dispatch }) => {
  const jobs: Promise<void>[] = [];

    for (const file of files) {
      const id = crypto.randomUUID();

      // 1) быстрые размеры
      const { width, height } = await decodeImageSize(file);

      // 2) оптимистично кладём метаданные в Redux (UI обновится сразу)
      const meta = { id, name: file.name, width, height };
      dispatch(photosActions.upsertOne(meta));

      // 3) seed временный ObjectURL — превью мгновенно
      seedTemp(id, file);

      // 4) сохранение в БД — в фоне
      jobs.push(saveOneToDB(id, file, meta));
    }

    // ждать не обязательно; можно вернуть сразу:
    await Promise.allSettled(jobs);
    return files.length;
});

export const deletePhotos = createAsyncThunk('photos/delete', async (ids: string[], { dispatch }) => {
  await removeManyFromDB(ids);
  revokeMany(ids);
  dispatch(pairsActions.removeManyPairsByPhotoIds(ids));
  dispatch(photosActions.removeMany(ids));
  return ids.length;
});

export const clearAllPhotos =  createAsyncThunk('photos/clearAll', async (_, { dispatch, getState }) => {
  const state = getState() as RootState;
  const ids = state.photos.ids;

  await clearAllPhotosFromDB();
  revokeAll();
  dispatch(pairsActions.removeManyPairsByPhotoIds(ids));
  dispatch(pairingActions.reset());
  dispatch(pairsActions.clear());
  dispatch(photosActions.clear());
})

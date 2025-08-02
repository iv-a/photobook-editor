import { createAsyncThunk } from "@reduxjs/toolkit";
import { importFilesToDB, readAllMeta, removeManyFromDB } from "./photos.repo";
import { photosActions } from "./photos.slice";

export const bootstrapPhotos = createAsyncThunk('photos/bootstrap', async (_, { dispatch }) => {
  const meta = await readAllMeta();
  if (meta.length) {
    dispatch(photosActions.upsertMany(meta));
  };
  return meta.length;
});

export const importFiles = createAsyncThunk('photos/import', async (files: File[], { dispatch }) => {
  const meta = await importFilesToDB(files);
  dispatch(photosActions.upsertMany(meta));
  return meta.length;
});

export const deletePhotos = createAsyncThunk('photos/delete', async (ids: string[], { dispatch }) => {
  await removeManyFromDB(ids);
  dispatch(photosActions.removeMany(ids));
  return ids.length;
})

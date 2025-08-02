import type { RootState } from "@/store";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

export type PhotoMeta = {
  id: string;
  name: string;
  width: number;
  height: number;
  orientation?: number;
};

const photos = createEntityAdapter<PhotoMeta>({
  sortComparer: (a,  b) => a.name.localeCompare(b.name),
});

const slice = createSlice({
  name: "photos",
  initialState: photos.getInitialState(),
  reducers: {
    upsertMany: photos.upsertMany,
    upsertOne: photos.upsertOne,
    removeMany: photos.removeMany,
    clear: (state) => photos.removeAll(state),
  },
});

export const photosActions = slice.actions;
export default slice.reducer;

const selectSelf = (state: RootState) => state.photos;

export const photosSelectors = photos.getSelectors(selectSelf);

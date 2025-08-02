import { configureStore } from "@reduxjs/toolkit";
import { photosReducer } from "@/features/photos";
import { pairingReducer } from "@/features/pairing";
import { pairsReducer } from "@/features/pairs";

export const store = configureStore({
  reducer: {
    photos: photosReducer,
    pairing: pairingReducer,
    pairs: pairsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

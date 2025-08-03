import { configureStore, createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { db, photosReducer } from "@/features/photos";
import { pairingReducer } from "@/features/pairing";
import { pairsActions, pairsReducer } from "@/features/pairs";
import { pairReducer } from "@/features/pair";

const lm = createListenerMiddleware();

lm.startListening({
  matcher: isAnyOf(pairsActions.keepPair, pairsActions.removePair, pairsActions.clear),
  effect: async (action) => {
    if (pairsActions.keepPair.match(action)) {
      await db.pairs.put(action.payload);
    } else if (pairsActions.removePair.match(action)) {
      await db.pairs.delete(action.payload as string);
    } else if (pairsActions.clear.match(action)) {
      await db.pairs.clear();
    }
  },
});

export const preloadPairs = async (dispatch: AppDispatch) => {
  const all = await db.pairs.toArray();
  if (all.length) {
    dispatch({ type: 'pairs/replaceAll', payload: all });
  }
};

export const store = configureStore({
  reducer: {
    photos: photosReducer,
    pairing: pairingReducer,
    pairs: pairsReducer,
    pair: pairReducer,
  },
  middleware: (gDM) => gDM().prepend(lm.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

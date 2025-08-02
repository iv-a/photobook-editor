import type { RootState } from "@/store";
import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";

export type Pair = {
  id: string;
  leftId: string;
  rightId: string;
  createdAt: number;
};

const pairs = createEntityAdapter<Pair>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

const slice = createSlice({
  name: 'pairs',
  initialState: pairs.getInitialState(),
  reducers: {
    keepPair: {
      reducer: pairs.addOne,
      prepare: (leftId: string, rightId: string) => ({
        payload: { id: crypto.randomUUID(), leftId, rightId, createdAt: Date.now() },
      })
    },
    removePair: pairs.removeOne,
    clear: (s) => pairs.removeAll(s),
    removeManyPairsByPhotoIds: (state, action) => {
      const toDelete: string[] = [];
      const set = new Set(action.payload as string[]);
      for (const id of state.ids as string[]) {
        const p = state.entities[id]!;
        if (set.has(p.leftId) || set.has(p.rightId)) toDelete.push(id);
      }
      pairs.removeMany(state, toDelete);
    },
    replaceAll: (state, action) => {
      pairs.removeAll(state);
      pairs.addMany(state, action.payload);
    },
  }
});

export const pairsActions = slice.actions;
export default slice.reducer;

const selectSelf = (s: RootState) => s.pairs;

const {
  selectAll: selectAllPairs,
  selectIds: selectPairIds,
  selectById: selectPairById
} = pairs.getSelectors(selectSelf);

export const pairsSelectors = {
  selectAllPairs, 
  selectPairIds,
  selectPairById,
}

import type { RootState } from "@/store";
import { createSelector, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { photosSelectors } from "../photos";
import { mulberry32 } from "@/lib/utils";

type PairingState = {
  baseId?: string;
  seed: number;
  step: number;
  rejected: Record<string, true>;
};

const initialState: PairingState = { seed: 123456789, step: 0, rejected: {} };

const pairing = createSlice({
  name: 'pairing',
  initialState,
  reducers: {
    setBase(state, a: PayloadAction<string | undefined>) {
      state.baseId = a.payload;
      state.step = 0;
    },
    nextCandidate(state) {
      state.step += 1;
    },
    setSeed(state, a: PayloadAction<number>) {
      state.seed = a.payload;
    },
    rejectPair(state, a: PayloadAction<{ baseId: string; candId: string }>) {
      state.rejected[`${a.payload.baseId}|${a.payload.candId}`] = true;
      state.step += 1;
    }
  }
});

export const pairingActions = pairing.actions;
export default pairing.reducer;
const selectSelf = (s: RootState) => s.pairing;
const selectBaseId = (s: RootState) => selectSelf(s).baseId;

const selectCandidateIds = createSelector(
  [photosSelectors.selectPhotoIds, selectSelf],
  (ids, { baseId, rejected} )=> {
    if (!baseId) {
      return [];
    }
    const out: string[] = [];
    for (const id of ids) {
      if (id !== baseId && !rejected[`${baseId}|${id}`]) {
        out.push(id);
      }
    }
    return out;
  }
);
const selectCurrentCandidateId = createSelector(
  [selectCandidateIds, selectSelf],
  (cands, {seed, step} ) => {
    if  (!cands.length) return undefined;
    const rnd = mulberry32(seed + step)();
    return cands[Math.floor(rnd * cands.length)];
  }
)

export const pairingSelectors = {
  selectBaseId,
  selectCandidateIds,
  selectCurrentCandidateId,
}

import type { RootState } from "@/store";
import {
  createSelector,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { photosSelectors } from "../photos";
import { mulberry32 } from "@/lib/utils";

type PairingState = {
  baseId?: string;
  seed: number;
  step: number;
  rejected: Record<string, true>;
  seen: Record<string, true>;
};

const initialState: PairingState = {
  seed: 123456789,
  step: 0,
  rejected: {},
  seen: {},
};

const key = (b: string, c: string) => `${b}|${c}`;

const pairing = createSlice({
  name: "pairing",
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
      state.step = 0;
    },
    markSeen(state, a: PayloadAction<{ baseId: string; candId: string }>) {
      state.seen[key(a.payload.baseId, a.payload.candId)] = true;
    },
    rejectPair(state, a: PayloadAction<{ baseId: string; candId: string }>) {
      state.rejected[key(a.payload.baseId, a.payload.candId)] = true;
      state.seen[key(a.payload.baseId, a.payload.candId)] = true;
      state.step += 1;
    },
    reset: () => initialState,
    clearSeenForBase(state, a: PayloadAction<string>) {
      const base = a.payload;
      for (const k of Object.keys(state.seen)) {
        if (k.startsWith(base + '|')) delete state.seen[k];
      }
      state.step = 0;
    },
  },
});

export const pairingActions = pairing.actions;
export default pairing.reducer;
const selectSelf = (s: RootState) => s.pairing;
const selectBaseId = (s: RootState) => selectSelf(s).baseId;

const selectCandidateIds = createSelector(
  [photosSelectors.selectPhotoIds, selectSelf],
  (ids, { baseId, rejected }) => {
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

export const selectPoolIds = createSelector(
  [photosSelectors.selectPhotoIds, selectSelf],
  (ids, { baseId, rejected }) => {
    if (!baseId) return [] as string[];
    const out: string[] = [];
    for (const id of ids as string[]) {
      if (id === baseId) continue;
      if (!rejected[`${baseId}|${id}`]) out.push(id);
    }
    return out;
  }
);

export const selectAvailableIds = createSelector(
  [selectPoolIds, selectSelf],
  (pool, { baseId, seen }) => {
    if (!baseId) return [] as string[];
    return pool.filter(id => !seen[`${baseId}|${id}`]);
  }
);

const selectCurrentCandidateId = createSelector(
  [selectAvailableIds, selectSelf],
  (available, { seed, step }) => {
    if (!available.length) return undefined;
    const rnd = mulberry32(seed + step)();
    return available[Math.floor(rnd * available.length)];
  }
);
export const selectProgress = createSelector(
  [selectPoolIds, selectAvailableIds],
  (pool, available) => {
    const total = pool.length;
    const left = available.length;
    const seen = Math.max(0, total - left);
    return { total, seen, left };
  }
);

export const pairingSelectors = {
  selectBaseId,
  selectCandidateIds,
  selectCurrentCandidateId,
  selectProgress,
  selectPoolIds,
  selectAvailableIds
};

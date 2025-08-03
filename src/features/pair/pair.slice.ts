import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type PairState = {
  isOpen: boolean;
  baseId: string | undefined;
  candId: string | undefined;
  mode: 'view' | 'match';
};

const initialState: PairState = {
  isOpen: false,
  baseId: undefined,
  candId: undefined,
  mode: 'view',
}

const slice = createSlice({
  name: 'pair',
  initialState,
  selectors: {
    isOpen: (state) => state.isOpen,
    baseId: (state) => state.baseId,
    candId: (state) => state.candId,
    isMatchMode: (state) => state.mode === 'match',
    isViewMode: (state) => state.mode === 'view',
  },
  reducers: {
    openPair: (state, action: PayloadAction<{ baseId: string, candId: string }>) => {
      const { baseId, candId } = action.payload;
      state.isOpen = true;
      state.baseId = baseId;
      state.candId = candId;
    },
    setPair: (state, action: PayloadAction<{ baseId: string, candId: string }>) => {
      const { baseId, candId } = action.payload;
      state.baseId = baseId;
      state.candId = candId;
    },
    openDrawer: (state) =>{
      state.isOpen = true
    },
    closePair: () => initialState,
    setMode: (state, action: PayloadAction<'view' | 'match'>) => {
      state.mode = action.payload;
    },
  }
});

export const pairActions = slice.actions;
export default slice.reducer;
export const pairSelectors = {
  isOpen: slice.selectors.isOpen,
  baseId: slice.selectors.baseId,
  candId: slice.selectors.candId,
  isMatchMode: slice.selectors.isMatchMode,
  isViewMode: slice.selectors.isViewMode,
};

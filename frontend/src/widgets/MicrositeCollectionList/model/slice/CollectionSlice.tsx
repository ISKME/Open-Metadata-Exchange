/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface CollectionsByMicrositeState {
    collectionsByMicrosite: [];
}

const initialState: CollectionsByMicrositeState = {
  collectionsByMicrosite: [],
};

export const collectionByMicrositeSlice = createSlice({
  name: 'collectionsByMicrosite',
  initialState,
  reducers: {
    collectionsByMicrositeFetchingSuccess(state, action: PayloadAction<[]>) {
      state.collectionsByMicrosite = action.payload;
    },
  },
});

export default collectionByMicrositeSlice.reducer;

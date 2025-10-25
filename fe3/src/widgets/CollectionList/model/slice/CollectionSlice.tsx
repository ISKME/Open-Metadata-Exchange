/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import {Collection} from 'types/collection'

interface CollectionState {
    library: { sections: [] };
    collections: Collection[];
    filteredCollections: [];
    filtersDisplayed: [];
    filters_selected: [];
    sortBy: [];
    pagination_count: number;
    isLoading: boolean;
    error: string;
}

const initialState: CollectionState = {
  library: { sections: [] },
  collections: [],
  filteredCollections: [],
  filtersDisplayed: [],
  filters_selected: [],
  sortBy: [],
  pagination_count: 0,
  isLoading: false,
  error: '',
};

export const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    libraryFetching(state, action) {
      state.library = action.payload;
    },
    collectionsFetching(state) {
      state.isLoading = true;
    },
    collectionsFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.collections = action.payload;
    },
    filteredCollectionsFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.filteredCollections = action.payload;
    },
    filtersFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.filtersDisplayed = action.payload;
    },
    collectionsFetchingError(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },
    sortBy(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.sortBy = action.payload;
    },
  },
});

export default collectionSlice.reducer;

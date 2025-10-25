/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface ResourcesState {
  resources: [];
  filteredResources: [];
  filtersDisplayed: [];
  filters_selected: [];
  sortBy: [];
  pagination_count: number;
  isLoading: boolean;
  error: string;
}

const initialState: ResourcesState = {
  resources: [],
  filteredResources: [],
  filtersDisplayed: [],
  filters_selected: [],
  sortBy: [],
  pagination_count: 0,
  isLoading: false,
  error: '',
};

export const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    resourcesFetching(state) {
      state.isLoading = true;
    },
    resourcesFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.resources = action.payload;
    },
    filteredResourcesFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.filteredResources = action.payload;
    },
    filtersFetchingSuccess(state, action: PayloadAction<[]>) {
      state.isLoading = false;
      state.error = '';
      state.filtersDisplayed = action.payload;
    },
    resourcesFetchingError(state, action: PayloadAction<string>) {
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

export default resourcesSlice.reducer;

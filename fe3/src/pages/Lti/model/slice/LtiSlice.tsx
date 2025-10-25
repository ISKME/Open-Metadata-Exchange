/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  sorts: [],
  pages: 1,
  count: 0,
  order: '',
  filters: [],
};

export const ltiSlice = createSlice({
  name: 'lti',
  initialState,
  reducers: {
    ltiFetching(state, action) {
      const { items, sortByOptions, sortBy, pagination, filters } = action.payload;
      state.items = items;
      state.sorts = sortByOptions;
      state.pages = pagination.numPages;
      state.count = pagination.count;
      state.order = sortBy;
      state.filters = filters.filter((item) => item.name && item.items.length);
    },
  },
});

export default ltiSlice.reducer;

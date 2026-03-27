/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pages: 1,
  count: 0,
};

export const itemsSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    itemsFetching(state, action) {
      const { items, pagination } = action.payload;
      state.items = items;
      state.pages = pagination.numPages;
      state.count = pagination.count;
    },
    updateItems(state, action){
      const { items } = action.payload;
      state.items = items;
      state.count = items.length;
    }
  },
});

export default itemsSlice.reducer;

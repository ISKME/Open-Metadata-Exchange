/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  cases: [],
  sorts: [],
  pages: 1,
  count: 0,
  order: '',
  topics: [],
  grades: [],
  materials: [],
  standards: [],
};

export const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    casesFetching(state, action) {
      const { items, sortByOptions, sortBy, pagination, filters } = action.payload;
      state.cases = items;
      state.sorts = sortByOptions;
      state.pages = pagination.numPages;
      state.count = pagination.count;
      state.order = sortBy;
      state.standards = filters.find((item) => item.keyword === 'f.std')?.items || [];
      state.grades = filters.find((item) => item.keyword === 'f.grade_codes')?.items || [];
      state.materials = filters.find((item) => item.keyword === 'f.material_types')?.items || [];
      state.topics = filters.find((item) => item.keyword === 'f.general_subject')?.items?.reduce((acc, item) => {
        if (item.level === 0) {
          acc.push({ ...item, children: [] });
        } else {
          const parent = acc[acc.length - 1];
          if (parent) {
            item.parent = parent.slug;
            parent.children.push(item);
          }
        }
        return acc;
      }, []);
    },
    updateCases(state, action){
      const { items } = action.payload;
      state.cases = items;
      state.count = items.length;
    }
  },
});

export default casesSlice.reducer;

/* eslint-disable no-console */
/* eslint-disable max-len */
// @ts-nocheck
import axios from 'axios';
import qs from 'qs';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { itemsSlice } from '../slice/ItemsSlice';

const URL = '/api/myitems/v1/items';

export const fetchItems = (term = '', page = 1, folderId = '', subFolderId = '') => async (dispatch: AppDispatch) => {
  const params = {}
  if (term) params['f.search'] = term;
  if (page) params.page = page;
  if (subFolderId) params['my_subfolder'] = subFolderId
  else if (folderId) params['my_folder'] = folderId
  try {
    const { data } = await axios.get(URL, { params, paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }) });
    dispatch(itemsSlice.actions.itemsFetching(data.resources));
  } catch (e) {
    console.log(e);
  }
};

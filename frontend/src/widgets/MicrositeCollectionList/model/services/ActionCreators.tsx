/* eslint-disable max-len */
import axios from 'axios';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { collectionByMicrositeSlice } from 'widgets/MicrositeCollectionList/model/slice/CollectionSlice';
import { debug } from 'shared/debug';

const URL = '/api/imls/v2/collections/browse/';

export const fetchCollectionsByMicrosite = () => async (dispatch: AppDispatch) => {
  try {
    const promise = axios.get(URL);
    const dataPromise = await promise
      .then((res: { data: any; }) => res.data.collections);
    dispatch(collectionByMicrositeSlice.actions.collectionsByMicrositeFetchingSuccess(dataPromise.filters[0].items));
  } catch (e) {
    debug(e);
  }
};

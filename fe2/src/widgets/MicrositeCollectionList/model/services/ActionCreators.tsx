/* eslint-disable no-console */
/* eslint-disable max-len */
import axios from 'axios';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { collectionByMicrositeSlice } from 'widgets/MicrositeCollectionList/model/slice/CollectionSlice';

const URL = `${process.env.REACT_APP_API_URL}/api/imls/v2/collections/browse/`;

export const fetchCollectionsByMicrosite =
	() => async (dispatch: AppDispatch) => {
		try {
			const promise = axios.get(URL);
			const dataPromise = await promise.then(
				(res: { data: any }) => res.data.collections
			);
			dispatch(
				collectionByMicrositeSlice.actions.collectionsByMicrositeFetchingSuccess(
					dataPromise.filters[0].items
				)
			);
		} catch (e) {
			console.log(e);
		}
	};

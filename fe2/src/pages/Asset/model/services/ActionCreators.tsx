/* eslint-disable no-console */
/* eslint-disable max-len */
import axios from 'axios';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { collectionDetailsSlice } from 'pages/CollectionDetails/model/slice/CollectionDetailsSlice';

const URL = `${process.env.REACT_APP_API_URL}/api/imls/v2/collections/`;

export const fetchCollectionDetailsResources =
	(path) => async (dispatch: AppDispatch) => {
		try {
			dispatch(collectionDetailsSlice.actions.resourcesFetching());
			const response = axios.get(`${URL}${path}/resources`, {
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				withCredentials: false,
			});
			const dataPromise = await response.then(
				(res: { data: any }) => res.data.resources.items
			);
			console.log(dataPromise);
			dispatch(
				collectionDetailsSlice.actions.resourcesFetchingSuccess(dataPromise)
			);
		} catch (e) {
			dispatch(
				collectionDetailsSlice.actions.resourcesFetchingError(e.message)
			);
		}
	};

export const fetchFilters = (path) => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionDetailsSlice.actions.resourcesFetching());
		const promise = axios.get(`${URL}${path}/resources`, {
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			withCredentials: false,
		});
		const dataPromise = await promise.then((res: { data: any }) => res.data);
		dispatch(
			collectionDetailsSlice.actions.filtersFetchingSuccess(
				dataPromise.resources.filters
			)
		);
	} catch (e) {
		dispatch(collectionDetailsSlice.actions.resourcesFetchingError(e.message));
	}
};

export const loadFilteredResources =
	(path) => async (dispatch: AppDispatch) => {
		try {
			dispatch(collectionDetailsSlice.actions.resourcesFetching());
			const promise = axios.get(`${URL}${path}/resources`, {
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				withCredentials: false,
			});
			const dataPromise = await promise.then(
				(res: { data: any }) => res.data.resources.items
			);
			dispatch(
				collectionDetailsSlice.actions.filteredResourcesFetchingSuccess(
					dataPromise
				)
			);
		} catch (e) {
			dispatch(
				collectionDetailsSlice.actions.resourcesFetchingError(e.message)
			);
		}
	};

export const loadSortBy = (path) => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionDetailsSlice.actions.resourcesFetching());
		const promise = axios.get(`${URL}${path}/resources`, {
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			withCredentials: false,
		});
		const dataPromise = await promise.then(
			(res: { data: any }) => res.data.resources.sortByOptions
		);
		dispatch(collectionDetailsSlice.actions.sortBy(dataPromise));
	} catch (e) {
		dispatch(collectionDetailsSlice.actions.resourcesFetchingError(e.message));
	}
};

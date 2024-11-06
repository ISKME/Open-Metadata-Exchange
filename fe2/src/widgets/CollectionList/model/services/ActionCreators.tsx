/* eslint-disable no-console */
/* eslint-disable max-len */
import axios from 'axios';
import { collectionSlice } from 'widgets/CollectionList/model/slice/CollectionSlice';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';

const URL = `${process.env.REACT_APP_API_URL}/api/imls/v2/collections/browse/`;

export const fetchLibrary = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionSlice.actions.collectionsFetching());
		const response = await axios.get(
			`${process.env.REACT_APP_API_URL}/api/imls/v2/explore-oer-exchange/`
		);
		dispatch(collectionSlice.actions.libraryFetching(response.data));
		// eslint-disable-next-line no-empty
	} catch (e) {}
};

export const fetchCollections = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionSlice.actions.collectionsFetching());
		const response = await axios.get(URL);
		dispatch(
			collectionSlice.actions.collectionsFetchingSuccess(
				response.data.collections.items
			)
		);
	} catch (e) {
		dispatch(collectionSlice.actions.collectionsFetchingError(e.message));
	}
};

export const fetchFilters = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionSlice.actions.collectionsFetching());
		const promise = axios.get(URL);
		const dataPromise = await promise.then(
			(res: { data: any }) => res.data.collections
		);
		dispatch(
			collectionSlice.actions.filtersFetchingSuccess(dataPromise.filters)
		);
	} catch (e) {
		dispatch(collectionSlice.actions.collectionsFetchingError(e.message));
	}
};

export const loadFilteredCollections =
	(path) => async (dispatch: AppDispatch) => {
		try {
			dispatch(collectionSlice.actions.collectionsFetching());
			const promise = axios.get(`${URL}${path}`);
			const dataPromise = await promise.then(
				(res: { data: any }) => res.data.collections
			);
			dispatch(
				collectionSlice.actions.filteredCollectionsFetchingSuccess(
					dataPromise.items
				)
			);
		} catch (e) {
			dispatch(collectionSlice.actions.collectionsFetchingError(e.message));
		}
	};

export const loadSharedCollections =
	(page = 1) =>
	async (dispatch: AppDispatch) => {
		try {
			dispatch(collectionSlice.actions.collectionsFetching());
			const promise = axios.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker?per_page=9&page=${page}`
			);
			const dataPromise = await promise.then(
				(res: { data: any }) => res.data.collections
			);
			dispatch(
				collectionSlice.actions.filteredCollectionsFetchingSuccess(
					dataPromise.items
				)
			);
		} catch (e) {
			dispatch(collectionSlice.actions.collectionsFetchingError(e.message));
		}
	};

export const loadSortBy = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(collectionSlice.actions.collectionsFetching());
		const promise = axios.get(URL);
		const dataPromise = await promise.then(
			(res: { data: any }) => res.data.collections.sortByOptions
		);
		dispatch(collectionSlice.actions.sortBy(dataPromise));
	} catch (e) {
		dispatch(collectionSlice.actions.collectionsFetchingError(e.message));
	}
};

/* eslint-disable no-console */
/* eslint-disable max-len */
import axios from 'axios';
import { resourcesSlice } from 'widgets/ResourcesList/model/slice/ResourcesSlice';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';

const URL = `${process.env.REACT_APP_API_URL}/api/imls/v2/resources/`;

export const fetchResources =
	(page = 0) =>
	async (dispatch: AppDispatch) => {
		try {
			dispatch(resourcesSlice.actions.resourcesFetching());
			const response = await axios.get(URL + (page ? `?page=${page}` : ''));
			dispatch(
				resourcesSlice.actions.resourcesFetchingSuccess(
					response.data.resources.items
				)
			);
		} catch (e) {
			dispatch(resourcesSlice.actions.resourcesFetchingError(e.message));
		}
	};

export const fetchFilters = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(resourcesSlice.actions.resourcesFetching());
		const promise = axios.get(URL);
		const dataPromise = await promise.then((res: { data: any }) => res.data);
		dispatch(
			resourcesSlice.actions.filtersFetchingSuccess(
				dataPromise.resources.filters
			)
		);
	} catch (e) {
		dispatch(resourcesSlice.actions.resourcesFetchingError(e.message));
	}
};

export const loadFilteredResources =
	(path) => async (dispatch: AppDispatch) => {
		try {
			dispatch(resourcesSlice.actions.resourcesFetching());
			const promise = axios.get(`${URL}${path}`);
			const dataPromise = await promise.then(
				(res: { data: any }) => res.data.resources.items
			);
			dispatch(
				resourcesSlice.actions.filteredResourcesFetchingSuccess(dataPromise)
			);
		} catch (e) {
			dispatch(resourcesSlice.actions.resourcesFetchingError(e.message));
		}
	};

export const loadSortBy = () => async (dispatch: AppDispatch) => {
	try {
		dispatch(resourcesSlice.actions.resourcesFetching());
		const promise = axios.get(URL);
		const dataPromise = await promise.then(
			(res: { data: any }) => res.data.resources.sortByOptions
		);
		dispatch(resourcesSlice.actions.sortBy(dataPromise));
	} catch (e) {
		dispatch(resourcesSlice.actions.resourcesFetchingError(e.message));
	}
};

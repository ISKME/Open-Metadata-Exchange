/* eslint-disable no-console */
/* eslint-disable max-len */
// @ts-nocheck
import axios from 'axios';
import qs from 'qs';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { ltiSlice } from '../slice/LtiSlice';

const URL = `${process.env.REACT_APP_API_URL}/api/search/v2/browse/`;

export const fetchLti =
	(term = '', page = 1, sort, filters = {}) =>
	async (dispatch: AppDispatch) => {
		const params = {};
		if (term) params['f.search'] = term;
		if (page) params.page = page;
		if (sort) params.sort_by = sort;
		for (const filter in filters) {
			if (params[filter]) params[filter].push(filters[filter]);
			else params[filter] = [filters[filter]];
		}
		try {
			const { data } = await axios.get(URL, {
				params,
				paramsSerializer: (params) =>
					qs.stringify(params, { arrayFormat: 'repeat' }),
			});
			dispatch(ltiSlice.actions.ltiFetching(data.resources));
		} catch (e) {
			console.log(e);
		}
	};

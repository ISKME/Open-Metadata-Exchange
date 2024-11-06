/* eslint-disable no-console */
/* eslint-disable max-len */
// @ts-nocheck
import axios from 'axios';
import qs from 'qs';
import { AppDispatch } from 'app/providers/StoreProvider/config/store';
import { casesSlice } from '../slice/CasesSlice';

const URL = `${process.env.REACT_APP_API_URL}/api/search/v2/browse/`;

export const fetchCases =
	(term = '', page = 1, sort, topics = [], grades = [], frameworks = []) =>
	async (dispatch: AppDispatch) => {
		const params = {};
		if (term) params['f.search'] = term;
		if (page) params.page = page;
		if (sort) params.sort_by = sort;
		if (topics && topics.length) params['f.general_subject'] = topics;
		if (grades && grades.length) params['f.grade_codes'] = grades;
		if (frameworks && frameworks.length)
			params['f.atlas_alignment_standard'] = frameworks;
		try {
			const { data } = await axios.get(URL, {
				params,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				withCredentials: false,

				paramsSerializer: (params) =>
					qs.stringify(params, { arrayFormat: 'repeat' }),
			});
			dispatch(casesSlice.actions.casesFetching(data.resources));
		} catch (e) {
			console.log(e);
		}
	};

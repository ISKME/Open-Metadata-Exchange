/* eslint-disable no-console */
/* eslint-disable max-len */
// @ts-nocheck
import axios from 'axios'
import qs from 'qs'
import { AppDispatch } from 'app/providers/StoreProvider/config/store'
import { casesSlice } from '../slice/CasesSlice'
import { extractUrlParams } from 'shared/lib/global';

export const fetchCases = (URL, groupId = '', folderId = '', subFolderId = '', resources = false) => async (dispatch: AppDispatch) => {
  const params = extractUrlParams()
  if (groupId) params['f.group'] = groupId
  if (folderId) params['f.folder'] = folderId
  if (subFolderId) params['f.subfolder'] = subFolderId
  try {
    // const paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' })
    // const { data } = await axios.get(URL, { params, paramsSerializer })
    // const framework = {}
    // const standards = await axios.get('/standards/list-existing/standard', { params, paramsSerializer })
    // framework.standards = standards
    // if (frameworks && frameworks.atlas_alignment_standard) {
    //   const areas = await axios.get('/standards/list-existing/framework_area', { params, paramsSerializer })
    //   framework.areas = frameworkArea
    // }
    // if (frameworks && frameworks.atlas_alignment_framework_area) {
    //   const tags = await axios.get('/standards/list-existing/tag', { params, paramsSerializer })
    //   framework.tags = tags
    // }
    // dispatch(casesSlice.actions.casesFetching({ ...data.resources, framework }))
    params.source = resources ? 'submitted' : 'courseware'
    const { data } = await axios.get(URL, { params, paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }) })
    dispatch(casesSlice.actions.casesFetching(data.resources))
  } catch (e) {
    console.log(e)
  }
};

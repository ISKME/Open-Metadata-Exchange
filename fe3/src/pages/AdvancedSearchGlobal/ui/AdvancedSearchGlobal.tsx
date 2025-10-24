/* eslint-disable func-names */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { IFilterMap, CheckboxFilter, CheckboxDL, CheckboxUL, StdFilter } from 'widgets/Filters';
import { convertFlatToTree } from 'widgets/Filters/lib/tree';

export function AdvancedSearchGlobal() {
  const [filters, setFilters] = useState<IFilterMap>({})
  const [selected, setSelected] = useState([])
  const [stdItems, setStdItems] = useState([])

  const handlers = {
    onSelect: (keyword, value) => {
      setSelected([...selected, { keyword: keyword, value: value }])
    },

    onUnSelect: (value) => {
      setSelected(selected.filter(item => item.value !== value))
    },

    clear: () => {
      setSelected([])

      stdItems.forEach(item => {
        item.items = []
        item.isSelected = false
      })

      setStdItems([...stdItems])
    },
  }

  function submitSearch() {
    const query = selected.map(item => `${encodeURIComponent(item.keyword)}=${encodeURIComponent(item.value)}`).join('&')
    window.location.href = `/courseware/new?${query}`
  }

  const settings = {
    grade_codes: {
      header: 'Grade Level',
      className: 'filter-block-grades filter-block-hide-input',
    },
    core_propositions: {
      header: 'NBPTS Five Core Propositions',
      className: 'filter-block-core_propositions',
    },
    general_subjects: {
      header: 'Subject & Topic',
      className: 'filter-block-subjects',
      cols: 3,
    },
    instructional_strategies	: {
      header: 'Instructional Strategies',
      className: 'filter-block-instructional_strategies',
      cols: 2,
    },
    certificate_area: {
      cols: 2,
    },
    std: {
      header: 'Framework',
      className: 'educational-standards-widget',
    },
  }

  const useFilter = (filterName, component, propsComponent) => {
    const filter = filters[filterName]
    propsComponent = propsComponent || {}
  
    if (filter) {
      const propsFilter = settings[filterName] || {}
      const props = {
        filter: filter,
        header: filter.name,
        selected: selected,
        cols: 1,
        ...propsFilter,
        ...propsComponent,
        ...handlers,
      }
      return component(props)
    }
  }

  function useCheckboxFilter(filterName: string, listComponent=null) {
    return useFilter(filterName, CheckboxFilter, { listComponent: listComponent || CheckboxUL })
  }

  function useStdFilter() {
    const filterName = 'std'
  
    const handleSelect = (filter, value) => {
      setSelected(prevSelected => {
        const updatedSelected = prevSelected.filter(item => item.keyword !== filter.keyword)
        updatedSelected.push({ keyword: filter.keyword, value: value })
        return updatedSelected
      })
    
      axios.get(`/api/search/v2/browse/filters?${filter.keyword}=${value}`).then(({ data }) => {
        if (data.filters && data.filters[filterName]) {
          setStdItems(data.filters[filterName].items || [])
        }
      })
    }

    return useFilter(filterName, StdFilter, { onChange: handleSelect, items: stdItems })
  }

  useEffect(() => {
    axios.get('/api/search/v2/browse/filters').then(({ data }) => {
      let filtersTree = {}
      let filters: IFilterMap = data.filters
      Object.entries(filters).forEach(([name, filter]) => {
        filtersTree[name] = filter
        filtersTree[name].items = convertFlatToTree(filter.items)
      })
      setFilters(filtersTree)
      setStdItems(filters.std.items || [])
    })
  }, [])

  return (
    <div className='container' style={{ marginTop: '50px' }}>
      <h2 className='page-title'>Advanced Search</h2>
      <form action='/courseware/new'>
        <div className="row">
          <div className="search-input-ct control-panel control-panel-form-group col-sm-8 col-md-9">
            <div className="search-box" style={{ width: '100%' }}>
              <input
                aria-label="Enter a keyword or search term"
                name="f.search"
                placeholder="Enter a keyword or search term"
                type="text"
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <div className="top-action-buttons col-sm-4 col-md-3">
            <input type="button" className="btn btn-default" value="Search" onClick={submitSearch}/>
            <a href="#" className="btn btn-link js-reset-form" onClick={handlers.clear}>Clear</a>
          </div>
        </div>
        <div className='row'>
        <div className='col-md-4'>
            {useCheckboxFilter('grade_codes')}
          </div>
          <div className='col-md-4'>
            {useCheckboxFilter('core_propositions')}
          </div>
          <div className='col-md-4'>
            {useStdFilter()}
          </div>
        </div>
        <div className='row'>
          <div className='col-md-12'>
            {useCheckboxFilter('general_subjects', CheckboxDL)}
          </div>
        </div>
        <div className='row'>
          <div className='col-md-8'>
            {useCheckboxFilter('instructional_strategies')}
          </div>
          <div className='col-md-4'>
            {useCheckboxFilter('school_setting')}
          </div>
        </div>
        <div className='row'>
          <div className='col-md-4'>
            {useCheckboxFilter('exceptionalities')}
          </div>
          <div className='col-md-8'>
            {useCheckboxFilter('certificate_area')}
          </div>
        </div>
        <div style={{ marginBottom: '30px' }}>
          <input type="button" className="btn btn-default" value="Search" onClick={submitSearch}/>
          <a href="#" className="btn btn-link js-reset-form" onClick={handlers.clear}>Clear</a>
        </div>
      </form>
    </div>
  )
}
// @ts-nocheck
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import api from './api/axios';
import * as qs from 'query-string';
import SearchBar from './components/Input';
import Dropdown from './components/Dropdown';
import { ArkResourceCard } from './widgets/Card'
import { Button, Drawer, Box } from '@mui/material';
import { Filter } from './widgets/Filter';
import CircleLoader from './icons/Loader';
import cls from './styles.module.scss';
import { FilterAlt } from '@mui/icons-material';

let PAGE = 1;

let fSearch = '';
let fSubject = {};
let fSort = '';

function checkOverflow(el) {
  const curOverflow = el.style.overflow;
  if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
  const isOverflowing = el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
  el.style.overflow = curOverflow;
  return isOverflowing;
}

function Filters({ filters, checked, onChange }) {
  return (
    <ul className={cls.filters}>
      <h2 style={{ fontSize: '24px', marginBottom: 18 }}>Filters</h2>
      {filters.filter((filter) => filter.keyword !== 'tenant').map((el) => (
        <Filter
          key={el.name}
          filter={el}
          onFilterChange={onChange}
          checkMarks={checked}
        />
      ))}
      <Button sx={{ backgroundColor: '#454141', color: '#ffffff', mt: 2 }}>Search</Button>
      <Button sx={{ color: '#454141', mt: 2 }}>Reset</Button>
    </ul>
  );
}

export default function ArkCollectionResources() {
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checked, setChecked] = useState({});
  const [sortBy, setSortBy] = useState([]);
  const [sorted, setSorted] = useState('');
  const [totalNumber, setTotalNumber] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(searchParams.get('f.search'));
  const [hasAdd, setHasAdd] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [small, setSmall] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [info, setInfo] = useState()
  const [more, setMore] = useState(true);

  const params = useParams();
  let details = params['*'];
  if (details.endsWith('/')) details = details.substring(0, details.length - 1);

  fSearch = inputValue;
  fSubject = checked;
  fSort = sorted;

  const { search } = useLocation();

  const toggleDrawer = (newOpen) => () => setOpen(newOpen);

  useEffect(() => {
    if (info?.abstract) setMore(checkOverflow(document.getElementById('compress')));
  }, [info?.abstract]);

  const fetcher = async (queries) => {
    queries += `${queries ? '&' : '?'}page=${PAGE}`
    try {
      const { data } = await api.get(`/api/search/v2/browse/${queries}&f.collection=${details}&source=courseware`);
      return data.resources;
    } catch (e) { return [] }
  };

  async function dataFetch() {
    const { data } = await api.get(`/api/curatedcollections/v2/curatedcollections/${details}`)
    setInfo(data?.collection)
    // id, name, micrositeName, micrositeSlug, numResources, educationLevels, updatedOn, thumbnail, abstract, subscribed

    document.title = data?.collection?.name && data?.clientInfo?.name
      ? `${data.collection.name} Collection | ${data.clientInfo.name}`
      : 'Collection | Digital Public Goods Library';
  }

  function update(key: any) {
    let queries = qs.parse(search);
    if (key === 'clear') queries = {};
    if (fSearch) queries['f.search'] = fSearch.toLowerCase();
    else delete queries['f.search'];
    if (key && fSubject[key]) queries[key] = fSubject[key];
    if (fSort) queries.sortby = fSort;
    setSearchParams(queries);
    if (key === 'append') {
      PAGE++;
    } else {
      setResources([]);
      PAGE = 1;
    }
    setIsLoading(true);
    fetcher(window.location.search.toString()).then((data) => {
      if (key === 'append') {
        if (!data?.items?.length) setHasAdd(false);
        else setResources(resources.concat(data.items));
      } else if (data) {
        setResources(data.items);
        setTotalNumber(data.pagination.count);
        setFilters(data.filters);
      }
      setIsLoading(false);
    });
  }

  useEffect(() => {
    dataFetch()
    fetcher(window.location.search.toString())
      .then(({
        items, filters, pagination, sortByOptions,
      }) => {
        setResources(items);
        setIsLoading(false);
        setSortBy(sortByOptions);
        setSorted(sortByOptions.find((item) => item.slug === searchParams.get('sortby'))?.name);
        setTotalNumber(pagination.count);
        searchParams.delete('page');
        setFilters(filters);
        const params: any = qs.parse(search);
        for (const key in params) {
          if (!Array.isArray(params[key])) {
            params[key] = [params[key]];
          }
        }
        setChecked(params);
        // updatePath(null);
      });

    const handleResize = () => setSmall(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [])

  const handleSelectChange = ({ target }) => {
    setSorted(target.value);
    fSort = sortBy.find((item) => item.name === target.value)?.slug;
    update(null);
  };

  const handleFilterChange = useCallback((event: any) => {
    const slug = event.target.getAttribute('data-slug');
    const { value } = event.target;
    const updatedList = { ...checked };
    if (event.target.checked) {
      if (updatedList.hasOwnProperty(slug)) {
        updatedList[slug].push(value);
      } else {
        updatedList[slug] = [value];
      }
    } else {
      updatedList[slug]?.splice(updatedList[slug].indexOf(value), 1);
    }
    setChecked(updatedList);
    fSubject = updatedList || {};
    update(slug);
  }, [checked]);

  const handleClearSearchParams = () => {
    setSearchParams('');
    setChecked({});
    setInputValue('');
  };

  function handleInputChange() {
    fSearch = inputValue.trim().toLowerCase();
    update(null);
  }

  function handleSearching() {
    update(null);
  }

  function addMoreItems() {
    update('append');
  }

  function onPress({ key }) {
    if (key === 'Enter') {
      update(null);
    }
  }

  function clearing() {
    setInputValue('');
    fSearch = '';
    update(null);
  }

  return (
    <div>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {!!filters?.length && <Box sx={{ p: 2 }}>
          <Filters filters={filters} checked={checked} onChange={handleFilterChange} />
        </Box>}
      </Drawer>
      {info && <div style={{ marginBottom: '34px' }}>
        <div className={cls.collection_header}>
          <div>
            <img src={info.thumbnail} alt={info.name} />
          </div>
          <div style={{ flex: 1 }}>
            <div>
              <h1>{info.name}</h1>
              {`${info.numResources} resources`}
            </div>
            <div className={cls.desc}>
              <div>
                <h4>Education Level:</h4>
                <span className={cls.shorten}>
                  {info.educationLevels?.slice(0, 3)?.join(', ')}
                </span>
              </div>
              <div>
                <h4>Last Updated:</h4>
                {new Date(info.updatedOn).toDateString().substring(4)}
              </div>
            </div>
          </div>
        </div>
        <h4><b>Overview:</b></h4>
        <div style={{ position: 'relative', fontFamily: 'Inter' }}>
          <div id="compress" className={more && cls.compress} dangerouslySetInnerHTML={{ __html: info.abstract }} style={{ width: 'calc(100% - 100px)' }} />
          {more && <Button className={cls.overview_link} onClick={() => setMore(false)}>Read More</Button>}
        </div>
      </div>}
      <div className={cls.searchBlock}>
        <SearchBar value={inputValue} onChange={({ target }) => setInputValue(target.value)} onSearch={handleInputChange} placeholder="Search" matomoAction = 'collection search' />
        <Dropdown label="Sort" multiple={false} value={sorted} options={sortBy} onChange={handleSelectChange} />
        {small && <Button
          size="large"
          variant="contained"
          endIcon={<FilterAlt />}
          onClick={toggleDrawer(true)}
          sx={{
            paddingLeft: '32px',
            paddingRight: '32px',
            height: '48px',
            boxShadow: 'none',
            borderRadius: '8px',
          }}
        >Filters</Button>}
      </div>
      {/* {isLoading && <h3>Loading...</h3>}
      {error && <h3>{error}</h3>} */}
      <div className={cls.searchResults}>
        {!small && !!filters?.length && <Filters filters={filters} checked={checked} onChange={handleFilterChange} />}
        <div className={cls.resourcesList}>
          <span style={{ position: 'absolute', top: '-24px' }}>{`${totalNumber} Resources`}</span>
          <ul>
            {!!resources?.length && resources.map((el, i) => (
              <ArkResourceCard resource={el} key={el?.id || i} />
            ))}
          </ul>
          {(!isLoading && (resources && resources.length === 0)) && (
            <div className={cls.loaderContainer}>
              <span style={{ fontSize: '16px', color: '#474F60' }}>No results found.</span>
              <span style={{ fontSize: '12px', color: '#474F60' }}>Try adjusting your search or filter to find what you are looking for.</span>
            </div>
          )}
          {isLoading && (
            <div className={cls.loaderContainer}>
              <CircleLoader color="#454141" />
              Loading...
            </div>
          )}
          {!isLoading && hasAdd && <Button sx={{ backgroundColor: '#454141', color: '#ffffff' }} onClick={() => addMoreItems()}>+ Load More</Button>}
        </div>
      </div>
    </div>
  );
}

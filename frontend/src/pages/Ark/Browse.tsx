/* eslint-disable react/jsx-no-bind */
// @ts-nocheck
import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Drawer,
  List,
  ListItem,
  Checkbox,
  FormControlLabel,
  Pagination,
  Paper,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import api from './api/axios';
import qs from 'qs';
import { CollectionItemCard } from './widgets/Collection';
import { Filter } from './widgets/Filter';
import Dropdown from './components/Dropdown';
import SearchBar from './components/Input';
import CircleLoader from './icons/Loader';
import cls from './styles.module.scss';

const PAGE_SIZE = 9;

let fSort = ''
let fSearch = ''
let fSubject = {}

function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const setParams = (params) => setSearchParams({ ...Object.fromEntries([...searchParams]), ...params });
  return [Object.fromEntries([...searchParams]), setParams];
}

function Filters({ filters, checked, onChange }) {
  return (
    <ul className={cls.filters} style={{ minWidth: 'unset' }}>
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

export default function AllCollections() {
  const [query, setQuery] = useState('');
  const [collections, setCollections] = useState([]);
  const [filters, setFilters] = useState([]);
  const [checked, setChecked] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [sortOptions, setSortOptions] = useState([]);
  const [page, setPage] = useState(1);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [params, setParams] = useQueryParams();
  const location = useLocation();
  const navigate = useNavigate();

  fSearch = query
  fSort = sortOptions?.find((item) => item.name === sortBy)?.slug || ''
  fSubject = checked

  // Sync state with URL params
  useEffect(() => {
    setQuery(fSearch)
    setSortBy(fSort)
    setChecked(fSubject)
    // setPage(Number(params['page'] || 1))
  }, [location.search])
  useEffect(() => {
    setQuery(fSearch)
    setSortBy(fSort)
    setChecked(fSubject)
  }, []);

  function fetchData() {
    setLoading(true);
    setNotFound(false);
    const fetchParams = {
      'f.search': fSearch,
      sort: fSort,
      page,
      per_page: PAGE_SIZE,
      ...fSubject,
    };
    const paramsSerializer = (params) => qs.stringify(params, { arrayFormat: 'repeat' })
    api
      .get('/api/curatedcollections/v2/curatedcollections', { params: fetchParams, paramsSerializer })
      .then(({ data }) => {
        setCollections(data.collections.items || []);
        setItemCount(data.collections.pagination.count || 0);
        setNotFound((data.collections.items || []).length === 0);
        setFilters(data.collections.filters || []);
        setSortOptions(data.collections.sortByOptions || []);
        setParams({ 'f.search': fSearch, sort: fSort, page: 1 });
      })
      .finally(() => setLoading(false));
  }

  useEffect(fetchData, []);

  // Fetch collections (and filters!) on query/filter/sort/page change
  useEffect(fetchData, [checked, sortBy, page]);

  // Handlers
  const handleSearchChange = () => {
    fSearch = query.trim().toLowerCase()
    fetchData()
  }
  const handleSortChange = ({ target }) => {
    setSortBy(target.value);
    fSort = sortOptions.find((item) => item.name === target.value)?.slug
    fetchData()
  };
  const handlePageChange = (_, value) => {
    setPage(value);
    setParams({ page: value });
  };
  // const handleFilterChange = (filterName, value) => {
  //   setChecked((prev) => {
  //     const next = { ...prev };
  //     if (!next[filterName]) next[filterName] = [];
  //     if (next[filterName].includes(value)) {
  //       next[filterName] = next[filterName].filter((v) => v !== value);
  //     } else {
  //       next[filterName].push(value);
  //     }
  //     setParams({ [filterName]: next[filterName].join(','), page: 1 });
  //     return next;
  //   });
  // };
  const handleFilterChange = (event) => {
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
    fetchData()
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        All Collections
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        All of the collections shared to The Digital Public Goods Library
      </Typography>
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <SearchBar value={query} onChange={({ target }) => setQuery(target.value)} onSearch={handleSearchChange} placeholder="Search Collections" matomoAction = 'collection search' />
        <Dropdown label="Sort" multiple={false} value={sortBy} options={sortOptions} onChange={handleSortChange} />
        <Button
          variant="contained"
          startIcon={<FilterAltIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{ display: { lg: 'none' } }}
        >
          Filters
        </Button>
      </Paper>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Sidebar Filters */}
        <Paper
          sx={{
            width: 260,
            p: 2,
            display: { sm: 'none', lg: 'block' },
            alignSelf: 'flex-start',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {!!filters?.length && <Filters filters={filters} checked={checked} onChange={handleFilterChange} />}
        </Paper>
        {/* Drawer for mobile filters */}
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {!!filters?.length && <Filters filters={filters} checked={checked} onChange={handleFilterChange} />}
        </Drawer>
        {/* Collections Grid */}
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <div className={cls.loaderContainer}>
              <CircleLoader color="#454141" />
              Loading...
            </div>
          ) : notFound ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No results found.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search or filter to find what you are looking for.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, minmax(225px, 1fr))' },
                gap: 3,
              }}
            >
              {collections.map((data, i) => (
                <CollectionItemCard key={`${data.id}-${i}`} collection={data} />
              ))}
            </Box>
          )}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(itemCount / PAGE_SIZE)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              showFirstButton
              showLastButton
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

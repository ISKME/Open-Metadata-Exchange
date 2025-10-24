// good new start position
/* eslint-disable react/jsx-no-bind */
// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Drawer,
  Divider,
  Stack,
  Pagination,
  CircularProgress,
  TextField,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import * as qstring from 'query-string';
import { sxStyles } from 'shared/theme/styles';
import { CollectionItemCard } from 'pages/AllCollections/widgets/Collection';

// OERX input components
import SearchBar from 'components/OERX/Input';
import Select from 'components/OERX/Select';

const PAGE_SIZE = 20;

export function AllCollections() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [inputValue, setInputValue] = useState(searchParams.get('f.search') || '');
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState([]);
  // mirror Home: selected arrays for the three selects
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalNumber, setTotalNumber] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [tenants, setTenants] = useState([]);
  
  const fetcher = async (queries) => {
    try {
      // resources/queries expects full query string (including leading ?)
      const url = `/api/imls/v2/collections/browse/${window.location.search.toString()}`;
      const { data } = await axios.get(url);
      document.title = data?.clientInfo?.name ? `Collections | ${data.clientInfo.name}` : 'Collections | Digital Public Goods Library';
      const subjectItems = data.collections.filters.find((filter) => filter.keyword === 'f.general_subject')?.items;
      setSubjects(subjectItems);
      const levelItems = data.collections.filters.find((filter) => filter.keyword === 'f.sublevel')?.items;
      setLevels(levelItems);
      const tenantsItems = data.collections.filters.find((filter) => filter.keyword === 'tenant')?.items;
      setTenants(tenantsItems);
      return data.collections || {};
    } catch (e) {
      return {};
    }
  };

  const update = useCallback(() => {
    // Build new query object from current UI state similar to Home
    const queries = {};
    if (inputValue) queries['f.search'] = inputValue.trim().toLowerCase();
    if (selectedTenants && selectedTenants.length) queries['tenant'] = selectedTenants.map((t) => t.slug || t);
    if (selectedSubjects && selectedSubjects.length) queries['f.general_subject'] = selectedSubjects.map((s) => s.slug || s);
    if (selectedLevels && selectedLevels.length) queries['f.sublevel'] = selectedLevels.map((l) => l.slug || l);
    if (page && page > 1) queries.page = page;

    // write to URL using bracket array format and fetch using that exact query string
    const qs = qstring.stringify(queries, { arrayFormat: 'bracket' });
    // update URL params (react-router handles arrays when given an object)
    setSearchParams(queries);

    setLoading(true);
    const fetchQueryString = qs ? `?${qs}` : '';
    setTimeout(() => {
      fetcher(fetchQueryString).then((data) => {
        if (data) {
          setItems(data.items || []);
          setTotalNumber(data.pagination?.count || 0);
          setFilters(data.filters || []);
          setNotFound((data.items || []).length === 0);
        } else {
          setItems([]);
          setTotalNumber(0);
        }
        setLoading(false);
      });
    }, 500)
  }, [inputValue, JSON.stringify(selectedTenants), JSON.stringify(selectedLevels), JSON.stringify(selectedSubjects), page, setSearchParams]);

  // when any of the selects change, reset to page 1 and update results immediately
  useEffect(() => {
    setPage(1);
    update();
  }, [JSON.stringify(selectedTenants), JSON.stringify(selectedSubjects), JSON.stringify(selectedLevels)]);

  // initialize on mount: read query params into select states like Home
  useEffect(() => {
    const params = qstring.parse(location.search, { arrayFormat: 'bracket' });
    setSelectedTenants((params.tenant && Array.isArray(params.tenant)) ? params.tenant.map((s) => ({ slug: s, name: s })) : (params.tenant ? [{ slug: params.tenant, name: params.tenant }] : []));
    setSelectedSubjects((params['f.general_subject'] && Array.isArray(params['f.general_subject'])) ? params['f.general_subject'].map((s) => ({ slug: s, name: s })) : (params['f.general_subject'] ? [{ slug: params['f.general_subject'], name: params['f.general_subject'] }] : []));
    setSelectedLevels((params['f.sublevel'] && Array.isArray(params['f.sublevel'])) ? params['f.sublevel'].map((s) => ({ slug: s, name: s })) : (params['f.sublevel'] ? [{ slug: params['f.sublevel'], name: params['f.sublevel'] }] : []));
    setInputValue(params['f.search'] || '');
    setPage(Number(params.page) || 1);

    // initial fetch
    setLoading(true);
    fetcher(window.location.search.toString()).then((data) => {
      setItems(data.items || []);
      setTotalNumber(data.pagination?.count || 0);
      setFilters(data.filters || []);
      setLoading(false);
    });
  }, []);

  // When search params (location.search) change externally, sync local page state
  useEffect(() => {
    const params = qstring.parse(location.search);
    setPage(Number(params.page) || 1);
  }, [location.search]);

  const handleSearchEnter = () => {
    setPage(1);
    update();
  };

  const handlePageChange = (_, value) => {
    setPage(value);
    const queries = qstring.parse(window.location.search);
    queries.page = value;
    setSearchParams(queries);
    // update fetch after page change
    update();
  };

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={sxStyles.searchBar}>
        <TextField
          value={inputValue}
          onChange={({ target }) => setInputValue(target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearchEnter(); }}
          variant="outlined"
          placeholder="Search individual learning materials"
          sx={sxStyles.searchInput}
          size="small"
        />
        <Button variant="contained" sx={sxStyles.searchButton} onClick={handleSearchEnter}>
          Search
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <Select label="Collection publisher" value={selectedTenants} options={tenants} onChange={setSelectedTenants} />
        <Select label="Subject area" value={selectedSubjects} options={subjects} onChange={setSelectedSubjects} />
        <Select label="Educational level" value={selectedLevels} options={levels} onChange={setSelectedLevels} />
        {/* <DateRangePicker onChange={setDate} value={date} /> */}
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
              <CircularProgress />
            </Box>
          ) : notFound ? (
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h6" color="text.secondary">No results found.</Typography>
              <Typography variant="body2" color="text.secondary">Try adjusting your search or filter to find what you are looking for.</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {items.map((data, i) => (
                <Grid item xs={12} sm={6} md={3} key={`${data.id || i}-${i}`}>
                  <CollectionItemCard collection={data} />
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination count={Math.ceil(totalNumber / PAGE_SIZE) - 1 || 1} page={page} onChange={handlePageChange} color="primary" shape="rounded" showFirstButton showLastButton />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
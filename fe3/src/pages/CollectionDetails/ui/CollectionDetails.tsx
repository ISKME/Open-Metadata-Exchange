/* eslint-disable no-useless-computed-key */
/* eslint-disable react/button-has-type */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
// @ts-nocheck
import { useLocation, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import * as qs from 'query-string';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';

let PAGE = 1;

let fSearch = '';
let fSubject = {};
let fSort = '';

function CircleLoader() {
  return (
    <div style={{ width: '100px', height: '100px' }}>
      <svg viewBox="0 0 50 50" width="100" height="100" style={{ transform: 'scale(-1) rotate(90deg)' }}>
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="rgb(186 202 206)"
          strokeWidth="10"
        />
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="#93bfec"
          strokeWidth="10"
        />
      </svg>
    </div>
  );
}

interface search_resourcesProps {
  className?: string;
}

const compute = (obj) => Object.values(obj).filter((item) => item === null).length;

export function CollectionDetails() {
  const [resources, setResources] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<[]>([]);
  const [sorted, setSorted] = useState<string>('');
  const [totalNumber, setTotalNumber] = useState<number>(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState<string>(searchParams.get('f.search'));
  const [hasAdd, setHasAdd] = useState<boolean>(true);
  const [collectionName, setCollectionName] = useState('');
  const [collectionMicrositeName, setCollectionMicrositeName] = useState('');
  const [numResources, setNumResources] = useState(0);
  const [educationLevels, setEducationLevels] = useState([]);
  const [updatedOn, setUpdatedOn] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [abstract, setAbstract] = useState('');
  const [micrositeSlug, setMicrositeSlug] = useState('');
  const [clientInfo, setClientInfo] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [checked, setChecked] = useState({});
  const [subscribed, setSubscribed] = useState(false);
  const [done, setDone] = useState(false);
  const [map, setMap] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sections, setSections] = useState([]);
  const [changes, setChanges] = useState({});
  const [stats, setStats] = useState({});

  fSearch = inputValue;
  fSubject = checked;
  fSort = sorted;

  const { search } = useLocation();
  const { name, id } = useParams();

  // useCallback ???
  const fetcher = async (queries) => {
    if (PAGE !== 1) {
      queries += `${queries ? '&' : '?'}page=${PAGE}`;
    }
    try {
      const { data } = await axios.get(`/api/imls/v2/collections/${name}/${id}/resources${queries}`);
      return data.resources;
    } catch (e) { return {}; }
  };

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
        if (!data) setHasAdd(false);
        else setResources(resources.concat(data.items));
      } else if (data) {
        setResources(data.items);
        setTotalNumber(data.pagination.count);
      }
      setIsLoading(false);
    });
  }

  useEffect(() => {
    fetcher(window.location.search.toString())
      .then(({
        items, filters, pagination, sortByOptions,
      }) => {
        setResources(items);
        setIsLoading(false);
        setFilters(filters);
        setSortBy(sortByOptions);
        setSorted(searchParams.get('sortby'));
        setTotalNumber(pagination.count);
        searchParams.delete('page');
        // updatePath(null);
        const checks = {}; // Object.fromEntries
        Array.from(searchParams.entries()).filter((item) => !['f.search', 'sortby'].includes(item[0])).forEach((item) => {
          const [key, val] = item;
          if (checks[key]) checks[key].push(val);
          else checks[key] = [val];
        });
        setChecked(checks);
      });
    axios.get(`/api/imls/v2/collections/${name}/${id}`).then(({ data }) => {
      const {
        abstract,
        educationLevels,
        micrositeName,
        name,
        thumbnail,
        updatedOn,
        numResources,
        micrositeSlug,
        subscribed,
        // numSubscribers,
        // numAlerts,
        // isShared,
        id,
      } = data.collection;
      setCollectionName(name);
      setCollectionMicrositeName(micrositeName);
      setNumResources(numResources);
      setEducationLevels(educationLevels);
      setUpdatedOn(updatedOn);
      setThumbnail(thumbnail);
      setAbstract(abstract);
      setMicrositeSlug(micrositeSlug);
      setSubscribed(subscribed);
      setClientInfo(data.clientInfo?.name);

      if (window.location.hash === '#mapping') {
        if (subscribed) {
          setDone(true);
        }
      }
    });
  }, []);

  const handleSelectChange = useCallback(({ target }) => {
    setSorted(target.value);
    fSort = target.value;
    update(null);
  }, []);

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
      console.log(updatedList, slug, checked);
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

  function handleInputChange(event: any) {
    const cleanedUpQuery = event.target.value; // .trim(); // .toLowerCase();
    setInputValue(cleanedUpQuery);
    fSearch = cleanedUpQuery;
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

  function save(slug, data) {
    axios.post(`/api/imls/v2/metadata/mapping/${micrositeSlug}/collections/${id}`, {
      [slug]: data.reduce((ac, a) => ({ ...ac, [a[0]]: a[1] }), {})
    }).then(console.log).catch(console.log);
  }

  useEffect(() => {
    if (!done) return () => {};
    const fetchData = async () => {
      axios.get(`/api/imls/v2/collections/${micrositeSlug}/${id}/status`).then(({ data }) => {
        if (data.replication_status === 'completed') {
          setReady(true);
          clearInterval(interval);
        } else if (data.progress_info && Number(data.progress_info.total)) {
          const { total, transferred } = data.progress_info
          setProgress(Number(transferred) / Number(total));
        }
      });
    };
    const interval = setInterval(fetchData, 10000);
    fetchData();
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (ready) {
      axios.get(`/api/imls/v2/metadata/mapping/${micrositeSlug}/collections/${id}`).then(({ data }) => {
        const { sections } = data;
        const changes = {};
        const stats = {};
        setSections(sections);
        for (const item of sections) {
          Object.keys(item.mapping).forEach((key) => {
            if (!changes[item.name]) changes[item.name] = {};
            if (item.mapping[key].length > 0) {
              changes[item.name][key] = item.mapping[key][0];
            } else {
              changes[item.name][key] = null;
            }
          });
        }
        for (const key in changes) {
          stats[key] = compute(changes[key]);
        }
        setChanges(changes);
        setStats(stats);
        if (window.location.hash === '#meta') {
          document.getElementById('meta').scrollIntoView();
        }
      });
    }
  }, [ready]);

  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/static/newdesign/images/materials/default-thumbnail-index.png'
  }

  return (
    <Box sx={{ mx: 'auto', mt: 4, p: 2 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/imls/explore-oer-exchange')} sx={{ mb: 2 }}>
        Back to Explore OER Exchange
      </Button>
      {!done && (
        <Box>
          <Card sx={{ display: 'flex', mb: 3 }}>
            <CardMedia
              component="img"
              sx={{ width: 180, height: 180, objectFit: 'cover', overflow: 'hidden', borderRadius: 2, m: 2 }}
              image={thumbnail || '/static/newdesign/images/materials/default-thumbnail-index.png'}
              alt={collectionName}
              onError={handleImageError}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>{collectionName}</Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>{collectionMicrositeName}</Typography>
              <div dangerouslySetInnerHTML={{ __html: abstract }} />
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2">{numResources} resources</Typography>
                {educationLevels && <Typography variant="body2">Education: {educationLevels?.slice(0, 3)?.join(', ')}</Typography>}
                <Typography variant="body2">Last Updated: {new Date(updatedOn).toDateString().substring(4)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {!subscribed ? (
                  <Button variant="contained" color="primary" onClick={async () => { await axios.post(`/api/imls/v2/collections/${micrositeSlug}/${id}/subscribe`); setSubscribed(true); setDone(true); }}>
                    Subscribe
                  </Button>
                ) : (
                  <Button variant="outlined" color="success" startIcon={<CheckCircleIcon />}>Subscribed</Button>
                )}
              </Stack>
            </CardContent>
          </Card>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Search</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon color="action" />
                <input
                  type="search"
                  value={inputValue || ''}
                  onChange={handleInputChange}
                  onKeyDown={onPress}
                  placeholder="Search Individual Learning Materials"
                  style={{ width: '100%', padding: '8px', borderRadius: 4, border: '1px solid #ccc' }}
                />
                <Button variant="contained" color="primary" onClick={handleSearching} sx={{ ml: 1 }}>Search</Button>
              </Box>
            </Box>
            <Box sx={{ minWidth: 180 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <SortIcon color="action" />
                <select value={sorted || ''} onChange={handleSelectChange} style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}>
                  <option value="">Sort By</option>
                  {sortBy.map((option) => (
                    <option key={option.slug} value={option.slug}>{option.name}</option>
                  ))}
                </select>
              </Stack>
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
            <Box sx={{ minWidth: 260 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}><FilterListIcon sx={{ mr: 1 }} />Filters</Typography>
              {filters && filters.map((el) => (
                <Accordion key={el.name} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" fontWeight={600}>{el.name}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {el.items?.map((item) => (
                      <Box key={item.slug} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <input
                          type="checkbox"
                          checked={checked[el.keyword]?.includes(item.slug) || false}
                          data-slug={el.keyword}
                          value={item.slug}
                          onChange={handleFilterChange}
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>{item.name}</Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
              <Button variant="outlined" color="secondary" onClick={handleClearSearchParams} sx={{ mt: 2 }}>Reset Filters</Button>
            </Box>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>{totalNumber} Resources</Typography>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {resources.map((resource) => (
                  <Card key={resource.id} sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: 2,
                    borderColor: 'divider',
                    boxShadow: checked ? 2 : 0,
                    transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
                  }}>
                    <CardContent
                      sx={{
                        minWidth: 240,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderLeft: { sm: '1px solid #eee' },
                      }}
                    >
                      <img
                        src={resource.thumbnail}
                        alt={resource.title || resource.name}
                        style={{
                          borderRadius: '8px',
                          boxShadow: '1px 2px 5px rgba(0, 0, 0, .2)',
                        }}
                        onError={handleImageError}
                      />
                    </CardContent>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>{resource.title || resource.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{resource.micrositeName || resource.site}</Typography>
                      <Typography variant="body2" color="text.secondary">Updated {new Date(resource.updateDate).toDateString()}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{resource.abstract?.split(' ').slice(0, 20).join(' ')}...</Typography>
                    </CardContent>
                  </Card>
                ))}
              </ul>
              {(!isLoading && resources.length === 0) && (
                <Box sx={{ textAlign: 'center', color: '#474F60', mt: 4 }}>
                  <Typography variant="h6">No materials found!</Typography>
                  <Typography variant="body2">Try adjusting your search or filter to find what you are looking for.</Typography>
                </Box>
              )}
              {isLoading && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <CircularProgress color="primary" />
                  <Typography variant="body2" sx={{ mt: 2 }}>Loading Materials...</Typography>
                </Box>
              )}
              {hasAdd && <Button variant="text" onClick={addMoreItems} sx={{ mt: 2 }}>+ Load More</Button>}
            </Box>
          </Stack>
        </Box>
      )}
      {done && (
        <Box sx={{ mt: 4 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => { setDone(false); setMap(false); }} sx={{ mb: 2 }}>Back</Button>
          <Card sx={{ mb: 3, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>Exchange Successful</Typography>
                <Typography variant="body2">You published a new collection to <b>{clientInfo}</b> by subscribing.</Typography>
                <Typography variant="body2">Any changes pushed to this content by <b>{collectionMicrositeName}</b> are automatically synced to <b>{clientInfo}</b>.</Typography>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
              <Avatar src={thumbnail} alt={collectionName} sx={{ width: 80, height: 80, mr: 2 }} />
              <Box>
                <Typography variant="h6" fontWeight={600}>{collectionName}</Typography>
                <Typography variant="body2" color="text.secondary">{collectionMicrositeName}</Typography>
                <Typography variant="body2">{numResources} resources</Typography>
                <Typography variant="body2">Education: {educationLevels?.slice(0, 3)?.join(', ')}</Typography>
              </Box>
            </Card>
            {ready ? (
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => setMap(true)}>Map Metadata</Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ width: '100%', bgcolor: '#eee', borderRadius: 2, height: 16, mb: 1 }}>
                  <Box sx={{ width: `${progress * 100}%`, bgcolor: 'primary.main', height: '100%', borderRadius: 2 }} />
                </Box>
                <Typography variant="body2">TRANSFERRING</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>We're getting your new collection ready!<br />We'll email you when the process is complete.</Typography>
              </Box>
            )}
          </Card>
        </Box>
      )}
      {map && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight={700}>Map your Metadata Standards</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Select your preferred metadata to map for each metadata item.</Typography>
          {sections.map((section) => (
            <Accordion key={section.name} defaultExpanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>{section.name}</Typography>
                {Number(stats[section.name]) > 0 && (
                  <Typography color="error" sx={{ ml: 2 }}>{stats[section.name]} value unmapped</Typography>
                )}
                {Number(stats[section.name]) === -1 && (
                  <Typography color="success" sx={{ ml: 2 }}>All values mapped</Typography>
                )}
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(section.mapping).map((item) => (
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} key={item[0]}>
                    <Typography sx={{ minWidth: 120 }}>{item[0]}</Typography>
                    <select
                      value={changes[section.name]?.[item[0]] || ''}
                      onChange={(e) => {
                        const temp = { ...changes };
                        temp[section.name][item[0]] = e.target.value;
                        setChanges(temp);
                        const statsObj = {};
                        for (const key in temp) {
                          statsObj[key] = compute(temp[key]);
                        }
                        setStats(statsObj);
                      }}
                      style={{ padding: '8px', borderRadius: 4, border: '1px solid #ccc', minWidth: 120 }}
                    >
                      <option value="">Select {section.name}</option>
                      {section.metadata.map((meta) => (
                        <option key={meta.name} value={meta.name}>{meta.name}</option>
                      ))}
                    </select>
                  </Stack>
                ))}
                <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => {
                  save(section.slug, Object.entries(changes[section.name]).filter((item) => item[1]));
                  if (stats[section.name] === 0) setStats({ ...stats, [section.name]: -1 });
                }}>
                  Save and Update Map
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}

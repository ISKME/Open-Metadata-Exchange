
// @ts-ignore
import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Grid, Typography, TextField, Pagination, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import SearchBar from 'components/OERX/Input';
// import Dropdown from 'components/OERX/Dropdown';

export const SubscribedContent = () => {
  const [collections, setCollections] = useState<{ id: number; name: string; micrositeSlug: string; thumbnail: string; levels: string[]; numResources: number }[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [unsubscribeDialog, setUnsubscribeDialog] = useState({ open: false, id: null, name: '', tenant: '' });

  useEffect(() => {
    axios.get('/api/imls/v2/resources').then(({ data }) => {
      setSubjects(data.resources.filters.find(f => f.keyword === 'f.general_subject')?.items || []);
      setLevels(data.resources.filters.find(f => f.keyword === 'f.sublevel')?.items || []);
      setTenants(data.resources.filters.find(f => f.keyword === 'tenant')?.items || []);
    });
  }, []);

  function search() {
    const params = new URLSearchParams();
    params.set('per_page', perPage + '');
    params.set('page', page + '');
    if (inputValue) params.set('f.search', inputValue);
    selectedSubjects.forEach(v => params.append('f.general_subject', v));
    selectedLevels.forEach(v => params.append('f.sublevel', v));
    selectedTenants.forEach(v => params.append('tenant', v));
    axios.get('/api/imls/v2/collections/subscribed?' + params.toString()).then(({ data }) => {
      setCollections(data.collections.items || []);
      setTotalPages(Math.ceil((data.collections.pagination.count || 0) / perPage));
    });
  }

  useEffect(search, [page, perPage, selectedSubjects, selectedLevels, selectedTenants]);

  const handleUnsubscribe = (id, name, tenant) => {
    setUnsubscribeDialog({ open: true, id, name, tenant });
  };

  const confirmUnsubscribe = () => {
    axios.post(`/api/imls/v2/collections/${unsubscribeDialog.tenant}/${unsubscribeDialog.id}/unsubscribe`).then(() => {
      setUnsubscribeDialog({ open: false, id: null, name: '', tenant: '' });
      setPage(1); // refresh
    });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://most.oercommons.org/static/newdesign/images/materials/default-thumbnail-index.png'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box>
        {/* onSearch={handleSearch} */}
        <SearchBar
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setPage(1); }}
          onSearch={() => {
            if (page !== 1) setPage(1)
            else search()
          }}
        />
        {/* <Dropdown id="edu" label="Tenants" options={tenants} value={selectedTenants} onChange={e => setSelectedTenants(e.target.value)} />
        <Dropdown id="sub" label="Subject area" options={subjects} value={selectedSubjects} onChange={e => setSelectedSubjects(e.target.value)} />
        <Dropdown id="mat" label="Educational level" options={levels} value={selectedLevels} onChange={e => setSelectedLevels(e.target.value)} /> */}
      </Box>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {collections.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ position: 'relative', height: '100%' }}>
              <CardMedia
                component="img"
                sx={{ height: 180 }}
                image={item.thumbnail}
                title={item.name}
                onError={handleImageError}
              />
                <Button color="error" onClick={() => handleUnsubscribe(item.id, item.name, item.micrositeSlug)} sx={{ mt: 1, position: 'absolute', right: '8px', top: '4px', textTransform: 'capitalize', background: 'white', fontWeight: 'bold' }}>
                  Unsubscribe
                </Button>
              <CardContent>
                <Typography variant="h4" component="h3" sx={{ fontSize: '1.2rem', mb: 1 }}>
                  {item.name}
                </Typography>
                <Typography variant="subtitle1">
                  {item.levels?.join(', ') || 'PreK-12, HigherEd, ContinuingEd'}
                </Typography>
                <Typography variant="body2">
                  {item.numResources} resources
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', margin: '24px' }}>
        <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} variant="outlined" shape="rounded" />
      </Box>
      <Dialog open={unsubscribeDialog.open} onClose={() => setUnsubscribeDialog({ open: false, id: null, name: '', tenant: '' })}>
        <DialogTitle>Unsubscribe from this collection?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to unsubscribe from <b>{unsubscribeDialog.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnsubscribeDialog({ open: false, id: null, name: '', tenant: '' })}>Cancel</Button>
          <Button color="error" onClick={confirmUnsubscribe}>Unsubscribe</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

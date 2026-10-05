// @ts-ignore
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Pagination,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import cls from './SharedContent.module.scss';
import SearchBar from 'components/OERX/Input';
// import Dropdown from 'components/OERX/Dropdown';

interface SubscribedContentProps {
    className?: string;
}

let tempUnshareTitle = '';

export const SharedContent = ({ className }: SubscribedContentProps) => {
  const [collections, setCollections] = useState([]);
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
  const [unshareDialog, setUnshareDialog] = useState({ open: false, id: null, name: '' });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerItems, setPickerItems] = useState([]);
  const [pickerSelected, setPickerSelected] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Fetch filters
  useEffect(() => {
    axios.get('/api/imls/v2/resources').then(({ data }) => {
      setSubjects(data.resources.filters.find(f => f.keyword === 'f.general_subject')?.items || []);
      setLevels(data.resources.filters.find(f => f.keyword === 'f.sublevel')?.items || []);
      setTenants(data.resources.filters.find(f => f.keyword === 'tenant')?.items || []);
    });
  }, []);

  function search() {
    const params = new URLSearchParams();
    params.set('per_page', String(perPage));
    params.set('page', String(page));
    if (inputValue) params.set('f.search', inputValue);
    selectedSubjects.forEach(v => params.append('f.general_subject', v));
    selectedLevels.forEach(v => params.append('f.sublevel', v));
    selectedTenants.forEach(v => params.append('tenant', v));
    axios.get('/api/imls/v2/collections/site-collections?' + params.toString()).then(({ data }) => {
      setCollections(data.collections.items || []);
      setTotalPages(Math.ceil((data.collections.pagination.count || 0) / perPage));
    });
  }

  // Fetch shared collections
  useEffect(search, [page, perPage, selectedSubjects, selectedLevels, selectedTenants]);

  // Picker dialog: fetch available collections to add
  const openPicker = () => {
    axios.get('/api/imls/v2/collections/site-collections/picker').then(({ data }) => {
      setPickerItems(data.collections.items || []);
      setPickerSelected([]);
      setPickerOpen(true);
    });
  };

  // Picker dialog: add selected collections
  const handlePickerAdd = () => {
    axios.post('/api/imls/v2/collections/site-collections/picker/', null, { params: { share: pickerSelected } })
      .then(() => {
        setPickerOpen(false);
        setSnackbar({ open: true, message: 'Collections added to shared items.' });
        setPage(1); // refresh
      });
  };

  // Unshare dialog: remove collection
  const handleUnshare = (id, name) => {
    setUnshareDialog({ open: true, id, name });
  };
  const confirmUnshare = () => {
    axios.post('/api/imls/v2/collections/site-collections/picker/', null, { params: { unshare: [unshareDialog.id] } })
      .then(() => {
        setUnshareDialog({ open: false, id: null, name: '' });
        setSnackbar({ open: true, message: 'Collection unshared.' });
        setPage(1); // refresh
      });
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/static/newdesign/images/materials/default-thumbnail-index.png'
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box>
        {/* onSearch={handleSearch} */}
        <SearchBar
          value={inputValue}
          onChange={({ target }) => { setInputValue(target.value) }}
          onSearch={() => {
            if (page !== 1) setPage(1)
            else search()
          }}
          width="400px"
        />
        <Button variant="contained" startIcon={<AddIcon />} onClick={openPicker}>
          Add to Shared
        </Button>
        {/* <Dropdown id="edu" label="Tenants" options={tenants} value={selectedTenants} onChange={e => setSelectedTenants(e.target.value)} />
        <Dropdown id="sub" label="Subject area" options={subjects} value={selectedSubjects} onChange={e => setSelectedSubjects(e.target.value)} />
        <Dropdown id="mat" label="Educational level" options={levels} value={selectedLevels} onChange={e => setSelectedLevels(e.target.value)} /> */}
      </Box>
      <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
        {collections.map((item) => (
          <Grid item xs={12} sm={4} md={3} key={item.id}>
            <Card sx={{ position: 'relative', height: '100%' }}>
              <CardMedia
                component="img"
                sx={{ height: 180 }}
                image={item.thumbnail}
                title={item.name}
                onError={handleImageError}
              />
                {/* startIcon={<RemoveIcon />} */}
                <Button color="error" onClick={() => handleUnshare(item.id, item.name)} sx={{ mt: 1, position: 'absolute', right: '8px', top: '4px', textTransform: 'capitalize', background: 'white', fontWeight: 'bold' }}>
                  Unshare
                </Button>
              <CardContent>
                <Typography variant="h4" sx={{ fontSize: '1.2rem', mb: 1 }}>
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
      {/* Picker Dialog */}
      <Dialog open={pickerOpen} onClose={() => setPickerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Collections to Shared</DialogTitle>
        <DialogContent>
          <List>
            {pickerItems.map(item => (
              <ListItem key={item.id} button onClick={() => {
                setPickerSelected(prev =>
                  prev.includes(item.id)
                    ? prev.filter(id => id !== item.id)
                    : [...prev, item.id]
                );
              }}>
                <ListItemIcon>
                  <Checkbox checked={pickerSelected.includes(item.id)} />
                </ListItemIcon>
                <ListItemText primary={item.name} secondary={item.levels?.join(', ')} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPickerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePickerAdd} disabled={pickerSelected.length === 0}>Add Selected</Button>
        </DialogActions>
      </Dialog>
      {/* Unshare Dialog */}
      <Dialog open={unshareDialog.open} onClose={() => setUnshareDialog({ open: false, id: null, name: '' })}>
        <DialogTitle>Unshare Collection?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to unshare <b>{unshareDialog.name}</b>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnshareDialog({ open: false, id: null, name: '' })}>Cancel</Button>
          <Button color="error" onClick={confirmUnshare}>Unshare</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Box>
  );
};

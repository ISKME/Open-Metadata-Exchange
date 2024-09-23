/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAppDispatch } from 'hooks/redux';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Search from '@mui/icons-material/Search';
import Fade from '@mui/material/Fade';
import Filter from '@mui/icons-material/FilterAlt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import GlobalStyles from '@mui/material/GlobalStyles';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { fetchLti } from 'pages/Lti/model/services/ActionCreators';
// import cls from './LtiList.module.scss';

const CButton = styled(Button)(({ theme }) => ({
  padding: '6px 12px',
  borderColor: '#303e48',
  backgroundColor: '#303e48',
  color: '#fad000',
  fontFamily: '"DINPro", sans-serif',
  boxShadow: '0 3px 0 #202c34',
  '&:hover': {
    borderColor: '#8f9bae',
    backgroundColor: '#8f9bae',
    color: '#ffffff',
    boxShadow: '0 3px 0 #7c8ba2',
  },
}));

export function LtiList({ data = [], sorts = [], pages = 1, count = 0, filters = {}, openFilters = () => {}, order }) {
  const dispatch = useAppDispatch();

  const [defaultPage, setDefaultPage] = React.useState(1);
  const [term, setTerm] = React.useState('');
  // const [search, setSearch] = React.useState('');

  const theme = useTheme();
  const match = useMediaQuery(theme.breakpoints.up('lg'));

  const [item, setItem] = React.useState('');
  const handleItem = ({ target }) => {
    const sort = target.value
    setItem(sort);
    dispatch(fetchLti(term, null, sort, filters));
  };
  React.useEffect(() => {
    setItem(order);
  }, [order]);

  React.useEffect(() => {
    dispatch(fetchLti(term, null, order, filters));
  }, [filters]);

  const { id } = useParams();

  return (
    <>
      <GlobalStyles styles={{ '.MuiTooltip-popper': { fontSize: '124px !important' } }} />
      <Typography sx={{ color: '#44515a', font: '400 24px / 24px "DINPro", sans-serif', marginBottom: '15px' }}>
        {count} Results
      </Typography>
      <Paper
        elevation={3}
        sx={{ display: 'flex', gap: '4px', backgroundColor: '#efeff0', padding: '8px', alignItems: 'center' }}
      >
        <FormControl sx={{ flex: 1 }} size="small" variant="outlined">
          <InputLabel htmlFor="outlined-basic">Search</InputLabel>
          <OutlinedInput
            id="outlined-basic"
            label="Search"
            type="search"
            variant="outlined"
            size="small"
            sx={{ flex: 1, backgroundColor: 'white' }}
            value={term}
            onChange={({ target }) => setTerm(target.value)}
            onKeyUp={event => {
              if (event.key === 'Enter') {
                // setSearch(term);
                dispatch(fetchLti(term, 1, item, filters));
                setDefaultPage(1);
              }
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    dispatch(fetchLti(term, 1, item, filters));
                    setDefaultPage(1);
                  }}
                  edge="end"
                >
                  <Search />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControl size="small" sx={{ minWidth: '142px' }}>
          <InputLabel id="sort-label">Sort</InputLabel>
          <Select
            labelId="sort-label"
            value={item}
            label="Sort"
            onChange={handleItem}
            sx={{ backgroundColor: 'white' }}
          >
            {sorts.map((item) => <MenuItem key={item.slug} value={item.slug}>{item.name}</MenuItem>)}
          </Select>
        </FormControl>
        <Tooltip title="Filters">
          <IconButton onClick={openFilters} style={{ display: match ? 'none' : '', width: '31px' }}>
            <Filter />
          </IconButton>
        </Tooltip>
      </Paper>
      <Box sx={{ marginTop: '32px', marginBottom: '64px', gap: '24px', display: 'flex', flexDirection: 'column' }}>
        {data.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', borderBottom: '1px solid #cfcfcf', paddingBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <Typography component="div" variant="h5" sx={{ color: '#56788f', font: '700 19px / 25px "DINPro", sans-serif', marginBottom: '5px' }}>
                {item.title}
              </Typography>
              <Typography>
                {item.source}
              </Typography>
            </div>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: match ? 'flex-end' : 'stretch',
              marginLeft: '8px',
              flexDirection: match ? '' : 'column',
            }}>
              <form method="POST" action={`/lti/v1.3/picker/${id}/resources/${item.id.split('.').join('/')}/pick`}>
                <Button size="small" className="btn-primary" type="submit" style={{ width: '100%' }}>
                  Embed
                </Button>
              </form>
              <Button size="small" className="btn-primary" onClick={() => {
                const url = `/lti/v1.3/picker/${id}/resources/${item.id.split('.').join('/')}/preview`
                window.open(url, '_blank').focus()
              }}>
                Preview
              </Button>
            </div>
          </div>
        ))}
      </Box>
      <Pagination count={pages} page={defaultPage} onChange={(_event, page) => {
        setDefaultPage(page);
        dispatch(fetchLti(term, page, item, filters));
      }} />
    </>
  );
}

/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useAppDispatch } from 'hooks/redux';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Pagination from '@mui/material/Pagination';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { fetchCases } from 'pages/Cases/model/services/ActionCreators';
import { CardCase } from '../../../widgets/CardCase';
// import cls from './CasesList.module.scss';

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

export function CasesList({ data = [], sorts = [], pages = 1, count = 0, topics = [], grades = [], frameworks = [], unselectTopic = () => {}, unselectGrade = () => {}, unselectFramework = () => {}, onClear = () => {}, order }) {
  const dispatch = useAppDispatch();

  const [defaultPage, setDefaultPage] = React.useState(1);
  const [term, setTerm] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [check, setCheck] = React.useState([]);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChecked = ({ target }) => {
    setCheck(data.map(() => target.checked));
  };

  React.useEffect(() => {
    setCheck(data.map(() => false));
  }, [data]);

  React.useEffect(() => {
    setDefaultPage(1);
    dispatch(fetchCases(term, 1, order, topics.map((item) => item.slug), grades.map((item) => item.slug), frameworks.map((item) => item.id)));
  }, [topics, grades, frameworks]);

  const [item, setItem] = React.useState('');
  const handleItem = ({ target }) => {
    const sort = target.value
    setItem(sort);
    dispatch(fetchCases('', null, sort, topics.map((item) => item.slug), grades.map((item) => item.slug), frameworks.map((item) => item.id)));
  };
  React.useEffect(() => {
    setItem(order);
  }, [order]);

  return (
    <>
      <Typography sx={{ color: '#44515a', font: '400 24px / 24px "DINPro", sans-serif', marginBottom: '15px' }}>Cases ({count})</Typography>
      <Paper
        elevation={3}
        sx={{
          display: 'flex', gap: '4px', backgroundColor: '#efeff0', padding: '8px', minHeight: '72px'
        }}
      >
        {/* checked={checked[0] && checked[1]}
        indeterminate={checked[0] !== checked[1]} */}
        <FormControlLabel
          label="Select all"
          control={(
            <Checkbox
              checked={check.length ? check.reduce((a, b) => a = a && b, true) : false}
              indeterminate={check.reduce((a, b) => a = a || b, false) && !check.reduce((a, b) => a = a && b, true)}
              onChange={handleChecked}
              sx={{ backgroundColor: 'white', margin: '0 8px' }}
            />
          )}
        />
        {check.reduce((a, b) => a = a || b, false) && (
          <>
            <CButton
              id="fade-button"
              aria-controls={open ? 'fade-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleClick}
            >
              Save
            </CButton>
            <Menu
              id="fade-menu"
              MenuListProps={{
                'aria-labelledby': 'fade-button',
              }}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              TransitionComponent={Fade}
            >
              <div>
                <div style={{ width: '350px', height: '200px', padding: '16px', borderBottom: '1px dashed #ccc' }}>
                  <Typography>Groups</Typography>
                </div>
                <div>
                  <CButton style={{ float: 'right', margin: '16px' }}>Create new folder</CButton>
                </div>
              </div>
            </Menu>
          </>
        )}
        {!check.reduce((a, b) => a = a || b, false) && (
          <>
            <TextField
              id="outlined-basic"
              type="search"
              label="Search within cases"
              variant="outlined"
              sx={{ flex: 1, backgroundColor: 'white' }}
              value={term}
              onChange={({ target }) => setTerm(target.value)}
              onKeyUp={event => {
                if (event.key === 'Enter') {
                  setSearch(term);
                  dispatch(fetchCases(term, 1, item, topics.map((item) => item.slug), grades.map((item) => item.slug), frameworks.map((item) => item.id)));
                  setDefaultPage(1);
                }
              }}
            />
            <FormControl sx={{ minWidth: '142px' }}>
              <InputLabel id="demo-simple-select-label">Sort</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                value={item}
                label="Sort"
                onChange={handleItem}
                sx={{ backgroundColor: 'white' }}
              >
                {sorts.map((item) => <MenuItem key={item.slug} value={item.slug}>{item.name}</MenuItem>)}
              </Select>
            </FormControl>
          </>
        )}
      </Paper>
      <Box
        sx={{
          gap: '24px',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '32px',
          marginBottom: '64px',
        }}
      >
      {(topics.length || grades.length || frameworks.length || search) ? (
        <div style={{ display: 'flex', padding: '15px 0', borderBottom: '1px solid #e8e8e8', marginTop: '-30px', marginBottom: '30px' }}>
          <div style={{ flex: 1 }}>
            <Button
              onClick={() => {
                setTerm('')
                setSearch('')
                onClear()
              }}
            >
              Clear filters
            </Button>
          </div>
          <div style={{ flex: 3, display: 'flex', flexWrap: 'wrap' }}>
            {search ? (
              <span className="search-filter-value">
                <IconButton onClick={() => {
                  setSearch('');
                  setTerm('');
                  dispatch(fetchCases('', 1, item, topics.map((item) => item.slug), grades.map((item) => item.slug), frameworks.map((item) => item.id)));
                  setDefaultPage(1);
                }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                Search:
                <span> {search}</span>
              </span>
            ) : ''}
            {topics.map((topic) => (
              <span key={topic.slug} className="search-filter-value">
                <IconButton onClick={() => unselectTopic(topic)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                {topic.parent ? 'Topic' : 'Subject'}:
                <span> {topic.name}</span>
              </span>
            ))}
            {grades.map((grade) => (
              <span key={grade.slug} className="search-filter-value">
                <IconButton onClick={() => unselectGrade(grade)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                Grade:
                <span> {grade.name}</span>
              </span>
            ))}
            {frameworks.map((framework) => (
              <span key={framework.id} className="search-filter-value">
                <IconButton onClick={() => unselectFramework(framework)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
                Framework:
                <span> {framework.name}</span>
              </span>
            ))}
          </div>
        </div>
      ) : ''}
        {data.map((item, index) => (
          <CardCase
            id={item.id}
            key={item.id}
            title={`${item.title} - Case ${item.id.split('.').pop()}`}
            picture={item.thumbnail}
            description={item.abstract}
            items={item.metadata.map((meta) => meta.items.map((a) => a.name))}
            checked={check[index]}
            onCheck={({ target }) => {
              const temp = JSON.parse(JSON.stringify(check))
              temp[index] = target.checked
              setCheck(temp)
            }}
          />
        ))}
      </Box>
      <Pagination count={pages} page={defaultPage} onChange={(_event, page) => {
        setDefaultPage(page);
        dispatch(fetchCases(term, page, item, topics.map((item) => item.slug), grades.map((item) => item.slug), frameworks.map((item) => item.id)));
      }} />
    </>
  );
}

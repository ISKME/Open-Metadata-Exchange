/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Drawer from '@mui/material/Drawer';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import GlobalStyles from '@mui/material/GlobalStyles';
import { LtiList } from 'widgets/LtiList';
import { fetchLti } from '../model/services/ActionCreators';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
// import cls from './Lti.module.scss';
import { useAppDispatch, useAppSelector } from 'hooks/redux';

// function creator(selector) { // element#id.class@attribute=value
//   var pattern = /^(.*?)(?:#(.*?))?(?:\.(.*?))?(?:@(.*?)(?:=(.*?))?)?(\:+(.*?))?$/;
//   var matches = selector.match(pattern);
//   var element = document.createElement(matches[1] || 'div');
//   if(matches[2]) element.id = matches[2];
//   if(matches[3]) element.className = matches[3];
//   if(matches[4]) element.setAttribute(matches[4], matches[5] || '');
//   return { element, pseudo: matches[6] }
// }

function creator(querySelector = 'div', ...content) {
  let nodeType = querySelector.match(/^[a-z0-9]+/i);
  let id = querySelector.match(/#([a-z]+[a-z0-9-]*)/gi);
  let classes = querySelector.match(/\.([a-z]+[a-z0-9-]*)/gi);
  let attributes = querySelector.match(/\[([a-z][a-z-]+)(=['|"]?([^\]]*)['|"]?)?\]/gi);
  // let pseudo = querySelector.match(/\:+[a-z\-\(\)]+$/i)?.pop();
  let node = (nodeType) ? nodeType[0] : 'div';
  if (id && id.length > 1) return
  const elt = document.createElement(node);
  if (id) {
    elt.id = id[0].replace('#', '');
  }
  if (classes) {
    const attrClasses = classes.join(' ').replace(/\./g, '');
    elt.setAttribute('class', attrClasses);
  }
  if (attributes) {
    attributes.forEach(item => {
      item = item.slice(0, -1).slice(1);
      let [label, value] = item.split('=');
      if (value) {
        value = value.replace(/^['"](.*)['"]$/, '$1');
      }
      elt.setAttribute(label, value || '');
    });
  }
  content.forEach(item => {
    if (typeof item === 'string' || typeof item === 'number') {
      elt.appendChild(document.createTextNode(item));
    } else if (item.nodeType === document.ELEMENT_NODE) {
      elt.appendChild(item);
    }
  });
  return elt;
}

function convertKebabToCamel(obj) {
  const newObj = {};
  for (const key in obj) {
    const camelCaseKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelCaseKey] = obj[key];
  }
  return newObj;
}

function styler(selector, pseudo) {
  const element = creator(selector)
  document.body.appendChild(element)
  const computedStyles = window.getComputedStyle(element) // , ':hover'
  const styles = {} // JSON.parse(JSON.stringify(getComputedStyle(element)))
  for (let i = 0; i < computedStyles.length; i++) {
    if (property === 'content') continue
    const property = computedStyles[i]
    styles[property] = computedStyles.getPropertyValue(property) + ' !important'
  }
  document.body.removeChild(element)
  // element.style.display = 'none'
  // setTimeout(() => document.body.removeChild(element), 500)
  return convertKebabToCamel(styles)
}

const btnStyles = styler('.btn.btn-primary')

const globalStyles = {
  '.MuiListSubheader-gutters': {
    // background: btnStyles.background,
    // color: btnStyles.color,
    fontSize: '1rem !important',
  },
  '.MuiButton-colorPrimary': {
    background: btnStyles.backgroundColor,
    color: btnStyles.color,
    // '&:hover': {
    //   background: btnStylesHover.backgroundColor,
    // }
  },
};

const Filters = ({ filters, filterValues, setFilterValues }) => (
  <div style={{
    gap: '24px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: '24px',
    width: '300px',
    padding: '0 24px',
  }}>
    {filters.map((filter, index) => (
      <FormControl size="small" fullWidth key={filter.keyword}>
        <InputLabel id={filter.keyword + '-label'}>{filter.name}</InputLabel>
        <Select
          labelId={filter.keyword + '-label'}
          id={filter.keyword}
          value={filterValues[filter.keyword] || ''}
          label={filter.name}
          onChange={({ target }) => setFilterValues({ ...filterValues, [filter.keyword]: target.value })}
          endAdornment={
            filterValues[filter.keyword] && (
              <InputAdornment sx={{ marginRight: '10px' }} position="end">
                <IconButton onClick={() => setFilterValues({ ...filterValues, [filter.keyword]: undefined })}>
                  <Close />
                </IconButton>
              </InputAdornment>
            )
          }
        >
          <MenuItem value="">None</MenuItem>
          {filter.items.map((item) => (
            (index === 0 && item.level === 0)
              ? [
                // sx={{ background: `linear-gradient(90deg, white, 90%, ${btnStyles.backgroundColor?.replace(' !important', '')})` }}
                <ListSubheader key={item.slug + '-sub'}>{item.name}</ListSubheader>,
                <MenuItem key={item.slug} value={item.slug}>Subject: {item.name}</MenuItem>,
              ]
              : <MenuItem key={item.slug} value={item.slug} sx={{ '&::before': { content: '"• "', marginRight: '8px' } }}>{item.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
    ))}
  </div>
);

const styles = `
a.freshwidget-theme {
  background: ${btnStyles.backgroundColor};
  color: ${btnStyles.color};
  box-shadow: -2px 0px 4px rgba(0, 0, 0, .35) !important;
}
`;

export function Lti() {
  const { items, count, pages, sorts, order, filters } = useAppSelector((state) => state.LtiSlice);

  // const dispatch = useAppDispatch();
  // React.useEffect(() => {
  //   dispatch(fetchLti());
  // }, [dispatch]);

  const [filterValues, setFilterValues] = React.useState({});
  const [open, setOpen] = React.useState(false);

  const theme = useTheme();
  const match = useMediaQuery(theme.breakpoints.up('lg'));

  React.useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    document.head.appendChild(styleTag)
  }, []);

  return (
    <Box sx={{ width: '100%', padding: '24px 5%' }}>
      <GlobalStyles styles={globalStyles} />
      <Drawer open={open} onClose={() => setOpen(false)}>
        <Filters filters={filters} filterValues={filterValues} setFilterValues={setFilterValues} />
      </Drawer>
      <Grid container>
        <Grid item xs={4} sx={{ paddingRight: '32px' }} style={{ display: match ? '' : 'none' }}>
          <Filters filters={filters} filterValues={filterValues} setFilterValues={setFilterValues} />
        </Grid>
        <Grid item xs={match ? 8 : 12}>
          {/* topics={filteredTopics}
          grades={filteredGrades}
          frameworks={filteredFrameworks}
          unselectTopic={applyFilter}
          unselectGrade={applyGradeFilter}
          unselectFramework={applyFrameworkFilter} */}
          <LtiList
            data={items}
            sorts={sorts}
            order={order}
            pages={pages}
            count={count}
            filters={filterValues}
            openFilters={() => setOpen(true)}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

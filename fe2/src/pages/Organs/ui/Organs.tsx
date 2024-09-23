/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import GlobalStyles from '@mui/material/GlobalStyles';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListItemText from '@mui/material/ListItemText';
import cls from './Organs.module.scss';
import { OrgansSettings } from 'widgets/OrgansSettings';
import { OrgansUsers } from 'widgets/OrgansUsers';
import { OrgansGroups } from 'widgets/OrgansGroups/ui/OrgansGroups';
import { OrgansCaseAnalytics } from 'widgets/OrgansCaseAnalytics';
import { OrgansUserAnalytics } from 'widgets/OrgansUserAnalytics';
import { useSearchParams } from 'react-router-dom';

export function Organs() {
  const primaryColor = '#303e48';

  const globalStyles = {
    '.MuiTabs-root': {
      background: 'rgb(48, 62, 72)',
      paddingLeft: '10%',
    },
    '.MuiTabs-flexContainer': {
      paddingTop: '3px',
    },
    '.MuiButtonBase-root.MuiTab-root.Mui-selected': {
      color: primaryColor,
      background: 'white',
    },
    '.MuiButtonBase-root.MuiTab-root': {
      color: 'white',
    },
    '.MuiTabs-indicator': {
      display: 'none',
    },
    '.MuiDataGrid-columnHeaderTitle': {
      textWrap: 'wrap !important',
      fontSize: '12px',
      fontWeight: 700,
    },
    '.MuiFormLabel-root': {
      fontSize: '14px !important',
      lineHeight: '22px !important',
    },
    '.MuiInputLabel-root': {
      fontSize: '14px !important',
      lineHeight: '22px !important',
    },
    '.MuiDataGrid-cell': {
      fontSize: '12px !important',
      paddingTop: '5px !important',
      paddingBottom: '5px !important',
    },
    '.MuiIconButton-sizeSmall': {
      padding: '0 !important',
    },
    '.MuiDataGrid-checkboxInput': {
      padding: '0 !important',
    },
    '.MuiDataGrid-cellCheckbox': {
      padding: '0 !important',
    },
    '.MuiTableCell-head': {
      fontSize: '12px !important',
    },
    '.MuiTableCell-body': {
      fontSize: '12px !important',
    },
    '.MuiAutocomplete-input': {
      fontSize: '14px !important',
      padding: '4px 12px !important',
    },
    '.MuiAutocomplete-popper *': {
      fontSize: '14px !important',
    },
    '.MuiInputBase-inputSizeSmall': {
      fontSize: '14px !important',
    },
    '.MuiMenuItem-gutters': {
      fontSize: '14px !important',
    },
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = React.useState(Number(searchParams.get('menu')) || 0);

  const handleMenuClick = (index) => {
    setSelectedMenu(index);
    setSearchParams({ menu: index });
  };

  return (
    <Box sx={{ width: '100%', padding: '64px 0' }}>
      <GlobalStyles styles={globalStyles} />
      <Grid container spacing={2} sx={{ padding: '0 10%', '@media (max-width: 1168px)': { padding: '0 16px' } }}>
        <Grid item xs={3}>
          <Paper elevation={0} sx={{ width: 320, maxWidth: '100%' }}>
            <MenuList>
              {['Settings', 'Users', 'Groups', 'Case Analytics', 'User Analytics'].map((item, index) => (
                <MenuItem
                  onClick={() => handleMenuClick(index)}
                  key={index}
                  sx={{
                    backgroundColor: index === selectedMenu ? 'rgba(0, 0, 0, 0.1)' : '',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  <ListItemText
                    sx={{
                      '>span': { fontWeight: index === selectedMenu ? 'bold' : 400, display: 'inline' },
                      '&:before': { content: index === selectedMenu ? '"› "' : '""' },
                    }}
                  >
                    {item}
                  </ListItemText>
                </MenuItem>
              ))}
            </MenuList>
          </Paper>
        </Grid>
        <Grid item xs={9}>
          {selectedMenu === 0 && <OrgansSettings />}
          {selectedMenu === 1 && <OrgansUsers />}
          {selectedMenu === 2 && <OrgansGroups />}
          {selectedMenu === 3 && <OrgansCaseAnalytics />}
          {selectedMenu === 4 && <OrgansUserAnalytics />}
        </Grid>
      </Grid>
    </Box>
  );
}

/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
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

const primaryColor = '#303e48';

const globalStyles = {
  '.MuiTabs-root': {
    background: 'rgb(48, 62, 72)',
    paddingLeft: '5%',
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

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function Organs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedMenu, setSelectedMenu] = React.useState(Number(searchParams.get('menu')) || 0);
  const [organizationId, setOrganizationId] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const ORGANIZATION_ADMIN_ROLE_ID = 2;

  React.useEffect(() => {
    const urlOrgId = searchParams.get('id');

    if (urlOrgId) {
      setOrganizationId(Number(urlOrgId));
      setLoading(false);
      return;
    }

    const fetchUserOrganization = async () => {
      try {
        const { data } = await axios.get('/api/users/v1/profile');

        if (data.organization.role_id != ORGANIZATION_ADMIN_ROLE_ID) {
          throw new Error('Permission denied');
        }

        setOrganizationId(data.organization.id);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrganization();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!organizationId) {
    return <p>No organization is selected. You can select <a href="/my/new/default-organization">here</a></p>;
  }

  const handleMenuClick = (index) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('menu', index);
    setSearchParams(newParams);
    setSelectedMenu(index);
  };

  return (
    <Box sx={{ width: '100%', padding: '64px 0' }}>
      <GlobalStyles styles={globalStyles} />
      <Grid container spacing={2} sx={{ padding: '0 5%', '@media (max-width: 1168px)': { padding: '0 16px' } }}>
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
          {selectedMenu === 0 && <OrgansSettings id={organizationId} />}
          {selectedMenu === 1 && <OrgansUsers id={organizationId} />}
          {selectedMenu === 2 && <OrgansGroups id={organizationId} />}
          {selectedMenu === 3 && <OrgansCaseAnalytics id={organizationId} />}
          {selectedMenu === 4 && <OrgansUserAnalytics id={organizationId} />}
        </Grid>
      </Grid>
    </Box>
  );
}

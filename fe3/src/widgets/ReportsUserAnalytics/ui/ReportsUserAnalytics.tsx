/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import { LineChart } from '@mui/x-charts/LineChart';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import { Autocomplete, CircularProgress } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import cls from './ReportsUserAnalytics.module.scss'
import { DateRange, UserIsActiveStatus, UserType, ChartColors } from '../../enum';


let globalSearchValue = '';
function EditUserToolbar({ onSearch, onExport, onClear }) {
  const [searchValue, setSearchValue] = React.useState(globalSearchValue);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      globalSearchValue = searchValue.trim();
      onSearch(globalSearchValue);
    }
  };

  const handleSearchClick = () => {
    globalSearchValue = searchValue.trim();
    onSearch(globalSearchValue);
  };

  const handleClear = () => {
    globalSearchValue = '';
    setSearchValue('');
    onClear();
  };

  return (
    <GridToolbarContainer>
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        size="small"
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ width: '50%' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '48%' }}>
        <div style={{ display: 'flex' }}>
          <Button color="primary" onClick={handleSearchClick}>
            Search
          </Button>
          <Button color="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
        <Button color="primary" onClick={onExport}>
          Export CSV
        </Button>
      </div>
    </GridToolbarContainer>
  );
}

const CellWithRightBorder = styled(TableCell)(({ theme }) => ({
  borderRightWidth: '1px !important',
  borderRightColor: 'rgb(224 224 224) !important',
  borderRightStyle: 'solid !important',
}));

export function ReportsUserAnalytics() {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
  const [date, setDate] = React.useState([defaultStartDate, defaultEndDate]);
  const [range, setRange] = React.useState(DateRange.LAST_30_DAYS);
  const [selectedUserType, setSelectedUserType] = React.useState('');
  const [userTypeOptions, setUserTypeOptions] = React.useState([]);
  const [userIsActive, setUserIsActive] = React.useState('');
  const [groups, setGroups] = React.useState([]);
  const [organizations, setOrganizations] = React.useState([]);
  const [selectedParams, setSelectedParams] = React.useState({
    isActiveUsers: [],
    typeStatusUsers: [],
    users: [],
    group: null,
    organization: null,
  });
  const [tableData, setTableData] = React.useState([]);
  const [originalTableData, setOriginalTableData] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [allSelected, setAllSelected] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeItems, setActiveItems] = React.useState({
    resourceView: true,
    visitsCount: true,
    downloads: true,
    saves: true,
    allNotes: true,
    login: true,
    search: true,
    groups: true,
  });
  const columns = [
    { field: 'user', headerName: 'User', width: 216 },
    { field: 'userType', headerName: 'User Type', width: 118 },
    { field: 'view', headerName: 'Resource View', width: 118 },
    { field: 'count', headerName: 'Visits Count', width: 118 },
    { field: 'downloads', headerName: 'Downloads', width: 118 },
    { field: 'saves', headerName: 'Saves', width: 118 },
    { field: 'notes', headerName: 'All Notes', width: 118 },
    { field: 'login', headerName: 'Login', width: 118 },
    { field: 'search', headerName: 'Search', width: 118 },
    { field: 'groups', headerName: 'Groups', width: 118 },
  ]; // SUM 1278px
  const colors = {
    resourceView: ChartColors.RED,
    visitsCount: ChartColors.PINK,
    downloads: ChartColors.CYAN,
    allNotes: ChartColors.GRAY,
    login: ChartColors.GREEN,
    search: ChartColors.BLUE,
    saves: ChartColors.BROWN,
    groups: ChartColors.ORANGE,
  };

  React.useEffect(() => {
    const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date();
    const userIds = [];
    const group = null;
    const organization = null;

    fetchConfigs(startDate, endDate);
    fetchData(startDate, endDate);
    fetchTableData(startDate, endDate, userIds, group, organization);
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = (startDate, endDate, users = [], group = null, organization = null) => {
    const params = {
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
      organization: organization || undefined,
    };
  
    axios
      .get('/clickhouse/overall/user-analytics', { params })
      .then(({ data }) => {
        const formattedData = data.map((item) => ({
          date: item.date,
          resourceView: item.resourceView,
          visitsCount: item.visitsCount,
          downloads: item.downloads,
          saves: item.saves,
          allNotes: item.allNotes,
          login: item.login,
          search: item.search,
          groups: item.groups,
        }));
        setChartData(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching analytics data:', error);
      });
  };

  const fetchTableData = async (startDate, endDate, users = [], group = null, organization = null) => {
    const params = {
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
      organization: organization || undefined,
    };
  
    try {
      setIsLoading(true);
  
      const response = await axios.get('/clickhouse/overall/users-details/', { params });
  
      const configResponse = await axios.get('/clickhouse/configs', { params });
      const userConfigs = configResponse.data.users;
  
      const userMap = userConfigs.reduce((map, user) => {
        map[user.id] = `${user.first_name} ${user.last_name}`.trim() || 'Unnamed User';
        return map;
      }, {});
  
      const data = response.data.map((item) => {
        const userId = item.user;
        const fullName = userId
          ? userMap[userId] || `User${userId}`
          : 'Unlogged users';
  
        return {
          id: userId || 'unlogged',
          user: fullName,
          userType: userConfigs.find(user => +user.id === +userId)?.user_type || 'Unknown',
          view: item.resourceView,
          count: item.visitsCount,
          downloads: item.downloads,
          saves: item.saves,
          notes: item.allNotes,
          login: item.login,
          search: item.search,
          groups: item.groups,
        };
      });
  
      setOriginalTableData(data);
      setTableData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfigs = async (startDate, endDate, organization = null) => {
    setIsLoading(true);
    const params = {
      ...(startDate && endDate && {
        date_range_start: formatDate(startDate),
        date_range_end: formatDate(endDate),
      }),
      ...(organization && { organization }),
    };
    try {
      const { data } = await axios.get('/clickhouse/configs', { params });
  
      const uniqueUserTypes = Array.from(new Set(data.users.map((user) => user.user_type)));
  
      setUsers(
        data.users.map((user) => ({
          id: user.id,
          label: `${user.first_name} ${user.last_name}`.trim() || 'Unnamed User',
          is_active: user.is_active,
          user_type: user.user_type,
        }))
      );
      setGroups(data.groups.map((group) => ({ label: group })));
      setOrganizations(data.organizations.map((organization) => ({ label: organization })));
      setUserTypeOptions(uniqueUserTypes);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedParams({ users: [], group: null, organization: null });
    setGroups([]);
    setOrganizations([]);
    setUserIsActive('');
    setSelectedUserType('');
  };

  const handleRange = (event) => {
    const selectedRange = event.target.value;
    setRange(selectedRange);
  
    let startDate, endDate;
  
    if (typeof selectedRange === 'number' && selectedRange >= 2015 && selectedRange <= new Date().getFullYear()) {
      startDate = new Date(`${selectedRange}-01-01`);
      endDate = new Date(`${selectedRange}-12-31`);
    } else {
      switch (selectedRange) {
        case DateRange.LAST_30_DAYS:
          endDate = new Date();
          startDate = new Date(new Date().setDate(endDate.getDate() - 30));
          break;
        case DateRange.LAST_90_DAYS:
          endDate = new Date();
          startDate = new Date(new Date().setDate(endDate.getDate() - 90));
          break;
        case DateRange.LAST_YEAR:
          endDate = new Date();
          startDate = new Date(endDate.getFullYear() - 1, endDate.getMonth(), endDate.getDate());
          break;
        case DateRange.CUSTOM:
        default:
          return;
      }
    }
  
    setDate([startDate, endDate]);
    fetchConfigs(startDate, endDate);
    fetchData(startDate, endDate, [], null, null);
    fetchTableData(startDate, endDate, [], null, null);
    resetFilters();
  };
  
  const handleDateRangeChange = (newDate) => {
    if (!newDate) {
      const defaultEndDate = new Date();
      const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
      setDate([defaultStartDate, defaultEndDate]);
      setRange(DateRange.LAST_30_DAYS);
      fetchData(defaultStartDate, defaultEndDate, [], null, null);
      fetchTableData(defaultStartDate, defaultEndDate, [], null, null);
      fetchConfigs(defaultStartDate, defaultEndDate);
    } else if (newDate && newDate.length === 2) {
      setDate(newDate);
      setRange(DateRange.CUSTOM);
      fetchData(newDate[0], newDate[1], [], null, null);
      fetchTableData(newDate[0], newDate[1], [], null, null);
      fetchConfigs(newDate[0], newDate[1]);
    }
    resetFilters();
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2015; year <= currentYear; year++) {
      years.push(year);
    }
    return years.reverse();
  };

  const handleGroupChange = (event, newValue) => {
    const updatedGroup = newValue ? newValue.label : null;
  
    setSelectedParams((prev) => ({
      ...prev,
      group: updatedGroup,
    }));
  
    fetchData(date[0], date[1], selectedParams.users, updatedGroup, selectedParams.organization);
    fetchTableData(date[0], date[1], selectedParams.users, updatedGroup, selectedParams.organization);
  };

  const handleOrganizationChange = (event, newValue) => {
    const updatedOrganization = newValue ? newValue.label : null;
  
    setSelectedParams((prev) => ({
      ...prev,
      organization: updatedOrganization,
    }));
  
    fetchConfigs(date[0], date[1], updatedOrganization)
    fetchData(date[0], date[1], selectedParams.users, selectedParams.group, updatedOrganization);
    fetchTableData(date[0], date[1], selectedParams.users, selectedParams.group, updatedOrganization);
  };

  const applyFilters = (filteredIsActiveUsers, filteredTypeStatusUsers) => {
    if (!filteredIsActiveUsers.length) return filteredTypeStatusUsers;
    if (!filteredTypeStatusUsers.length) return filteredIsActiveUsers;
  
    const filteredUsers = filteredIsActiveUsers.filter(id => filteredTypeStatusUsers.includes(id));
    return filteredUsers.length ? filteredUsers : [-1];
  };

  const handleUserIsActiveChange = (event) => {
    const updatedUserIsActive = event.target.value;
  
    let filteredIsActiveUsers = [];
    if (updatedUserIsActive === UserIsActiveStatus.ACTIVE) {
      filteredIsActiveUsers = users
        .filter(user => user.is_active)
        .map(user => user.id);
  
      if (filteredIsActiveUsers.length === 0) {
        filteredIsActiveUsers = [-1];
      }
    } else if (updatedUserIsActive === UserIsActiveStatus.INACTIVE) {
      filteredIsActiveUsers = users
        .filter(user => !user.is_active)
        .map(user => user.id);
  
      if (filteredIsActiveUsers.length === 0) {
        filteredIsActiveUsers = [-1];
      }
    } else if (updatedUserIsActive === UserIsActiveStatus.ALL) {
      filteredIsActiveUsers = [];
    }
  
    const filteredUsers = applyFilters(filteredIsActiveUsers, selectedParams.typeStatusUsers);
  
    setSelectedParams((prev) => ({
      ...prev,
      isActiveUsers: filteredIsActiveUsers,
      users: filteredUsers,
    }));
    setUserIsActive(updatedUserIsActive);
    fetchData(date[0], date[1], filteredUsers, selectedParams.group, selectedParams.organization);
    fetchTableData(date[0], date[1], filteredUsers, selectedParams.group, selectedParams.organization);
  };

  const handleUserTypeChange = (event) => {
    const updatedUserType = event.target.value;
  
    let filteredTypeStatusUsers = [];
    if (updatedUserType !== UserType.ALL && updatedUserType) {
      filteredTypeStatusUsers = users
        .filter(user => user.user_type === updatedUserType)
        .map(user => user.id);
  
      if (filteredTypeStatusUsers.length === 0) {
        filteredTypeStatusUsers = [-1];
      }
    } else if (updatedUserType === UserType.ALL) {
      filteredTypeStatusUsers = [];
    }
  
    const filteredUsers = applyFilters(selectedParams.isActiveUsers, filteredTypeStatusUsers);
  
    setSelectedParams((prev) => ({
      ...prev,
      typeStatusUsers: filteredTypeStatusUsers,
      users: filteredUsers,
    }));
    setSelectedUserType(updatedUserType);
    fetchData(date[0], date[1], filteredUsers, selectedParams.group, selectedParams.organization);
    fetchTableData(date[0], date[1], filteredUsers, selectedParams.group, selectedParams.organization);
  };

  const handleToggleItem = (key) => {
    const updatedItems = { ...activeItems, [key]: !activeItems[key] };
    setActiveItems(updatedItems);
  
    const allSelectedNow = Object.values(updatedItems).every(Boolean);
    setAllSelected(allSelectedNow);
  };

  const activeSeries = Object.entries(activeItems)
    .filter(([key, value]) => value)
    .map(([key]) => ({
      data: chartData.map(item => item[key]),
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      connectNulls: true,
      color: colors[key],
    }));

  const toggleSelectAll = () => {
    const newState = !allSelected;
    setActiveItems(Object.fromEntries(Object.keys(activeItems).map((key) => [key, newState])));
    setAllSelected(newState);
  };

  const handleSearch = (searchValue) => {
    const filteredData = originalTableData.filter((row) => {
      const userStr = row.user.toLowerCase();
      const idStr = row.id.toString();
      const searchLower = searchValue.toLowerCase();
  
      return (
        userStr.includes(searchLower) ||
        idStr.includes(searchLower)
      );
    });
    setTableData(filteredData);
  };

  const handleClearSearch = () => {
    setTableData(originalTableData);
  };
  
  const handleExport = () => {
    const csvContent = [
      ['User', 'User Type', 'Resource View', 'Visits Count', 'Downloads', 'Saves', 'All Notes', 'Login', 'Search', 'Groups'],
      ...tableData.map((row) => [
        row.user,
        row.userType,
        row.view,
        row.count,
        row.downloads,
        row.saves,
        row.notes,
        row.login,
        row.search,
        row.groups,
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'user-analytics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cls.userAnalytics}>
      <Typography variant="h5">
        User Analytics 
      </Typography>
      <div>
        <FormControl size="small" sx={{ width: '350px', marginRight: '24px' }}>
          <InputLabel id="demo-simple-select-label">Date Range</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={range}
            label="Date Range"
            onChange={handleRange}
          >
            <MenuItem value={DateRange.LAST_30_DAYS}>Last 30 Days</MenuItem>
            <MenuItem value={DateRange.LAST_90_DAYS}>Last 90 Days</MenuItem>
            <MenuItem value={DateRange.LAST_YEAR}>Last Year</MenuItem>
            {getYearOptions().map((year) => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
            {range === DateRange.CUSTOM && <MenuItem style={{ display: 'none' }} value={DateRange.CUSTOM}>Date Range</MenuItem>}
          </Select>
        </FormControl>
        <DateRangePicker
          onChange={handleDateRangeChange}
          value={date.length === 2 ? date : undefined}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Autocomplete
            id="organization-autocomplete"
            options={organizations || []}
            loading={isLoading}
            value={selectedParams.organization || null}
            onChange={handleOrganizationChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Organizations"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Autocomplete
            id="groups-autocomplete"
            options={groups || []}
            loading={isLoading}
            value={selectedParams.group || null}
            onChange={handleGroupChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Groups"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl size="small" sx={{ width: '100%' }}>
            <InputLabel className={cls.formInputLabel}>User Type</InputLabel>
            <Select
              className={cls.formSelect}
              value={selectedUserType || ''}
              label="User Type"
              onChange={handleUserTypeChange}
            >
              <MenuItem value={UserType.ALL}>All</MenuItem>
              {userTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <FormControl size="small" sx={{ width: '100%' }}>
            <InputLabel className={cls.formInputLabel}>User Is Active</InputLabel>
            <Select
              className={cls.formSelect}
              value={userIsActive || ''}
              label="User Is Active"
              onChange={handleUserIsActiveChange}
            >
              <MenuItem value={UserIsActiveStatus.ALL}>All</MenuItem>
              <MenuItem value={UserIsActiveStatus.ACTIVE}>Yes</MenuItem>
              <MenuItem value={UserIsActiveStatus.INACTIVE}>No</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        {Object.keys(activeItems).map((key) => (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={activeItems[key]}
                onChange={() => handleToggleItem(key)}
                sx={{
                  color: colors[key],
                  '&.Mui-checked': {
                    color: colors[key],
                  },
                }}
              />
            }
            label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
          />
        ))}
        <Button
          variant="outlined"
          onClick={toggleSelectAll}
          sx={{ marginLeft: '16px' }}
          color='primary'
        >
          {allSelected ? 'Unselect All' : 'Select All'}
        </Button>
      </div>
      {chartData.length > 0 && (
        <LineChart
          xAxis={[
            {
              data: chartData.map(item => item.date),
              scaleType: 'point',
            },
          ]}
          series={activeSeries}
          width={1280}
          height={400}
          slotProps={{ legend: { hidden: true } }}
        />
      )}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              {Object.keys(chartData[0] || {})
                .filter((key) => key !== 'date')
                .map((key) => (
                  <CellWithRightBorder key={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </CellWithRightBorder>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {chartData.length > 0 && (
              <TableRow>
                {Object.keys(chartData[0] || {})
                  .filter((key) => key !== 'date')
                  .map((key) => (
                    <CellWithRightBorder key={key}>
                      {chartData.reduce((sum, item) => sum + (item[key] || 0), 0)}
                    </CellWithRightBorder>
                  ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <div>
      {isLoading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          slots={{
            toolbar: () => (
              <EditUserToolbar
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onExport={handleExport}
              />
            ),
          }}
          rows={tableData}
          columns={columns}
          pageSize={5}
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          showCellVerticalBorder
          autoHeight
        />
      )}
      </div>
    </div>
  );
}

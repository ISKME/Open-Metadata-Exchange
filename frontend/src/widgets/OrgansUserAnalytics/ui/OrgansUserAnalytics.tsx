/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import styled from '@emotion/styled';
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
import { Autocomplete, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import cls from './OrgansUserAnalytics.module.scss'
import { DateRange, UserType, ChartColors } from '../../enum';


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

export function OrgansUserAnalytics({ id }) {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
  const [date, setDate] = React.useState([defaultStartDate, defaultEndDate]);
  const [range, setRange] = React.useState(DateRange.LAST_30_DAYS);
  const [selectedUserType, setSelectedUserType] = React.useState('');
  const [userTypeOptions, setUserTypeOptions] = React.useState([]);
  const [groups, setGroups] = React.useState([]);
  const [chartData, setChartData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [tableData, setTableData] = React.useState([]);
  const [originalTableData, setOriginalTableData] = React.useState([]);
  const [allSelected, setAllSelected] = React.useState(true);
  const [users, setUsers] = React.useState([]);
  const [selectedParams, setSelectedParams] = React.useState({
    users: [],
    selectedUsers: [],
    typeStatusUsers: [],
    group: null,
  });
  const [activeItems, setActiveItems] = React.useState({
    resourceView: true,
    visitsCount: true,
    downloads: true,
    saves: true,
    allNotes: true,
    login: true,
    search: true,
  });
  const columns = [
    { field: 'user', headerName: 'User', width: 158 },
    { field: 'userType', headerName: 'User Type', width: 80 },
    { field: 'view', headerName: 'Resource View', width: 80 },
    { field: 'count', headerName: 'Visits Count', width: 80 },
    { field: 'downloads', headerName: 'Downloads', width: 80 },
    { field: 'saves', headerName: 'Saves', width: 80 },
    { field: 'notes', headerName: 'All Notes', width: 80 },
    { field: 'login', headerName: 'Login', width: 80 },
    { field: 'search', headerName: 'Search', width: 80 },
  ]; // SUM 798px
  const colors = {
    resourceView: ChartColors.RED,
    visitsCount: ChartColors.PINK,
    downloads: ChartColors.CYAN,
    allNotes: ChartColors.GRAY,
    login: ChartColors.GREEN,
    search: ChartColors.BLUE,
    saves: ChartColors.BROWN,
  };

  React.useEffect(() => {
    const startDate = new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = new Date();
    const userIds = [];
    const group = null;

    fetchConfigs(startDate, endDate);
    fetchData(startDate, endDate);
    fetchTableData(startDate, endDate, userIds, group);
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchData = (startDate, endDate, users = [], group = null) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
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
        }));
        setChartData(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching analytics data:', error);
      });
  };

  const fetchTableData = async (startDate, endDate, users = [], group = null) => {
    const params = {
      ...(id ? { organization_id: id } : { get_default_organization: true }),
      date_range_start: startDate ? formatDate(startDate) : undefined,
      date_range_end: endDate ? formatDate(endDate) : undefined,
      users: users.length > 0 ? users : undefined,
      group: group || undefined,
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

  const fetchConfigs = async (startDate, endDate) => {
    setIsLoading(true);
    const params = startDate && endDate
      ? { date_range_start: formatDate(startDate), date_range_end: formatDate(endDate) }
      : {};
      if (id) {
        params['organization_id'] = id;
      } else {
        params['get_default_organization'] = true;
      }

    try {
      const { data } = await axios.get('/clickhouse/configs', { params });

      const uniqueUserTypes = Array.from(new Set(data.users.map((user) => user.user_type)));

      setUsers(
        data.users.map((user) => ({
          id: user.id,
          label: `${user.first_name} ${user.last_name}`.trim() || 'Unnamed User',
          user_type: user.user_type,
        }))
      );
      setGroups(data.groups.map((group) => ({ label: group })));
      setUserTypeOptions(uniqueUserTypes);
    } catch (error) {
      console.error('Error fetching configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedParams({ users: [], group: null, selectedUsers: [], typeStatusUsers: []});
    setSelectedUserType("");
    setGroups([]);
  };

  const handleRange = (event) => {
    const selectedRange = event.target.value;
    setRange(selectedRange);

    let startDate, endDate;

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
      case DateRange.ALL_TIME:
        startDate = new Date("2010-01-01");
        endDate = new Date();
        break;
      case DateRange.CUSTOM:
      default:
        return;
    }
    setDate([startDate, endDate]);
    fetchConfigs(startDate, endDate);
    fetchData(startDate, endDate, [], null);
    fetchTableData(startDate, endDate, [], null);
    resetFilters();
  };

  const handleDateRangeChange = (newDate) => {
    if (!newDate) {
      const defaultEndDate = new Date();
      const defaultStartDate = new Date(new Date().setDate(defaultEndDate.getDate() - 30));
      setDate([defaultStartDate, defaultEndDate]);
      setRange(DateRange.LAST_30_DAYS);
      fetchData(defaultStartDate, defaultEndDate, [], null);
      fetchTableData(defaultStartDate, defaultEndDate, [], null);
      fetchConfigs(defaultStartDate, defaultEndDate);
    } else if (newDate && newDate.length === 2) {
      setDate(newDate);
      setRange(DateRange.CUSTOM);
      fetchData(newDate[0], newDate[1], [], null);
      fetchTableData(newDate[0], newDate[1], [], null);
      fetchConfigs(newDate[0], newDate[1]);
    }
    resetFilters();
  };

  const handleUserChange = (event, newValue) => {
    const updatedUsers = newValue ? newValue.map((user) => user.id) : [];

    const filteredUsers = applyFilters(updatedUsers, selectedParams.typeStatusUsers);

    setSelectedParams((prev) => ({
      ...prev,
      selectedUsers: updatedUsers,
      users: filteredUsers,
    }));

    fetchData(date[0], date[1], filteredUsers, selectedParams.group);
    fetchTableData(date[0], date[1], filteredUsers, selectedParams.group);
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

    const filteredUsers = applyFilters(selectedParams.selectedUsers, filteredTypeStatusUsers);

    setSelectedParams((prev) => ({
      ...prev,
      typeStatusUsers: filteredTypeStatusUsers,
      users: filteredUsers,
    }));
    setSelectedUserType(updatedUserType);
    fetchData(date[0], date[1], filteredUsers, selectedParams.group);
    fetchTableData(date[0], date[1], filteredUsers, selectedParams.group);
  };

  const applyFilters = (selectedUsers, typeStatusUsers) => {
    if (!selectedUsers.length) return typeStatusUsers;
    if (!typeStatusUsers.length) return selectedUsers;

    const filteredUsers = selectedUsers.filter(id => typeStatusUsers.includes(id));
    return filteredUsers.length ? filteredUsers : [-1];
  };

  const handleGroupChange = (event, newValue) => {
    const updatedGroup = newValue ? newValue.label : null;

    setSelectedParams((prev) => ({
      ...prev,
      group: updatedGroup,
    }));

    fetchData(date[0], date[1], selectedParams.users, updatedGroup);
    fetchTableData(date[0], date[1], selectedParams.users, updatedGroup);
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
      ['User', 'User Type', 'Resource View', 'Visits Count', 'Downloads', 'Saves', 'All Notes', 'Login', 'Search'],
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
            <MenuItem value={DateRange.ALL_TIME}>All Time</MenuItem>
            {range === DateRange.CUSTOM && <MenuItem style={{ display: 'none' }} value={DateRange.CUSTOM}>Date Range</MenuItem>}
          </Select>
        </FormControl>
        <DateRangePicker
          onChange={handleDateRangeChange}
          value={date.length === 2 ? date : undefined}
        />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Autocomplete
            multiple
            id="users-autocomplete"
            options={users || []}
            loading={isLoading}
            value={selectedParams.selectedUsers
              .map((id) => users.find((user) => user.id === id))
              .filter(Boolean)}
            onChange={handleUserChange}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Users"
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
        <Grid item xs={4}>
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
        <Grid item xs={4}>
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
          width={800}
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

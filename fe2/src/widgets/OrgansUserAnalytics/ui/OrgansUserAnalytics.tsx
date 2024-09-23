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
import { Autocomplete } from '@mui/material';
import { DataGrid, GridToolbarContainer } from '@mui/x-data-grid';

const users = [
  'teacherlinepbs@gmail.com',
  'nick.iskme@gmail.org',
  'testuser@nbpts.org',
  'vstrachan2@gmail.com',
  'A L',
  'Ahmed Eweida',
  'Ahmed Eweida',
  'Allison Johnson',
  'Andrew Orzel',
  'Ann Jenkins',
  'Ann Little',
  'Ann Titherington',
  'Anne Laskey',
  'Anoop Aryal',
  'Anthony Ponton',
  'April Sommer',
  'ATLAS Admin',
  'ATLAS Student',
  'ATLAS Student Test',
  'Bauer Marquette',
  'Bella Scott',
  'Ben Jenkins',
  'Betty Smalls',
  'Brandy Butcher',
  'Briana Timmerman',
  'Caitlin Wilson',
  'Carol Szmajda',
  'Caroline Edwards',
  'Charisse Raikes',
  'Chris Clauss',
  'Cindy Schall',
  'Coreen Moriah',
  'Craig Nelson',
  'Cynthia Jimes',
  'D2L ISKME Instructor',
  'Daniel Carroll',
  'Dawn McCoart',
  'Diane Wagner',
  'Eve Case',
  'Foad Nikoukar',
  'glowena harrison',
  'Glowena Harrison',
  'GStephen Helgeson',
  'Hanaa Ziad',
  'I T',
  'Instructor3 Test',
  'ISKME Admin',
  'ISKME Administrator',
  'ISKME Student',
  'Jack Lane',
  'Jacquelyn Fabian',
  'Janet Liimatta',
  'Jennifer Burgin',
  'Jennifer Hall',
  'Jeremy Anne Knight hotel',
  'Jorge Cordoba',
  'Julie French',
  'Keenan Hall',
  'Kelly Ransier',
  'Kevin Frankhouser',
  'Kim O\'Neil',
  'Kristen Johnston',
  'Kristin Buckstad',
  'Kristin Hamilton',
  'Lea DeForest',
  'Marcia Foster',
  'Marcia Foster',
  'Margaret Ponton',
  'Marjorie Lathers',
  'Mark Albright',
  'Max Sitnikov',
  'Max St',
  'Melinda Boland',
  'Melinda LeBlanc',
  'Michelle Brennan',
  'Michelle Brennan',
  'Mindy Boland',
  'Mindy Boland',
  'MKB Tagger',
  'Molly Sause-hotel',
  'Monica Bradshaw',
  'Monica Bradshaw',
  'Nancy Headrick',
  'Nancy Routson',
  'Nick Lobaito',
  'oercommons.ux@gmail.com',
  'oercommons.ux+inst1@gmail.com',
  'oercommons.ux+inst4@gmail.com',
  'Peter Musser',
  'Polina Grinbaum',
  'Renee Shaw',
  'Robelge Lenora',
  'Robyn Kaye',
  'Ruth Goldstraw',
  'Sam Jenkins',
  'Sam Sampson',
  'Samira Ramezan',
  'Sandra Kelish',
  'Sandy Culotta',
  'Stas Shevyakov',
  'Student User',
  'Student 6 Test',
  'Tanya Parrott',
  'Taylor McGrath',
  'test user',
  'Test Student2',
  'Test2 Instructor',
  'Test3 Student',
  'Test 4 Student',
  'Thomas Jones',
  'Thomas Jones',
  'Vanessa Strachan',
  'Victoria Wain',
  'wanda foster',
  'Wendy Smith',
];

function createData(a, b, c, d, e, f, g, h) {
  return {
    a, b, c, d, e, f, g, h,
  };
}

function EditUserToolbar() {
  return (
    <GridToolbarContainer>
      <TextField id="outlined-basic" label="Search" variant="outlined" size="small" sx={{ width: '65%' }} />
      <Button color="primary">
        Export CSV
      </Button>
    </GridToolbarContainer>
  );
}

const CellWithRightBorder = styled(TableCell)(({ theme }) => ({
  borderRightWidth: '1px !important',
  borderRightColor: 'rgb(224 224 224) !important',
  borderRightStyle: 'solid !important',
}));

export function OrgansUserAnalytics() {
  const [date, setDate] = React.useState(null);
  const [range, setRange] = React.useState('');
  const [userType, setUserType] = React.useState();
  const [groups, setGroups] = React.useState([]);

  const handleRange = (event) => {
    setRange(event.target.value);
  };

  React.useEffect(() => {
    axios.get('/clickhouse/configs/').then(({ data }) => {
      if (!data) return;
      setGroups(data.groups);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '800px' }}>
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
            <MenuItem value={10}>Last 30 Days</MenuItem>
            <MenuItem value={20}>Last 90 Days</MenuItem>
            <MenuItem value={30}>Last Year</MenuItem>
            <MenuItem value={30}>All Time</MenuItem>
          </Select>
        </FormControl>
        <DateRangePicker onChange={setDate} value={date} />
      </div>
      <Grid container spacing={2}>
        <Grid item xs={4}>
        <Autocomplete
            freeSolo
            id="free-solo-2-demo"
            size="small"
            disableClearable
            options={users}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Users"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl sx={{ width: '100%' }} size="small">
            <InputLabel id="demo-simple-select-label">User Type</InputLabel>
            <Select
              value={userType}
              label="User Type"
              onChange={({ target }) => setUserType(target.value)}
            >
              <MenuItem value={10}>All</MenuItem>
              <MenuItem value={20}>Admin</MenuItem>
              <MenuItem value={30}>Instructor</MenuItem>
              <MenuItem value={40}>Student</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <Autocomplete
            freeSolo
            id="free-solo-2-demo"
            size="small"
            disableClearable
            options={groups}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Groups"
                InputProps={{
                  ...params.InputProps,
                  type: 'search',
                }}
              />
            )}
          />
        </Grid>
      </Grid>
      <LineChart
        xAxis={[
          {
            data: [
              '2024-04-16',
              '2024-04-17',
              '2024-04-23',
              '2024-04-24',
              '2024-04-27',
              '2024-04-30',
              '2024-05-05',
              '2024-05-06',
              '2024-05-07',
              '2024-05-08',
              '2024-05-09',
              '2024-05-10',
              '2024-05-11',
              '2024-05-12',
              '2024-05-13',
              '2024-05-14',
              '2024-05-16',
            ],
            scaleType: 'point',
          },
        ]}
        series={[
          {
            data: [1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, null, null, null, 1, 2],
            connectNulls: true,
          },
          {
            data: [1, null, null, null, null, null, null, 2, 4, 6, 6, 7, 1, 4, 4, 13, null],
            connectNulls: true,
          },
          {
            data: [null, null, null, null, null, null, null, null, null, 2, 1, 1, null, null, null, null, null],
            connectNulls: true,
          },
        ]}
        width={800}
        height={400}
      />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <CellWithRightBorder>Users</CellWithRightBorder>
              <CellWithRightBorder>Logins</CellWithRightBorder>
              <CellWithRightBorder>Cases Viewed&nbsp;(K)</CellWithRightBorder>
              <CellWithRightBorder>Searches&nbsp;(K)</CellWithRightBorder>
              <CellWithRightBorder>Groups</CellWithRightBorder>
              <CellWithRightBorder>Resources downloaded</CellWithRightBorder>
              <CellWithRightBorder>Notes</CellWithRightBorder>
              <TableCell>Cases Saved</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[createData(5, 5, 6, 5, 0, 0, 0, 0)].map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <CellWithRightBorder>{row.a}</CellWithRightBorder>
                <CellWithRightBorder>{row.b}</CellWithRightBorder>
                <CellWithRightBorder>{row.c}</CellWithRightBorder>
                <CellWithRightBorder>{row.d}</CellWithRightBorder>
                <CellWithRightBorder>{row.e}</CellWithRightBorder>
                <CellWithRightBorder>{row.f}</CellWithRightBorder>
                <CellWithRightBorder>{row.g}</CellWithRightBorder>
                <TableCell>{row.h}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <DataGrid
        rows={[
          { id: 1, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
          { id: 2, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
          { id: 3, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
          { id: 4, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
          { id: 5, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
          { id: 6, user: 'Michelle Brennan', role: 'NB Admin', logins: '3', cases: '3', searches: '1', groups: '0', resources: '2', notes: '0', saved: '0' },
        ]}
        columns={
          [
            { field: 'user', headerName: 'User', width: 175 },
            { field: 'role', headerName: 'Role', width: 85 },
            { field: 'logins', headerName: 'Logins', width: 69 },
            { field: 'cases', headerName: 'Cases Viewed', width: 69 },
            { field: 'searches', headerName: 'Searches', width: 80 },
            { field: 'groups', headerName: 'Groups', width: 69 },
            { field: 'resources', headerName: 'Resources Downloaded', width: 90 },
            { field: 'notes', headerName: 'Notes', width: 69 },
            { field: 'saved', headerName: 'Cases Saved', width: 92 },
          ]
        }
        slots={{
          toolbar: EditUserToolbar,
        }}
        getRowHeight={() => 'auto'}
        disableRowSelectionOnClick
        showCellVerticalBorder
        density="compact"
      />
    </div>
  );
}

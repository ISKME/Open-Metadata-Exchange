/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import Typography from '@mui/material/Typography';
import { TableEdit } from 'widgets/TableEdit';
import cls from './OrgansGroups.module.scss';

let i = 0;
const randomId = () => i++;

const randomRole = () => 'Admin';
const randomCreatedDate = () => new Date();

const initial = [
  {
    id: randomId(),
    name: 'Test Group 1',
    leaders: 'Michelle Brennan',
    members: 10,
    cases: 10,
  },
  {
    id: randomId(),
    name: 'Test Group 2',
    leaders: 'Michelle Brennan',
    members: 10,
    cases: 10,
  },
  {
    id: randomId(),
    name: 'Test Group 3',
    leaders: 'Michelle Brennan',
    members: 10,
    cases: 10,
  },
  {
    id: randomId(),
    name: 'Test Group 4',
    leaders: 'Michelle Brennan',
    members: 10,
    cases: 10,
  },
  {
    id: randomId(),
    name: 'Test Group 5',
    leaders: 'Michelle Brennan',
    members: 10,
    cases: 10,
  },
];

export function OrgansGroups() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '800px' }}>
      <Typography component="div" variant="h5">
        Groups
      </Typography>
      <TableEdit
        toolbar
        records={initial}
        headers={
          [
            {
              field: 'name', headerName: 'Name', width: 250, editable: true,
            },
            {
              field: 'leaders',
              headerName: 'Leaders',
              align: 'left',
              headerAlign: 'left',
              editable: true,
              width: 288,
            },
            {
              field: 'members',
              headerName: 'Members',
              type: 'number',
              width: 80,
              align: 'left',
              headerAlign: 'left',
              editable: true,
            },
            {
              field: 'cases',
              headerName: 'Cases',
              type: 'number',
              width: 80,
              align: 'left',
              headerAlign: 'left',
              editable: true,
            },
          ]
        }
      />
    </div>
  );
}

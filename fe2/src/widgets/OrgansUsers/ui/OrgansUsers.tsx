/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DataGrid } from '@mui/x-data-grid';
import cls from './OrgansUsers.module.scss';
import { TableEdit } from 'widgets/TableEdit';

const buttonStyles = {
  border: '1px solid #999',
  cursor: 'pointer',
  fontSize: '0.88em',
  color: 'black !important',
  borderRadius: '2px',
  boxShadow: '1px 1px 3px #ccc',
  background: 'linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)',
};

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export function OrgansUsers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const selectedOrgCookie = getCookie('selected_org');
        const selectedOrg = selectedOrgCookie ? JSON.parse(selectedOrgCookie) : null;
        const organizationId = selectedOrg?.id;

        if (!organizationId) {
          throw new Error('Organization ID not found in cookies');
        }

        const response = await axios.get(`/api/organizations/v1/organizations/${organizationId}/members`);
        const formattedMembers = response.data.results.map(member => ({
          id: member.id,
          firstName: member.user.first_name,
          lastName: member.user.last_name,
          email: member.user.email,
          role: member.role === 20 ? 'Admin' : (member.role === 30 ? 'Instructor' : 'Student'),
          status: member.status === 1 ? 'Pending' : 'Approved',
          joined: new Date(member.user.date_joined),
          lastLogin: new Date(member.user.last_login),
        }));
        setMembers(formattedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '800px' }}>
      <Typography component="div" variant="h5">
        Users
      </Typography>
      <Typography>
        <b>NOTE: </b>
        Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
        Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
      </Typography>
      <Paper
        elevation={3}
        sx={{
          display: 'flex', gap: '4px', backgroundColor: '#efeff0', padding: '8px',
        }}
      >
        <Button sx={buttonStyles}>New</Button>
        <Button style={buttonStyles} disabled>Deactivate</Button>
        <Button sx={buttonStyles}>Import</Button>
        <Button style={buttonStyles} disabled>Export</Button>
        <Button style={buttonStyles} disabled>Move</Button>
        <Button style={buttonStyles} disabled>Re-invite</Button>
        <TextField id="outlined-basic" label="Search" variant="outlined" size="small" sx={{ flex: 1, backgroundColor: 'white' }} />
      </Paper>
      <TableEdit
        selection
        records={members}
        headers={[
          { field: 'id', headerName: 'ID', width: 20 },
          { field: 'firstName', headerName: 'First name', editable: true, width: 79 },
          { field: 'lastName', headerName: 'Last name', editable: true, width: 79 },
          { field: 'email', headerName: 'Email', editable: true },
          { field: 'role', headerName: 'Role', type: 'singleSelect', valueOptions: ['Admin', 'Instructor', 'Student'], editable: true, width: 70 },
          { field: 'status', headerName: 'Status', editable: true, type: 'singleSelect', valueOptions: ['Pending', 'Approved'], width: 70 },
          { field: 'joined', headerName: 'Joined', type: 'date', editable: true },
          { field: 'lastLogin', headerName: 'Last login', type: 'date', editable: true },
        ]}
        checkboxSelection
        disableRowSelectionOnClick
      />
    </div>
  );
}

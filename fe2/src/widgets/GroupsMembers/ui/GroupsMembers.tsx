/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { TableEdit } from 'widgets/TableEdit';
import Modal from '@mui/material/Modal';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import cls from './GroupsMembers.module.scss';

const buttonStyles = {
  border: '1px solid #999',
  cursor: 'pointer',
  fontSize: '0.88em',
  color: 'black !important',
  borderRadius: '2px',
  boxShadow: '1px 1px 3px #ccc',
  background: 'linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)',
};

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Name', width: 240, editable: true },
  { field: 'email', headerName: 'Email', width: 240, editable: true },
  { field: 'role', headerName: 'Role', width: 120, editable: true, type: 'singleSelect', valueOptions: ['Admin', 'Member'] },
  { field: 'status', headerName: 'Status', width: 120, editable: true, type: 'singleSelect', valueOptions: ['Pending', 'Approved'] },
  { field: 'joined', headerName: 'Joined', type: 'date', width: 180, editable: true },
  // {
  //   field: 'fullName',
  //   headerName: 'Full name',
  //   description: 'This column has a value getter and is not sortable.',
  //   sortable: false,
  //   width: 160,
  //   valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  // },
];

const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  borderRadius: '6px',
  p: 4,
};

export function GroupsMembers({ members }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div style={{ display: 'flex' }}>
            <Typography style={{ flex: 1 }} id="modal-modal-title" variant="h6" component="h2">
              Add Members
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </div>
          <TextField id="outlined-basic" label="Search 113 members of organization" variant="outlined" sx={{ width: '100%' }} />
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <FormGroup>
              <FormControlLabel control={<Checkbox />} label="Michelle Brennan <michelle.k.brenn@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="Foad Nikoukar <foad.nik9191@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="Thomas Jones <thomas.jones.2k@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="Hanaa Ziad <hanaa@iskme.org>" />
              <FormControlLabel control={<Checkbox />} label="Mindy Boland <melinda.n.boland@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="GStephen Helgeson <stephen.helgeson@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="Marcia Foster <mfoster@nbpts.org>" />
              <FormControlLabel control={<Checkbox />} label="Ann Jenkins <ajenkins02@aol.com>" />
              <FormControlLabel control={<Checkbox />} label="Stas Shevyakov <stas.shevyakov@gmail.com>" />
              <FormControlLabel control={<Checkbox />} label="Vanessa Strachan <vanessa@iskme.org>" />
              <FormControlLabel control={<Checkbox />} label="Monica Bradshaw <mbradshaw@lavincent.com>" />
              <FormControlLabel control={<Checkbox />} label="Ahmed Eweida <amfarag2@gmail.com>" />
            </FormGroup>
          </div>
          <Typography sx={{ margin: '16px 0' }}>
            <b>NOTE:</b>
            Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
            Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
          </Typography>
          <TextField
            label="Not listed above? Invite by email address, separate emails with a comma."
            multiline
            rows={4}
            sx={{ width: '100%' }}
          />
          <hr style={{ margin: '16px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <Button>Cancel</Button>
            <Button sx={{
              marginLeft: '16px',
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
            }}
            >
              Add member
            </Button>
          </div>
        </Box>
      </Modal>
      <div style={{ width: '100%', padding: '0 10%' }}>
        <Typography variant="h5">
          Manage Members
        </Typography>
        <Typography sx={{ margin: '16px 0' }}>
          NOTE: Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
          Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
        </Typography>
        <Paper
          elevation={3}
          sx={{
            display: 'flex', gap: '4px', backgroundColor: '#efeff0', padding: '8px',
          }}
        >
          <Button style={buttonStyles} onClick={() => setOpen(true)}>Invite</Button>
          <Button style={buttonStyles} disabled>Remove</Button>
          <Button style={buttonStyles} disabled>Re-invite</Button>
          <TextField id="outlined-basic" label="Search" variant="outlined" sx={{ flex: 1, backgroundColor: 'white' }} />
        </Paper>
        <TableEdit selection records={members} headers={columns} />
      </div>
    </>
  );
}

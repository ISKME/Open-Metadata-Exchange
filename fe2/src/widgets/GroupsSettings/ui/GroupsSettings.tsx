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
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopy from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from '@mui/material/Modal';
import { Uploader } from 'components/uploader';
import cls from './GroupsSettings.module.scss';

export function GroupsSettings({ title, cover ,description }) {
  const [n, setN] = React.useState(0);
  return (
    <Grid container spacing={2} sx={{ padding: '0 10%' }}>
      <Grid item xs={4}>
        <Paper elevation={0} sx={{ width: 320, maxWidth: '100%' }}>
          <MenuList>
            <MenuItem onClick={() => setN(0)} style={{ backgroundColor: n === 0 ? 'rgb(206, 206, 206)' : '' }}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Group Profile</ListItemText>
              {/* <Typography variant="body2" color="text.secondary">
                ⌘X
              </Typography> */}
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setN(1)} style={{ backgroundColor: n === 1 ? 'rgb(206, 206, 206)' : '' }}>
              <ListItemIcon>
                <ContentCopy fontSize="small" />
              </ListItemIcon>
              <ListItemText>Duplicate Group</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => setN(2)} style={{ backgroundColor: n === 2 ? 'rgb(206, 206, 206)' : '' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Delete Group</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Grid>
      <Grid item xs={8}>
        {n === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Typography variant="h5">
              Testing Groups On Production
            </Typography>
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              What is the name of your Group?*
            </Typography>
            <TextField label="e.g. 'Teachers as Makers'" variant="outlined" margin="dense" value={title} />
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              Add a Description*
            </Typography>
            <TextField label="This group's purpose is..." variant="outlined" margin="dense" multiline rows={4} value={description} />
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              Group cover image
            </Typography>
            <Uploader text="Upload file" init={cover} />
            <div>
              <Button variant="contained" sx={{ marginRight: '8px', backgroundColor: '#303E48' }}>
                Save Changes
              </Button>
              <Button variant="outlined">
                Cancel
              </Button>
            </div>
          </div>
        )}
        {n === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Typography variant="h5">
              Duplicate Group
            </Typography>
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              What is the name of your Group?*
            </Typography>
            <TextField label="e.g. 'Teachers as Makers'" variant="outlined" margin="dense" value={title} />
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              Add a Description*
            </Typography>
            <TextField label="This group's purpose is..." variant="outlined" margin="dense" multiline rows={4} value={description} />
            <Typography sx={{ margin: '0 0 -16px 0' }}>
              Group cover image
            </Typography>
            <Uploader text="Upload file" init={cover} />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Duplicate Folders" />
            <FormControlLabel control={<Checkbox defaultChecked />} label="Duplicate Members" sx={{ marginTop: '-16px' }} />
            <Button variant="contained" sx={{ backgroundColor: '#303E48' }}>
              Create New Group
            </Button>
          </div>
        )}
        {n === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Typography variant="h5">
              Deleting this group means:
            </Typography>
            <ul style={{ listStyleType: 'disc' }}>
              <li>All folders and sub-folders will be deleted.</li>
              <li>All cases will no longer be saved to folders.</li>
              <li>All group information will be deleted.</li>
              <li>All membership information will be deleted.</li>
              <li>All notes shared with this group will no longer be visible to group members.</li>
            </ul>
            <b>
              Are you sure you want to delete this group?
            </b>
            <div>
              <Button variant="contained" sx={{ marginRight: '8px', backgroundColor: '#303E48' }}>
                Yes, Delete this Group
              </Button>
              <Button variant="outlined">
                No, Cancel
              </Button>
            </div>
          </div>
        )}
      </Grid>
    </Grid>
  );
}
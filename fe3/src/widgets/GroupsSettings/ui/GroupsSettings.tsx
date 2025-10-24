import * as React from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
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
import { Uploader } from 'components/uploader';
import cls from './GroupsSettings.module.scss';
import { FormControl, InputLabel } from '@mui/material';

export function GroupsSettings() {
  const [n, setN] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [duplicateTitle, setDuplicateTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [duplicateDescription, setDuplicateDescription] = React.useState('');
  const [cover, setCover] = React.useState(null);
  const { id: groupId } = useParams();
  const inputRef = React.useRef(null)
  const dataImageRef = React.useRef('')

  const [duplicateFolders, setDuplicateFolders] = React.useState(true);
  const [duplicateMembers, setDuplicateMembers] = React.useState(true);

  async function fetchGroupData() {
    try {
      const response = await axios.get(`/api/groups/v1/groups/${groupId}`);
      const groupData = response.data;
      setTitle(groupData.title);
      setDuplicateTitle(`Copy of ${groupData.title}`);
      setDescription(groupData.description);
      setDuplicateDescription(groupData.description);
      setCover(groupData.cover || null);
      dataImageRef.current = groupData.cover || '';
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  }

  React.useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleSaveChanges = async () => {
    try {
      const { data: csrfData } = await axios.get('/api/csrf-token');
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Csrftoken': csrfData.token,
      };

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);

      if (cover instanceof File) {
        formData.append('cover', cover);
      } else if (!cover) {
        formData.append('cover', '');
      }

      const response = await axios.put(`/api/groups/v1/groups/${groupId}`, formData, { headers });
      if (response.status === 200) {
        alert('Changes saved successfully.');
        location.reload();
      } else {
        alert('An unexpected response was received. Please try again.');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again later.');
    }
  };

  const handleDuplicateGroup = async () => {
    try {
      const { data: csrfData } = await axios.get('/api/csrf-token');
      const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Csrftoken': csrfData.token,
      };
  
      const payload = {
        title: duplicateTitle,
        description: duplicateDescription,
        duplicate_members: duplicateMembers,
        duplicate_folders: duplicateFolders,
      };

      const response = await axios.post(
        `/api/groups/v1/groups/${groupId}/duplicate`,
        payload,
        { headers }
      );

      if (response.status === 200 || response.status === 201) {
        alert('Group duplicated successfully.');
        window.location.href = `/groups/new/${response.data.id}`;
      } else {
        alert('An unexpected response was received. Please try again.');
      }
    } catch (error) {
      console.error('Error duplicating group:', error);
      alert('Failed to duplicate the group. Please try again later.');
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const { data } = await axios.get('/api/csrf-token');
      const headers = {
        'Content-Type': 'application/json;charset=UTF-8',
        'X-Csrftoken': data.token,
      };
      const response = await axios.delete(`/api/groups/v1/groups/${groupId}`, { headers });
      if (response.status === 204) {
        alert('Group has been successfully deleted.');
        window.location.href = '/';
      } else {
        alert('An unexpected response was received. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      if (error.response && error.response.status === 403) {
        alert('You do not have permission to delete this group.');
        return;
      }
      alert('Failed to delete the group. Please try again later.');
    }
  };

  const cancelChanges = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    fetchGroupData()
  }


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
            <Typography variant="h5">Testing Groups On Production</Typography>
            <Typography sx={{ margin: '0 0 -16px 0' }}>What is the name of your Group?*</Typography>
            <FormControl fullWidth sx={{ marginTop: '16px' }}>
              <InputLabel shrink htmlFor="group-name">
                e.g. 'Teachers as Makers'
              </InputLabel>
              <TextField
                id="group-name"
                variant="outlined"
                margin="dense"
                value={title}
                sx={{ margin: '16px 0' }}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <Typography sx={{ margin: '0 0 -16px 0' }}>Add a Description*</Typography>
            <FormControl fullWidth sx={{ marginTop: '16px' }}>
              <InputLabel shrink htmlFor="group-purpose">
                This group's purpose is...
              </InputLabel>
              <TextField
                id="group-purpose"
                variant="outlined"
                margin="dense"
                multiline
                rows={4}
                value={description}
                sx={{ margin: '16px 0' }}
                onChange={(e) => setDescription(e.target.value)}
              />
            </FormControl>
            <Typography sx={{ margin: '0 0 -16px 0' }}>Group cover image</Typography>
            <Uploader text="Upload file" init={cover} onChange={(newCover) => setCover(newCover)} inputRef={inputRef} dataImage={dataImageRef} />
            <div>
              <Button variant="contained" sx={{ marginRight: '8px', backgroundColor: '#303E48' }} onClick={handleSaveChanges}>
                Save Changes
              </Button>
              <Button onClick={cancelChanges} variant="outlined">Cancel</Button>
            </div>
          </div>
        )}
        {n === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Typography variant="h5">Duplicate Group</Typography>
            <Typography sx={{ margin: '0 0 -16px 0' }}>What is the name of your Group?*</Typography>
            <FormControl fullWidth sx={{ marginTop: '16px' }}>
              <InputLabel shrink htmlFor="group-name-duplicate">
                e.g. 'Teachers as Makers'
              </InputLabel>
              <TextField
                id="group-name-duplicate"
                variant="outlined"
                margin="dense"
                defaultValue={duplicateTitle}
                sx={{ margin: '16px 0' }}
                onChange={(e) => setDuplicateTitle(e.target.value)}
              />
            </FormControl>
            <Typography sx={{ margin: '0 0 -16px 0' }}>Add a Description*</Typography>
            <FormControl fullWidth sx={{ marginTop: '16px' }}>
              <InputLabel shrink htmlFor="group-purpose-duplicate">
                This group's purpose is...
              </InputLabel>
              <TextField
                id="group-purpose-duplicate"
                variant="outlined"
                margin="dense"
                multiline
                rows={4}
                sx={{ margin: '16px 0' }}
                defaultValue={duplicateDescription}
                onChange={(e) => setDuplicateDescription(e.target.value)}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={duplicateFolders}
                  onChange={(e) => setDuplicateFolders(e.target.checked)}
                />
              }
              label="Duplicate Folders"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={duplicateMembers}
                  onChange={(e) => setDuplicateMembers(e.target.checked)}
                />
              }
              label="Duplicate Members"
            />
            <Button
              variant="contained"
              sx={{ backgroundColor: '#303E48' }}
              onClick={handleDuplicateGroup}
            >
              Create New Group
            </Button>
          </div>
        )}
        {n === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Typography variant="h5">Deleting this group means:</Typography>
            <ul style={{ listStyleType: 'disc' }}>
              <li>All folders and sub-folders will be deleted.</li>
              <li>All cases will no longer be saved to folders.</li>
              <li>All group information will be deleted.</li>
              <li>All membership information will be deleted.</li>
              <li>All notes shared with this group will no longer be visible to group members.</li>
            </ul>
            <b>Are you sure you want to delete this group?</b>
            <div>
              <Button
                variant="contained"
                sx={{ marginRight: '8px', backgroundColor: '#303E48' }}
                onClick={handleDeleteGroup}
              >
                Yes, Delete this Group
              </Button>
              <Button onClick={fetchGroupData} variant="outlined">No, Cancel</Button>
            </div>
          </div>
        )}
      </Grid>
    </Grid>
  );
}

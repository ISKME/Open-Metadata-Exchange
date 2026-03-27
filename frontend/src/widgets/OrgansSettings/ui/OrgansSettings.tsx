/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Uploader } from 'components/uploader';
import cls from './OrgansSettings.module.scss';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const style = {
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
};

export function OrgansSettings({ id: propsId }) {
  const [searchParams] = useSearchParams();
  const urlId = searchParams.get('id');
  const id = urlId ?? propsId;

  const [title, setTitle] = useState('');
  const [edit, setEdit] = useState(false);
  const [cover, setCover] = useState('');
  const [groupCover, setGroupCover] = useState('');
  const [image, setImage] = useState(null);
  const [groupImage, setGroupImage] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios('/api/organizations/v1/organizations/' + id).then(({ data }) => {
      const { name, cover, group_cover } = data;
      setTitle(name);
      setCover(cover);
      setGroupCover(group_cover);
    });
  }, [id]);

  function handleSave() {
    if (!confirm('Are you sure you want to save changes?')) return;
    const formData = new FormData();
    formData.append('name', title);
    if (image) formData.append('cover', image);
    if (groupImage) formData.append('group_cover', groupImage);

    axios.get('/api/csrf-token').then(({ data }) => {
      const headers = {
        'Content-Type': 'multipart/form-data',
        'X-Csrftoken': data.token,
      };
      axios.put('/api/organizations/v1/organizations/' + id, formData, { headers }).then(console.log);
      alert('Changes saved!');
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {edit && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <TextField
            label="Title"
            variant="outlined"
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
          <SaveIcon style={{ cursor: 'pointer' }} onClick={() => setEdit(false)} />
        </div>
      )}
      {!edit && (
        <Typography component="div" variant="h3">
          {title}
          <EditIcon style={{ cursor: 'pointer', marginLeft: '24px' }} onClick={() => setEdit(true)} />
        </Typography>
      )}
      <Typography component="div" variant="h5">
        Cover:
      </Typography>
      <Typography>
        Upload a .PNG file. Recommended size is 395x130px.
      </Typography>
      <Uploader
        text="Upload file"
        init={cover}
        sx={style}
        onChange={setImage}
      />
      <Typography component="div" variant="h5">
        Group cover:
      </Typography>
      <Typography>
        Upload a .PNG file. Recommended size is 165x165px.
      </Typography>
      <Uploader
        text="Upload file"
        init={groupCover}
        sx={style}
        onChange={setGroupImage}
      />
      <div>
        <Button variant="contained" sx={{ ...style, marginRight: '8px' }} onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

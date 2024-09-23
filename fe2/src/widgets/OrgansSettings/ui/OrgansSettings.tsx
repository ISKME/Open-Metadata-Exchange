/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { Uploader } from 'components/uploader';
import cls from './OrgansSettings.module.scss';

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

export function OrgansSettings() {
  const [title, setTitle] = React.useState('NBPTS');
  const [edit, setEdit] = React.useState(false);
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
      <Uploader text="Upload file" init="https://oercommons.s3.amazonaws.com/media/thumbnails/ac/db/acdbef2bba4218d73b5ccc720a1c3f03.png" sx={style} />
      <Typography component="div" variant="h5">
        Group cover:
      </Typography>
      <Typography>
        Upload a .PNG file. Recommended size is 165x165px.
      </Typography>
      <Uploader text="Upload file" init="https://oercommons.s3.amazonaws.com/media/thumbnails/07/91/0791dc18be9e2fa232ba00ca4666eb27.png" sx={style} />
      <div>
        <Button variant="contained" sx={{ ...style, marginRight: '8px' }}>
          Save Changes
        </Button>
        <Button variant="outlined">
          Cancel
        </Button>
      </div>
    </div>
  );
}

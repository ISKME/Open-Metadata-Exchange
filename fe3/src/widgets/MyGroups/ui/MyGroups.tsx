// @ts-nocheck
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid, Button } from '@mui/material';
import { GroupNew } from 'widgets/GroupNew';
import cls from './MyGroups.module.scss';

const buttonStyle = {
  margin: '48px 10%',
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
const customUrl = 'https://semantic-ui.com/images/wireframe/image.png';

const getCanCreate = () => {
  if (typeof window === 'undefined') return false;
  const a = window.__AUTH__;
  return !!(a && (a.is_staff || a.is_superuser || a.profile?.is_trusted));
};

export function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [create, setCreate] = useState(false);
  const [canCreate] = useState(() => getCanCreate());

  useEffect(() => {
    axios.get('/api/groups/v1/groups/my').then(({ data }) => {
      setGroups((data.results || []).map((item) => ({
        ...item,
        number: item.members,
      })));
    }).catch(error => {
      console.error('Error loading groups:', error);
    });
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <div style={{ backgroundColor: '#efeff0', padding: '15px 10%' }}>
        <h1 style={{ font: '400 24px / 24px "DINPro", sans-serif', color: '#303e48', textTransform: 'capitalize' }}>My Groups</h1>
      </div>

      {create && canCreate && (
        <Grid container spacing={2} sx={{ padding: '0 10%' }}>
          <GroupNew />
        </Grid>
      )}

      {!create && (
        <div>
          {canCreate && (
            <Button sx={buttonStyle} onClick={() => setCreate(true)}>
              Create New Group
            </Button>
          )}
          <Grid container spacing={2} sx={{ padding: '0 10%' }}>
            {groups.map((item, index) => (
              <Grid item md={3} xs={6} key={index}>
                <div className={cls['group-list-item']}>
                  <a href={'/groups/new/' + item.id}>
                    <div className={cls['group-cover']}>
                      <img
                        src={item.cover}
                        width="149"
                        height="149"
                        alt={item.title}
                        onError={({ target }) => { target.src = customUrl; }}
                        style={{ objectFit: 'contain' }}
                      />
                      <span className={cls['group-members-count']}>
                        <span>{item.number}</span>
                      </span>
                    </div>
                    <span className={cls['group-title']}>
                      {item.title}
                    </span>
                  </a>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      )}
    </Box>
  );
}

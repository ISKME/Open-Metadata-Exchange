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
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import cls from './Groups.module.scss';
import { GroupNew } from 'widgets/GroupNew';

const UserIcon = () => <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M843.282963 870.115556c-8.438519-140.515556-104.296296-257.422222-233.908148-297.14963C687.881481 536.272593 742.4 456.533333 742.4 364.088889c0-127.241481-103.158519-230.4-230.4-230.4S281.6 236.847407 281.6 364.088889c0 92.444444 54.518519 172.183704 133.12 208.877037-129.611852 39.727407-225.46963 156.634074-233.908148 297.14963-0.663704 10.903704 7.964444 20.195556 18.962963 20.195556l0 0c9.955556 0 18.299259-7.774815 18.962963-17.73037C227.745185 718.506667 355.65037 596.385185 512 596.385185s284.254815 122.121481 293.357037 276.195556c0.568889 9.955556 8.912593 17.73037 18.962963 17.73037C835.318519 890.311111 843.946667 881.019259 843.282963 870.115556zM319.525926 364.088889c0-106.287407 86.186667-192.474074 192.474074-192.474074s192.474074 86.186667 192.474074 192.474074c0 106.287407-86.186667 192.474074-192.474074 192.474074S319.525926 470.376296 319.525926 364.088889z" /></svg>;

const customUrl = 'https://semantic-ui.com/images/wireframe/image.png';

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
}

const getCanCreate = (): boolean => {
  if (typeof window === 'undefined') return false;
  const a = (window as any).__AUTH__;
  return !!(a && (a.is_staff || a.is_superuser || a.profile?.is_trusted));
};

export function Groups() {
  const [create, setCreate] = React.useState(false)
  const [value, setValue] = React.useState(0);
  const [data, setData] = React.useState([]);
  const [canCreate] = React.useState<boolean>(() => getCanCreate());

  React.useEffect(() => {
    axios.get('/api/groups/v1/groups.json').then(({ data }) => {
      setData((data.results || []).map((item: any) => ({
        ...item,
        number: item.members.length,
        cover: item.cover || customUrl,
      })));
    });
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <div style={{ backgroundColor: '#efeff0', padding: '15px 10%' }}>
        <h1 style={{ font: '400 24px / 24px "DINPro", sans-serif', color: '#303e48', textTransform: 'capitalize' }}>Groups</h1>
      </div>
      {create && <Grid container spacing={2} sx={{ padding: '0 10%' }}>
        <GroupNew />
      </Grid>}
      {!create && (
        <div>
          {canCreate && (
            <Button sx={buttonStyle} onClick={() => setCreate(true)}>
              Create New Group
            </Button>
          )}
          <Grid container spacing={2} sx={{ padding: '0 10%' }}>
            {data.map((item, index) => (
              <Grid item md={3} xs={6} key={index}>
              <div className={cls['group-list-item']}>
                <a href={'/groups/new/' + item.id}>
                  <div className={cls['group-cover']}>
                    <img src={item.cover} width="149" height="149" alt={item.title} onError={({ target }) => { target.src = customUrl }} />
                    <span className={cls['group-members-count']}>
                      <i className={cls.fa}>
                        <UserIcon />
                      </i>
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
// @ts-nocheck
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Grid } from '@mui/material';
import cls from './MyHubs.module.scss';

const customUrl = 'https://semantic-ui.com/images/wireframe/image.png';

export function MyHubs() {
  const [hubs, setHubs] = useState([]);
  const [create, setCreate] = useState(false)

  useEffect(() => {
    axios.get('/api/hubs/v1/my').then(({ data }) => {
      setHubs(data.results.map((item) => ({
        ...item,
        number: item.members,
      })));
    }).catch(error => {
      console.error('Error loading hubs:', error);
    });
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <div style={{ backgroundColor: '#efeff0', padding: '15px 10%' }}>
        <h1 style={{ font: '400 24px / 24px "DINPro", sans-serif', color: '#303e48', textTransform: 'capitalize' }}>My Hubs</h1>
      </div>
      <Grid container spacing={2} sx={{ padding: '0 10%' }}>
        {hubs.map((item, index) => (
          <Grid item md={3} xs={6} key={index}>
            <div className={cls['hub-list-item']}>
              <a href={'/hubs/' + item.slug}>
                <div className={cls['hub-cover']}>
                <img 
                  src={item.logo}
                  width="149"
                  height="149"
                  alt={item.title}
                  onError={({ target }) => { target.src = customUrl }}
                  style={{objectFit: "contain"}}
                />
                </div>
                <span className={cls['hub-title']}>
                  {item.title}
                </span>
              </a>
            </div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

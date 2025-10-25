/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { CasesList } from 'widgets/CasesList';
import cls from './CasesSets.module.scss';
import { Button } from '@mui/material';

export function CasesSets() {
  const [value, setValue] = React.useState('one');

  return (
    <Grid container spacing={2} sx={{ padding: '24px 10%' }}>
      <Grid item xs={4} sx={{ paddingRight: '32px' }}>
        {[
          ['ABP1', 86],
          ['ATLAS Limited Library - Nov 2021', 329],
          ['ATLAS Lite', 326],
          ['ATLAS Trial', 403],
          ["Michelle's Set", 2],
          ['National Board Candidates', 4],
          ['NWEA', 1],
          ['PBS Science Courses', 40],
          ['Poetry Test Set', 13],
          ['Test API', 4],
        ].map((child, j) => (
          <Typography sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer', borderBottom: '1px solid #e8e8e8' }} key={j}>
            {child[0]} ({child[1]})
          </Typography>
        ))}
      </Grid>
      <Grid item xs={8}>
        <Box sx={{ width: '100%', marginBottom: '24px' }}>
          <Tabs
            value={value}
            onChange={(_event, newValue) => setValue(newValue)}
            aria-label="wrapped label tabs example"
            sx={{ minHeight: '36px' }}
          >
            <Tab value="one" label="All Cases" sx={{ padding: '0', minHeight: '36px' }} />
            <Tab value="two" label="Organizations" sx={{ padding: '0 8px', minHeight: '36px' }} />
          </Tabs>
        </Box>
        {/* {value === 'one' && <CasesList title="ABP1 (86)" col />} */}
        {value === 'two' && (
          <div>
            <div style={{ padding: '5px 10px', borderRadius: '3px', backgroundColor: '#efeff0', marginBottom: '30px' }}>
              <Button sx={{
                margin: '8px',
                padding: '6px 12px',
                borderColor: '#303e48',
                backgroundColor: '#303e48',
                color: '#fad000',
                fontFamily: '"DINPro", sans-serif',
                boxShadow: '0 3px 0 #202c34',
                textTransform: 'capitalize',
                '&:hover': {
                  borderColor: '#8f9bae',
                  backgroundColor: '#8f9bae',
                  color: '#ffffff',
                  boxShadow: '0 3px 0 #7c8ba2',
                },
              }}
              href="/admin"
              >
                Modify Access In Admin
              </Button>
            </div>
            <div className={cls['set-organization']}>
              <h3 className={cls['set-organization-title']}>NBPTS</h3>
              <p>
                Number of users:
                <strong>115</strong>
                <br />
                Date of Set Access:
                <strong>06/13/2022</strong>
              </p>
            </div>
          </div>
        )}
      </Grid>
    </Grid>
  );
}

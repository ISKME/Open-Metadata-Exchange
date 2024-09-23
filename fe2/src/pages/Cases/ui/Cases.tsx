/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
// import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { CasesAll } from 'widgets/CasesAll';
// import { CasesSets } from 'widgets/CasesSets';
import cls from './Cases.module.scss';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fetchCases } from '../model/services/ActionCreators';

// function CloseSquare(props: SvgIconProps) { return <SvgIcon {...props}><path d="" /></SvgIcon> }

const globalStyles = {
  '.MuiTabs-root': {
    // paddingLeft: '10%',
    borderBottom: '1px solid rgb(239, 239, 240)',
  },
  '.MuiTabs-flexContainer': {
    paddingTop: '3px',
  },
  '.MuiButtonBase-root.MuiTab-root.Mui-selected': {
    backgroundColor: '#303e48',
    borderColor: '#303e48',
    boxShadow: 'none',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  '.MuiButtonBase-root.MuiTab-root': {
    borderColor: '#efeff0',
    backgroundColor: '#ffffff',
    boxShadow: 'none',
    color: '#56788f',
    borderRadius: '4px 4px 0 0',
    border: '1px solid rgb(239, 239, 240)',
    borderBottom: 'none',
    textTransform: 'capitalize',
  },
  '.MuiTabs-indicator': {
    display: 'none',
  },
};

export function Cases() {
  const [value, setValue] = React.useState('one');
  const dispatch = useAppDispatch();

  // React.useEffect(() => {
  //   dispatch(fetchCases());
  // }, [dispatch]);

  return (
    <Box sx={{ width: '100%', paddingBottom: '64px' }}>
      <div className="page-description">
        <div style={{ padding: '0 10%' }}>
          ATLAS is a unique, searchable online library of authentic video cases showing National Board Certified
          Teachers at work in the classroom. Learn more about
          <a href="https://www.nbpts.org/national-board-certification/" target="_blank">
            National Board Certification
            <span className="sr-only">Opens in a new window</span>
          </a>.
        </div>
      </div>
      <GlobalStyles styles={globalStyles} />
      <Box sx={{ width: '100%', paddingLeft: '10%', paddingTop: '24px' }}>
        <Tabs
          value={value}
          onChange={(_event, newValue) => setValue(newValue)}
          aria-label="wrapped label tabs example"
        >
          <Tab value="one" label="All Cases" />
          {/* <Tab value="two" label="Case Sets" /> */}
        </Tabs>
      </Box>
      {value === 'one' && <CasesAll />}
      {/* {value === 'two' && <CasesSets />} */}
    </Box>
  );
}

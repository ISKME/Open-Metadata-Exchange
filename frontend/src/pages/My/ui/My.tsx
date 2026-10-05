/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Tabs, Tab, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import cls from './My.module.scss';
import axios from 'axios';

export function My() {
  const [tabs, setTabs] = useState(['items', 'groups', 'hubs', 'account'])
  const find = (address, list = tabs) => {
    const index = list.findIndex((tab) => address.includes(`my/new/${tab}`))
    return index > 0 ? index : 0
  }

  const location = useLocation()
  const navigate = useNavigate()
  const [tab, setTab] = useState(find(location.pathname))

  useEffect(async () => {
    const { data } = await axios.get('/api/hubs/v1/my/')
    if (data.count === 0) {
      const withoutHubs = ['items', 'groups', 'account']
      setTabs(withoutHubs)
      setTab(find(location.pathname, withoutHubs))
    }
  }, [])

  useEffect(() => {
    const target = `/my/new/${tabs[tab]}`;
    if (tab >= 0 && !location.pathname.startsWith(target)) navigate(target);
  }, [tab]);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, padding: '0 10%', borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange}>
          {tabs.map((tab, i) => (
            <Tab key={i} label={`MY ${tab.toUpperCase()}`} id={`tab-${i}`} />
          ))}
        </Tabs>
      </Box>
      <Outlet />
    </Box>
  );
}

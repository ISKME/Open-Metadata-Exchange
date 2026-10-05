// @ts-ignore
import { Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import cls from './Library.module.scss';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import ShareIcon from '@mui/icons-material/Share';

interface LibraryProps {
  className?: string;
}

const mainTabs = [
  { label: 'Subscribed Content', icon: <CollectionsBookmarkIcon /> },
  { label: 'Shared Content', icon: <ShareIcon /> },
];

const subTabs = [
  ['Search', 'Preferences', 'Updates'],
  ['Search', 'Preferences', 'Updates'],
];

export function Library({ className }: LibraryProps) {
  const [mainTab, setMainTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Navigation logic for tabs
  const handleMainTabChange = (newValue) => {
    setMainTab(newValue);
    setSubTab(0);
    if (newValue === 0) {
      navigate('/imls/site-collections/subscribed-collections');
    } else if (newValue === 1) {
      navigate('/imls/site-collections/shared-collections');
    }
  };

  const handleSubTabChange = (newValue) => {
    setSubTab(newValue);
    if (mainTab === 0) {
      if (newValue === 0) navigate('/imls/site-collections/subscribed-collections');
      else if (newValue === 1) navigate('/imls/site-collections/subscribed-preferences');
      else if (newValue === 2) navigate('/imls/site-collections/subscribed-updates');
    } else if (mainTab === 1) {
      if (newValue === 0) navigate('/imls/site-collections/shared-collections');
      else if (newValue === 1) navigate('/imls/site-collections/shared-preferences');
      else if (newValue === 2) navigate('/imls/site-collections/shared-updates');
    }
  };

  return (
    <Box className={cls.library_wrapper}>
      <Box id="my_library" className={cls.library}>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
          {mainTabs.map((tab, idx) => (
            <Button
              key={tab.label}
              startIcon={tab.icon}
              variant={mainTab === idx ? 'contained' : 'outlined'}
              size="large"
              sx={{ borderRadius: idx == 0 ? '8px 0 0 8px !important' : '0 8px 8px 0 !important' }}
              onClick={() => handleMainTabChange(idx)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          {subTabs[mainTab].map((label, idx) => (
            <Button
              key={label || idx}
              variant={subTab === idx ? 'contained' : 'outlined'}
              sx={{
                borderRadius: idx == 0 ? '8px 0 0 8px !important' : (idx == 1 ? '0 !important' : '0 8px 8px 0 !important'),
                borderLeft: idx === 1 ? 'none': '',
                borderRight: idx === 1 ? 'none': '',
                '&:hover': {
                  borderLeft: idx === 1 ? 'none': '',
                  borderRight: idx === 1 ? 'none': '',
                }
              }}
              onClick={() => handleSubTabChange(idx)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Box className={cls.outlet}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

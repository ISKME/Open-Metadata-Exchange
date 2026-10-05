// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import api from './api/axios';
import { Outlet, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container, Link, CssBaseline, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useTheme, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import cls from './styles.module.scss';
import Loader from './icons/Loader';
import { Button } from 'components/Dashboard';
import Settings from './widgets/Settings';

if (document.title === 'IMLS-React') document.title = 'The Ark: A Digital Public Goods Library'

function addFont(font) {
  const head = document.querySelector('head');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(font);
  head.appendChild(link);
  return () => head.removeChild(link);
}

function isColorString(str) {
  const s = new Option().style;
  s.color = str;
  return !!s.color // s.color === str;
}

function HeaderLinks({ fontFamily, fontSizeText }) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const fontStyleLocal = { fontFamily, fontSize: fontSizeText, color: 'ark.headerLinkColor' };

  return (
    <>
      <Box sx={{ display: { sm: 'none', xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        <Link href="/ark/browse" className={cls.navLink} color="ark.footerLinkColor" underline="hover" sx={{ ...fontStyleLocal, mr: 1 }}>
          All Collections
        </Link>
        <Link href="/hubs/" className={cls.navLink} color="ark.footerLinkColor" underline="hover" sx={{ ...fontStyleLocal, mr: 1 }}>
          Hubs
        </Link>
        <Link component={NavLink} to="about" className={cls.navLink} color="ark.footerLinkColor" underline="hover" sx={fontStyleLocal}>
          About Us
        </Link>
      </Box>

      <IconButton color="inherit" edge="end" sx={{ display: { sm: 'inline-flex', md: 'none' } }} onClick={() => setDrawerOpen(true)} aria-label="open menu">
        <MenuIcon />
      </IconButton>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250, height: '100%', bgcolor: 'ark.contentBackgroundColor' }} role="presentation" onClick={() => setDrawerOpen(false)} onKeyDown={() => setDrawerOpen(false)}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/ark/browse">
                <ListItemText primary="All Collections" primaryTypographyProps={{ sx: fontStyleLocal }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component="a" href="/hubs/">
                <ListItemText primary="Hubs" primaryTypographyProps={{ sx: fontStyleLocal }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={NavLink} to="/ark/about">
                <ListItemText primary="About Us" primaryTypographyProps={{ sx: fontStyleLocal }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );

}

export default function ArkLayout() {
  const [loading, setLoading] = useState(false);
  const [palette, setPalette] = useState({
    contentBackgroundColor: '#1E1E1E',
    headerNavbarBackgroundColor: '#1E1E1E',
    headerTextColor: '#ffffff',
    headerLinkColor: '#C2C2C2',
    footerColor: '#1E1E1E',
    footerTextColor: '#ffffff',
    footerLinkColor: '#C2C2C2',
    cardBackgroundColor: '#ffffff',
    innerCardsBackgroundColor: '#F7F7F7',
    innerCardsTextColor: '#000000',
    mainFontColor: '#000000',
    cardLinkTextColor: '#646464',
    inputsBackgroundColor: '#454141',
    inputsTextColor: '#ffffff',
  });
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [fontSizeText, setFontSizeText] = useState('16px'); // default
  const [primary, setPrimary] = useState('#000000'); // default primary color

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `.page-wrapper{width:100% !important}`;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, [])

  useEffect(() => {
    (async () => {
      const { data } = await api.get('/api/theming/all/');
      if (!data.themes?.length) return;
      let selectedTheme = data.themes.find((item) => item.is_default);
      if (!selectedTheme) return;
      const themeRes = await api.get(`/api/theming/${selectedTheme.code}.css`);
      const variables = themeRes?.data?.variables;
      if (!variables) return;
      const newPalette = {};
      for (const [key, value] of Object.entries(variables)) {
        if (!isColorString(value)) continue;
        // if (key.startsWith('--')) key = key.slice(2); // remove leading --
        const camelKey = key.replace(/-([a-z])/g, (match, char) => char.toUpperCase());
        newPalette[camelKey] = value;
      }
      setPalette((prev) => ({ ...prev, ...newPalette }));
      if (variables['font-family-main']) {
        setFontFamily(variables['font-family-main']);
        addFont(variables['font-family-main'])
      }
      if (variables['font-size-text']) setFontSizeText(variables['font-size-text']);
      if (variables['button-primary-color']) setPrimary(variables['button-primary-color']);
    })();
  }, []);

  useEffect(() => addFont('IBM Plex Mono'), [])

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        primary: {
          main: primary,
        },
        ark: palette,
      },
      typography: {
        fontFamily,
        fontSize: parseInt(fontSizeText, 10), // MUI expects a number for base fontSize
      },
      arkSizes: {
        fontSizeText,
      },
    });
  }, [palette, fontFamily, fontSizeText]);

  const paletteChange = (key, val) => {
    if (key === 'buttonPrimaryColor') setPrimary(val)
    setPalette(prevPalette => ({ ...prevPalette, [key]: val }))
  }
  const fontChange = (idx, val) => {
    addFont(val)
    setFontFamily(val)
  }

  if (loading) return (
    <Box sx={{ height: '100vh', bgcolor: 'ark.contentBackgroundColor', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Loader color="white" />
    </Box>
  );

  const fontStyle = { fontFamily: theme.typography.fontFamily }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Settings
        init={palette}
        onChange={paletteChange}
        fonts={[fontFamily]}
        onFontChange={fontChange}
        sizes={{ fontSizeText }}
        onSizeChange={(key, val) => setFontSizeText(val)}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'ark.contentBackgroundColor', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <AppBar position="static" sx={{ bgcolor: 'ark.headerNavbarBackgroundColor', boxShadow: 'none' }}>
          <Toolbar className={cls.navToolbar}>
            <Container className={cls.navContainer}>
              <Link component={NavLink} to="/ark" className={cls.navTitle} color="ark.footerTextColor" underline="none">
                The Ark: A Digital Public Goods Library
              </Link>
              <HeaderLinks fontFamily={fontFamily} fontSizeText={fontSizeText} />
            </Container>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flex: 1, px: 4, bgcolor: 'ark.contentBackgroundColor' }}>
          <Container sx={{ bgcolor: 'ark.cardBackgroundColor', borderRadius: 2, p: 4, minHeight: 400 }}>
            <Outlet />
          </Container>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: '120px' }}>
            <Link component={NavLink} to="about" className={cls.footerLink} color="ark.footerLinkColor" underline="hover" sx={{ fontFamily, fontSize: fontSizeText }}>
              About
            </Link>
            <Link href="mailto:openforeducation@gmail.com" className={cls.footerLink} color="ark.footerLinkColor" underline="hover" style={fontStyle}>
              Contact
            </Link>
          </Box>
        </Box>

        <Box component="footer" sx={{ bgcolor: 'ark.footerColor', color: 'ark.footerTextColor', py: 2, mt: 2, textAlign: 'center' }}>
          <Container>
            <Typography variant="body2" className={cls.copyRight} color="ark.footerTextColor">
              Copyright notice: Please see the terms of use for individual materials found on The Ark: A Digital Public Goods Library.
            </Typography>
            <Typography
              variant="body3"
              className={cls.footerText}
              color="ark.footerTextColor"
            >
              Except where otherwise noted, content on this site is licensed under a Creative Commons Attribution-ShareAlike 4.0 Licence
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

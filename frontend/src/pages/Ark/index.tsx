// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import api from './api/axios';
import { Outlet, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container, Link, CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import cls from './styles.module.scss';
import Loader from './icons/Loader';
import { Button } from 'components/Dashboard';
import Settings from './widgets/Settings';

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
            <Container maxWidth="lg" className={cls.navContainer}>
              <Link component={NavLink} to="/ark" className={cls.navTitle} color="ark.footerTextColor" underline="none">
                The Digital
                Public Goods Library
              </Link>
              <section>
                <Link href="/hubs/" className={cls.navLink} color="ark.footerLinkColor" underline="hover" sx={{ fontFamily, fontSize: fontSizeText, marginRight: '8px' }}>
                  Hubs
                </Link>
                <Link component={NavLink} to="about" className={cls.navLink} color="ark.footerLinkColor" underline="hover" sx={{ fontFamily, fontSize: fontSizeText }}>
                  About Us
                </Link>
              </section>
            </Container>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Box sx={{ flex: 1, px: 4, bgcolor: 'ark.contentBackgroundColor' }}>
          <Container maxWidth="lg" sx={{ bgcolor: 'ark.cardBackgroundColor', borderRadius: 2, p: 4, minHeight: 400 }}>
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
          <Container maxWidth="lg">
            <Typography variant="body2" className={cls.copyRight} color="ark.footerTextColor">
              @ 2025 The Digital Public Goods Library
            </Typography>
            <Typography
              variant="body3"
              className={cls.footerText}
              color="ark.footerTextColor"
              sx={{ fontFamily, fontSize: fontSizeText }}
            >
              Except where otherwise noted, content on this site is licensed under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 Licence
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

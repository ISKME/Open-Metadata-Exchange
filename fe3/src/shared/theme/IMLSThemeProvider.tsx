// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { createTheme, ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import { globalStyles } from './styles';
import Settings from 'widgets/Settings';

const DEFAULT_PALETTE = {
  contentBackgroundColor: '#ffffff',
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
  inputsBackgroundColor: '#ffffff',
  inputsTextColor: '#000000',
  main: '#000000',
};

function addFont(fontName?: string) {
  if (!fontName) return () => {};
  const head = document.querySelector('head');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(fontName);
  head?.appendChild(link);
  return () => head?.removeChild(link);
}

export default function IMLSThemeProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [fontFamily, setFontFamily] = useState('Inter, Roboto, sans-serif');
  const [fontSizeText, setFontSizeText] = useState('16px');
  const [primary, setPrimary] = useState(DEFAULT_PALETTE.main);

  const paletteChange = (key, val) => {
    setPalette(prevPalette => ({ ...prevPalette, [key]: val }))
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get('/api/theming/all/');
        const defaultTheme = data?.themes?.find((t) => t.is_default) || data?.themes?.[0] || null;
        if (!defaultTheme) {
          setLoading(false);
          return;
        }
        const cssResp = await axios.get(`/api/theming/${defaultTheme.code}.css`);
        const variables = cssResp?.data?.variables || {};
        const newPalette = { ...DEFAULT_PALETTE };
        newPalette.contentBackgroundColor = variables['content-background-color'] || DEFAULT_PALETTE.contentBackgroundColor;
        newPalette.headerNavbarBackgroundColor = variables['header-navbar-background-color'] || DEFAULT_PALETTE.headerNavbarBackgroundColor;
        newPalette.headerTextColor = variables['header-text-color'] || DEFAULT_PALETTE.headerTextColor;
        newPalette.headerLinkColor = variables['header-link-color'] || DEFAULT_PALETTE.headerLinkColor;
        newPalette.footerColor = variables['footer-color'] || DEFAULT_PALETTE.footerColor;
        newPalette.footerTextColor = variables['footer-text-color'] || DEFAULT_PALETTE.footerTextColor;
        newPalette.footerLinkColor = variables['footer-link-color'] || DEFAULT_PALETTE.footerLinkColor;
        newPalette.cardBackgroundColor = variables['card-background-color'] || DEFAULT_PALETTE.cardBackgroundColor;
        newPalette.innerCardsBackgroundColor = variables['inner-cards-background-color'] || DEFAULT_PALETTE.innerCardsBackgroundColor;
        newPalette.innerCardsTextColor = variables['inner-cards-text-color'] || DEFAULT_PALETTE.innerCardsTextColor;
        newPalette.inputsBackgroundColor = variables['inputs-background-color'] || DEFAULT_PALETTE.inputsBackgroundColor;
        newPalette.inputsTextColor = variables['inputs-text-color'] || DEFAULT_PALETTE.inputsTextColor;
        newPalette.main = variables['primary-main-color'] || variables['button-primary-color'] || DEFAULT_PALETTE.main;

        if (!mounted) return;
        setPalette(newPalette);

        if (variables['font-family-main']) {
          setFontFamily(variables['font-family-main']);
          addFont(variables['font-family-main']);
        }
        if (variables['font-size-text']) setFontSizeText(variables['font-size-text']);
        if (variables['button-primary-color']) setPrimary(variables['button-primary-color']);
      } catch (err) {
        console.warn('Theme load failed, using defaults', err);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: palette,
          // secondary: {
          //   main: '#555555', // Darker blue for some text
          // },
          // background: {
          //   default: '#f8f8f8', // Light grey background
          // },
          // text: {
          //     primary: '#333333', // Dark text
          //     secondary: '#4f4f4f', // Lighter grey for secondary text
          // }
        },
        typography: {
          fontFamily,
          // fontSize: parseInt(fontSizeText, 10) || 16,
          // h1: {
          //   fontSize: '2.5rem',
          //   fontWeight: 600,
          //   lineHeight: 1.2,
          // },
        },
        // imlsSizes: { fontSizeText }, // i get error
      }),
    [palette, fontFamily, fontSizeText, primary]
  );

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading</div>;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={globalStyles} />
      <CssBaseline />
      <Settings
        init={palette}
        onChange={paletteChange}
      />
      {children}
    </ThemeProvider>
  );
}
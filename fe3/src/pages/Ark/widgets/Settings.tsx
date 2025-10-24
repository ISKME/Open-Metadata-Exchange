// @ts-nocheck
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import cls from './Settings.module.scss';
import Loader from './icons/Loader';
import { Button } from 'components/Dashboard';

export default function ArkSettings({ init, onChange, fonts = [], onFontChange = () => {}, sizes = {}, onSizeChange = () => {} }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleHotkey = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === 'y') {
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [setOpen]);

  return (
    <div className={cls.settings} style={{ display: open ? 'block' : 'none' }}>
      {/* Color inputs */}
      {Object.keys(init).map((key) => (
        <div className={cls.item} key={key}>
          <span>{key.replace(/([A-Z])/g, ' $1')}</span>
          <input type="color" value={init[key]} onChange={({ target }) => onChange(key, target.value)} />
        </div>
      ))}
      {/* Font inputs */}
      {fonts.map((font, idx) => {
        const [inputValue, setInputValue] = useState(font);

        useEffect(() => {
          setInputValue(font);
        }, [font]);

        const handleKeyDown = (e) => {
          if (e.key === 'Enter') {
            onFontChange(idx, inputValue);
          }
        };

        return (
          <div className={cls.item} key={font}>
            <span>Font {idx + 1}</span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: 180 }}
            />
          </div>
        );
      })}
      {/* Size inputs */}
      {sizes && Object.keys(sizes).map((key) => {
        const [inputValue, setInputValue] = useState(sizes[key]);

        useEffect(() => {
          setInputValue(sizes[key]);
        }, [sizes[key]]);

        const handleKeyDown = (e) => {
          if (e.key === 'Enter') {
            onSizeChange(key, inputValue);
          }
        };

        return (
          <div className={cls.item} key={key}>
            <span>{key.replace(/([A-Z])/g, ' $1')}</span>
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ width: 100 }}
            />
          </div>
        );
      })}
    </div>
  );
}

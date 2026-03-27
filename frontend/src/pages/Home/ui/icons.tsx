// import React from 'react';
import { SvgIcon } from '@mui/material';
// import { useTheme } from '@mui/material/styles';

export function ShareIcon(props) {
  return (
    <SvgIcon viewBox="0 0 52 52" color="primary" sx={{ width: 52, height: 52 }} {...props}>
      <rect width="52" height="52" rx="8" fill="inherit" />
      <circle cx="33.5" cy="16.5" r="4.5" fill="white" stroke="currentColor" strokeWidth="2" />
      <circle cx="33.5" cy="35.5" r="4.5" fill="white" stroke="currentColor" strokeWidth="2" />
      <circle cx="16.5" cy="26.5" r="4.5" fill="white" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

export function ExploreSyncIcon(props) {
  return (
    <SvgIcon viewBox="0 0 52 52" color="primary" sx={{ width: 52, height: 52 }} {...props}>
      <rect width="52" height="52" rx="8" fill="inherit" />
      <path d="M23.45 15.82C29.32 14.24 35.36 17.73 36.93 23.6" stroke="white" strokeWidth="2" />
      <path d="M28.55 37.14C22.68 38.71 16.64 35.22 15.07 29.35" stroke="white" strokeWidth="2" />
      <path d="M25.6 34.09L29.27 37.28L26.08 40.95" stroke="white" strokeWidth="2" />
    </SvgIcon>
  );
}

export function StayUpdatedIcon(props) {
  return (
    <SvgIcon viewBox="0 0 52 52" color="primary" sx={{ width: 52, height: 52 }} {...props}>
      <rect width="52" height="52" rx="8" fill="inherit" />
      <circle cx="26" cy="26" r="14" fill="white" stroke="currentColor" strokeWidth="2" />
      <path d="M20 26.5L24 30.5L33.5 21" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

export function SetPreferencesIcon(props) {
  return (
    <SvgIcon viewBox="0 0 52 52" color="primary" sx={{ width: 52, height: 52 }} {...props}>
      <rect width="52" height="52" rx="8" fill="inherit" />
      <path d="M40 27.88V24.11C38.07 23.43 36.86 23.24 36.24 21.76C35.63 20.28 36.36 19.27 37.23 17.43" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="26" cy="26" r="4.67" fill="white" stroke="currentColor" strokeWidth="2" />
    </SvgIcon>
  );
}

export function ManageIcon(props) {
  return (
    <SvgIcon viewBox="0 0 20 20" sx={{ width: 20, height: 20 }} {...props}>
      <path d="M18.5 9.5V16.5C18.5 17.6 17.6 18.5 16.5 18.5H3C1.9 18.5 1 17.6 1 16.5V3C1 1.9 1.9 1 3 1H10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 10.5L18 1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </SvgIcon>
  );
}

export function MangnifyIcon(props) {
  return (
    <SvgIcon viewBox="0 0 20 22" sx={{ width: 20, height: 22 }} {...props}>
      <circle cx="10" cy="10" r="9.25" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M15.5 17.5L19 21" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </SvgIcon>
  );
}

export function LightIcon(props) {
  return (
    <SvgIcon viewBox="0 0 19 26" sx={{ width: 19, height: 26 }} {...props}>
      {/* simplified single-color bell/lamp glyph */}
      <path d="M9.5 0C14.75 0 19 4.25 19 9.5C19 12.7 17.42 15.52 15 17.24V21H4V17.24C1.58 15.52 0 12.7 0 9.5C0 4.25 4.25 0 9.5 0Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 24.5H15" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </SvgIcon>
  );
}

export function BellIcon(props) {
  return (
    <SvgIcon viewBox="0 0 21 23" sx={{ width: 21, height: 23 }} {...props}>
      <path d="M10.5 0C14.09 0 17 2.91 17 6.5V13L19.96 17.45C20.41 18.11 19.93 18.99 19.13 19H1.87C1.07 18.999 0.59 18.109 1.03 17.445L3.999 13V6.5C3.999 2.91 6.91 0 10.5 0Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="10.5" cy="21.5" r="1.5" fill="inherit" />
    </SvgIcon>
  );
}

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const NAV_ROOT_ID = 'imls-nav-root';

// Container placed as the FIRST child of <body>, so the skip link and the navigation
// come before the page content in the DOM (keyboard and screen reader order).
// `display: contents` keeps its children as flex items of <body>, so the layout is unchanged.
function getNavRoot(): HTMLElement {
  let navRoot = document.getElementById(NAV_ROOT_ID);
  if (!navRoot) {
    navRoot = document.createElement('div');
    navRoot.id = NAV_ROOT_ID;
    navRoot.style.display = 'contents';
    document.body.prepend(navRoot);
  }
  return navRoot;
}

export default function useAsideNav() {
  const onImls = window.location.href.includes('/imls');

  // Always called, so the hooks run in the same order on every render
  useEffect(() => {
    if (!onImls) return undefined;
    const originalDisplay = document.body.style.display;
    document.body.style.display = 'flex';
    const header: any = document.querySelector('.global-wrapper');
    if (header) header.style.width = '100%';
    return () => {
      document.body.style.display = originalDisplay;
      if (header) header.style.width = 'unset';
    };
  }, []);

  if (!onImls) return undefined;
  return (children) => createPortal(children, getNavRoot());
}

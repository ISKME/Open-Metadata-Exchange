import { useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  return (children) => createPortal(children, document.body);
}

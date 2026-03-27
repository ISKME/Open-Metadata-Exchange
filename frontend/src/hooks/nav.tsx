import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function useAsideNav() {
  if (window.location.href.includes('/imls')) {
    useEffect(() => {
      const originalDisplay = document.body.style.display;
      document.body.style.display = 'flex';
      const header: any = document.querySelector('.global-wrapper')
      if (header) header.style.width = '100%'
      return () => {
        document.body.style.display = originalDisplay;
        if (header) header.style.width = 'unset'
      };
    }, []);
    return (children) => createPortal(children, document.body)
  }
}

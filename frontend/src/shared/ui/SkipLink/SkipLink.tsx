import React from 'react';

export const MAIN_CONTENT_ID = 'main-content';

// First focusable element on the page: lets keyboard and screen reader users
// jump past the navigation straight to the page content.
export function SkipLink() {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Move focus ourselves instead of using the URL hash, so React Router is not involved.
    event.preventDefault();
    document.getElementById(MAIN_CONTENT_ID)?.focus();
  };

  return (
    <a href={`#${MAIN_CONTENT_ID}`} className="skip-link" onClick={handleClick}>
      Skip to main content
    </a>
  );
}

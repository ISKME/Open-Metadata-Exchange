import React, { Suspense } from 'react';
import './styles/index.scss';
import { classNames } from 'shared/lib/classNames/classNames';
import { AppRouter } from 'app/providers/router';
import { Sidebar } from 'widgets/Sidebar';
import { SkipLink, MAIN_CONTENT_ID } from 'shared/ui/SkipLink/SkipLink';
import useAsideNav from 'hooks/nav';

function App() {
  const renderAsideNav = useAsideNav();
  return (
    <div className={classNames('app', {}, [])}>
      <Suspense fallback="">
        <div className="content-page">
          {window.location.href.includes('/imls') && renderAsideNav(
            <>
              <SkipLink />
              <Sidebar />
            </>,
          )}
          <main id={MAIN_CONTENT_ID} tabIndex={-1} className="main-content">
            <AppRouter />
          </main>
        </div>
      </Suspense>
    </div>
  );
}

export default App;

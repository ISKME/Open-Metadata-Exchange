import React, { Suspense } from 'react';
import './styles/index.scss';
import { classNames } from 'shared/lib/classNames/classNames';
import { AppRouter } from 'app/providers/router';
import { Sidebar } from 'widgets/Sidebar';
import useAsideNav from 'hooks/nav';

function App() {
  const renderAsideNav = useAsideNav();
  return (
    <div className={classNames('app', {}, [])}>
      <Suspense fallback="">
        <div className="content-page">
          {window.location.href.includes('/imls') && renderAsideNav(<Sidebar />)}
          <AppRouter />
        </div>
      </Suspense>
    </div>
  );
}

export default App;

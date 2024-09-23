import React, { Suspense } from 'react';
import './styles/index.scss';
import { classNames } from 'shared/lib/classNames/classNames';
import { AppRouter } from 'app/providers/router';
import { Sidebar } from 'widgets/Sidebar';

function App() {
  return (
    <div className={classNames('app', {}, [])}>
      <Suspense fallback="">
        <div className="content-page">
          {window.location.href.includes('/imls') && <Sidebar />}
          <AppRouter />
        </div>
      </Suspense>
    </div>
  );
}

export default App;

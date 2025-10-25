/* eslint-disable no-undef */
// @ts-nocheck
import { Suspense } from 'react';
import { Route, RouteObject, Routes } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';


const renderRoute = (routes: RouteObject[], parentPath = '') => routes.map((data) => {
  const { path, children, element, index } = data;
  if (index) {
    // Render index route
    return (
      <Route
        key={parentPath + 'root'}
        index={true}
        element={(
          <Suspense fallback={<PageLoader />}>
            <div className="page-wrapper">
              {element}
            </div>
          </Suspense>
        )}
      />
    );
  }
  return (
    <Route
      key={parentPath + path}
      path={path}
      element={(
        <Suspense fallback={<PageLoader />}>
          <div className="page-wrapper">
            {element}
          </div>
        </Suspense>
      )}
    >
      {children ? renderRoute(children, path) : null}
    </Route>
  )
});

const AppRouter = () => (
  <Routes>
    {renderRoute(Object.values(routeConfig))}
  </Routes>
);

export default AppRouter;

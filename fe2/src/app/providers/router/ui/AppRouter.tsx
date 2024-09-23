/* eslint-disable no-undef */
import { Suspense } from 'react';
import { Route, RouteObject, Routes } from 'react-router-dom';
import { routeConfig } from 'shared/config/routeConfig/routeConfig';
import { PageLoader } from 'shared/ui/PageLoader/PageLoader';


const renderRoute = (routes: RouteObject[]) => routes.map(({ path, children, element }) => (
  <Route
    key={path}
    path={path}
    element={(
      <Suspense fallback={<PageLoader />}>
        <div className="page-wrapper">
          {element}
        </div>
      </Suspense>
    )}
  >
    {children ? renderRoute(children) : null}
  </Route>
));
const AppRouter = () => (
  <Routes>
    {renderRoute(Object.values(routeConfig))}
  </Routes>
);

export default AppRouter;

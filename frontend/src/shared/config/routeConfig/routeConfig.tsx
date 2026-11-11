// routeConfig.tsx
import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import IMLSThemeProvider from 'shared/theme/IMLSThemeProvider';
import { lazyPage, LazyPage } from 'shared/lib/lazyPage';

// Every page is lazy-loaded, so each route gets its own JS/CSS chunk and the main bundle
// only contains the app shell. AppRouter already wraps each route in <Suspense>.
const NotFoundPage = lazyPage(() => import('pages/NotFoundPage'), 'NotFoundPage');
const Home = lazyPage(() => import('pages/Home'), 'Home');
const Library = lazyPage(() => import('pages/Library'), 'Library');
const Explore = lazyPage(() => import('pages/Explore'), 'Explore');
const SearchResources = lazyPage(() => import('pages/SearchResources'), 'SearchResources');
const MicrositeCollections = lazyPage(() => import('pages/MicrositeCollections'), 'MicrositeCollections');
const SharedPreferences = lazyPage(() => import('widgets/SharedPreferences'), 'SharedPreferences');
const SubscribedPreferences = lazyPage(() => import('widgets/SubscribedPreferences'), 'SubscribedPreferences');
const SubscribedUpdates = lazyPage(() => import('widgets/SubscribedUpdates'), 'SubscribedUpdates');
const SharedUpdates = lazyPage(() => import('widgets/SharedUpdates'), 'SharedUpdates');
const Collections = lazyPage(() => import('pages/Collections'), 'Collections');
const Collection = lazyPage(() => import('pages/Collection'), 'Collection');
const Dashboard = lazyPage(() => import('pages/Dashboard'), 'Dashboard');
const Reports = lazyPage(() => import('pages/Reports'), 'Reports');
const Groups = lazyPage(() => import('pages/Groups'), 'Groups');
const Organs = lazyPage(() => import('pages/Organs'), 'Organs');
const Cases = lazyPage(() => import('pages/Cases'), 'Cases');
const Group = lazyPage(() => import('pages/Group'), 'Group');
const Case = lazyPage(() => import('pages/Case'), 'Case');
const Lti = lazyPage(() => import('pages/Lti'), 'Lti');
const My = lazyPage(() => import('pages/My'), 'My');
const LibraryContent = lazyPage(() => import('widgets/LibraryContent'), 'LibraryContent');
const MyAccount = lazyPage(() => import('widgets/MyAccount'), 'MyAccount');
const MyOrganizations = lazyPage(() => import('widgets/MyOrganizations'), 'MyOrganizations');
const MyItems = lazyPage(() => import('widgets/MyItems'), 'MyItems');
const SharedContent = lazyPage(() => import('widgets/SharedContent'), 'SharedContent');
const SubscribedContent = lazyPage(() => import('widgets/SubscribedContent'), 'SubscribedContent');
const AdvancedSearch = lazyPage(() => import('pages/AdvancedSearch'), 'AdvancedSearch');
const AdvancedSearchGlobal = lazyPage(() => import('pages/AdvancedSearchGlobal'), 'AdvancedSearchGlobal');
const AllCollections = lazyPage(() => import('pages/AllCollections'), 'AllCollections');
const CollectionDetails = lazyPage(() => import('pages/CollectionDetails/ui/CollectionDetails'), 'CollectionDetails');
const Asset = lazyPage(() => import('pages/Asset'), 'Asset');
const WidgetDashboard = lazyPage(() => import('widgets/WidgetDashboard'), 'WidgetDashboard');
const GrapesEditorComponent = lazyPage(() => import('widgets/WidgetDashboard/ui/GrapesJS'));
const MySettings = lazyPage(() => import('widgets/MySettings'), 'MySettings');
const MyGroups = lazyPage(() => import('widgets/MyGroups'), 'MyGroups');
const MyHubs = lazyPage(() => import('widgets/MyHubs'), 'MyHubs');
const Ticket = lazyPage(() => import('pages/Ticket'), 'Ticket');
const ArkLayout = lazyPage(() => import('pages/Ark'));
const ArkHome = lazyPage(() => import('pages/Ark/Home'));
const ArkAbout = lazyPage(() => import('pages/Ark/About'));
const ArkSearch = lazyPage(() => import('pages/Ark/Search'));
const ArkLesson = lazyPage(() => import('pages/Ark/Lesson'));
const ArkCourse = lazyPage(() => import('pages/Ark/Course'));
const ArkCollections = lazyPage(() => import('pages/Ark/Browse'));
const ArkCollection = lazyPage(() => import('pages/Ark/Collection'));

// IMLSThemeProvider only renders its children after the theme request is done. Preloading the
// page here downloads its chunk at the same time, instead of only after the theme has loaded.
function ThemedPage({ page: Page }: { page: LazyPage }) {
  Page.preload();
  return (
    <IMLSThemeProvider>
      <Page />
    </IMLSThemeProvider>
  );
}

export enum AppRoutes {
  HOME = 'home',
  EXPLORE = 'explore',
  LIBRARY = 'library',
  SEARCH = 'search',
  ADVANCED = 'advanced',
  ADVANCED_SEARCH = 'advanced_search',
  BROWSE = 'browse',
  DETAILS = 'details',
  MICROSITE = 'microsite',
  ASSET = 'asset',
  NOT_FOUND = 'not_found',
  COLLECTIONS = 'collections',
  COLLECTION = 'collection',
  RESOUORCES = 'resources',
  DASHBOARD = 'dashboard',
  TICKET = 'ticket',
  REPORTS = 'reports',
  GROUPS = 'groups',
  ORGANS = 'organs',
  CASES = 'cases',
  GROUP = 'group',
  CASE = 'case',
  CASE_LEGACY = 'case_legacy',
  LTI = 'lti',
  MY = 'my',
  WIDGET_DASHBOARD = 'widget_dashboard',
  WIDGET_GRAPES = 'widget_grapes',
  WIDGET_GRAPES_EDIT = 'widget_grapes_edit',
  ARK = 'ark',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.HOME]: '/imls',
  [AppRoutes.EXPLORE]: '/imls/explore-oer-exchange',
  [AppRoutes.LIBRARY]: '/imls/site-collections/*',
  [AppRoutes.SEARCH]: '/imls/search',
  [AppRoutes.ADVANCED]: '/imls/advanced-resource-search',
  [AppRoutes.ADVANCED_SEARCH]: '/react/advanced-search',
  [AppRoutes.BROWSE]: '/imls/browse',
  [AppRoutes.DETAILS]: '/imls/collection-details/:name/:id/resources',
  [AppRoutes.MICROSITE]: '/imls/microsite/:name',
  [AppRoutes.ASSET]: '/imls/asset/*',
  [AppRoutes.COLLECTIONS]: '/curated-collections/new',
  [AppRoutes.COLLECTION]: '/curated-collections/new/:id',
  [AppRoutes.RESOUORCES]: '/react/resources',
  [AppRoutes.GROUPS]: '/groups/new',
  [AppRoutes.ORGANS]: '/organization/new',
  [AppRoutes.DASHBOARD]: '/reports/dashboard/*',
  [AppRoutes.TICKET]: '/react/ticket',
  [AppRoutes.REPORTS]: '/reports/new',
  [AppRoutes.CASES]: '/courseware/new',
  [AppRoutes.GROUP]: '/groups/new/:id',
  [AppRoutes.CASE]: '/courseware/new/:id',
  [AppRoutes.CASE_LEGACY]: '/cases/:id',
  [AppRoutes.LTI]: '/lti/v1.3/picker/:id/resources',
  [AppRoutes.MY]: '/my/new',
  [AppRoutes.WIDGET_DASHBOARD]: '/new/my/page/dashboard',
  [AppRoutes.WIDGET_GRAPES]: '/new/my/page/grapes/new',
  [AppRoutes.WIDGET_GRAPES_EDIT]: '/new/my/page/grapes/:id',
  [AppRoutes.ARK]: '/ark',
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutes, RouteObject> = {
  [AppRoutes.HOME]: {
    path: RoutePath.home,
    element: <ThemedPage page={Home} />,
  },
  [AppRoutes.EXPLORE]: {
    path: RoutePath.explore,
    element: <ThemedPage page={Explore} />,
  },
  // [AppRoutes.MY_ACCOUNT]: {
  //   path: RoutePath.my_account,
  //   element: <MyAccount/>,
  // },
  [AppRoutes.WIDGET_DASHBOARD]: {
    path: RoutePath.widget_dashboard,
    element: <WidgetDashboard />,
  },
  [AppRoutes.WIDGET_GRAPES]: {
    path: RoutePath.widget_grapes,
    element: <GrapesEditorComponent />,
  },
  [AppRoutes.WIDGET_GRAPES_EDIT]: {
    path: RoutePath.widget_grapes_edit,
    element: <GrapesEditorComponent />,
  },
  [AppRoutes.LIBRARY]: {
    path: RoutePath.library,
    element: <ThemedPage page={Library} />,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to="/imls/site-collections/subscribed-collections"
            replace
          />
        ),
      },
      {
        path: 'main',
        element: <LibraryContent />,
      },
      {
        path: 'subscribed-collections',
        element: <SubscribedContent />,
      },
      {
        path: 'shared-collections',
        element: <SharedContent />,
      },
      {
        path: 'shared-preferences',
        element: <SharedPreferences />,
      },
      {
        path: 'subscribed-preferences',
        element: <SubscribedPreferences />,
      },
      {
        path: 'subscribed-updates',
        element: <SubscribedUpdates />,
      },
      {
        path: 'shared-updates',
        element: <SharedUpdates />,
      },
    ],
  },
  [AppRoutes.SEARCH]: {
    path: RoutePath.search,
    element: <ThemedPage page={SearchResources} />,
  },
  [AppRoutes.ADVANCED]: {
    path: RoutePath.advanced,
    element: <ThemedPage page={AdvancedSearch} />,
  },
  [AppRoutes.ADVANCED_SEARCH]: {
    path: RoutePath.advanced_search,
    element: <AdvancedSearchGlobal />,
  },
  [AppRoutes.BROWSE]: {
    path: RoutePath.browse,
    element: <ThemedPage page={AllCollections} />,
  },
  [AppRoutes.DETAILS]: {
    path: RoutePath.details,
    element: <ThemedPage page={CollectionDetails} />,
  },
  [AppRoutes.MICROSITE]: {
    path: RoutePath.microsite,
    element: <ThemedPage page={MicrositeCollections} />,
  },
  [AppRoutes.ASSET]: {
    path: RoutePath.asset,
    element: <ThemedPage page={Asset} />,
  },
  [AppRoutes.COLLECTIONS]: {
    path: RoutePath.collections,
    element: <Collections />,
  },
  [AppRoutes.RESOUORCES]: {
    path: RoutePath.resources,
    element: <Cases />,
  },
  [AppRoutes.DASHBOARD]: {
    path: RoutePath.dashboard,
    element: <Dashboard />,
  },
  [AppRoutes.TICKET]: {
    path: RoutePath.ticket,
    element: <Ticket />,
  },
  [AppRoutes.REPORTS]: {
    path: RoutePath.reports,
    element: <Reports />,
  },
  [AppRoutes.GROUPS]: {
    path: RoutePath.groups,
    element: <Groups />,
  },
  [AppRoutes.ORGANS]: {
    path: RoutePath.organs,
    element: <Organs />,
  },
  [AppRoutes.CASES]: {
    path: RoutePath.cases,
    element: <Cases />,
  },
  [AppRoutes.GROUP]: {
    path: RoutePath.group,
    element: <Group />,
  },
  [AppRoutes.CASE]: {
    path: RoutePath.case,
    element: <Case />,
  },
  [AppRoutes.CASE_LEGACY]: {
    path: RoutePath.case_legacy,
    element: <Case />,
  },
  [AppRoutes.LTI]: {
    path: RoutePath.lti,
    element: <Lti />,
  },
  [AppRoutes.COLLECTION]: {
    path: RoutePath.collection,
    element: <Collection />,
  },
  [AppRoutes.MY]: {
    path: RoutePath.my,
    element: <My />,
    children: [
      {
        index: true,
        element: <Navigate to="/my/new/items" replace />,
      },
      {
        path: 'items',
        element: <MyItems />,
      },
      {
        path: 'groups',
        element: <MyGroups />,
      },
      {
        path: 'hubs',
        element: <MyHubs />,
      },
      {
        path: 'account',
        element: <MyAccount />,
        children: [
          {
            path: 'settings',
            element: <MySettings />,
          },
          {
            path: 'organization',
            element: <MyOrganizations />,
          },
        ],
      },
    ],
  },
  [AppRoutes.ARK]: {
    path: RoutePath.ark,
    element: <ArkLayout />,
    children: [
      { index: true, element: <ArkHome /> },
      { path: 'about', element: <ArkAbout /> },
      { path: 'search', element: <ArkSearch /> },
      { path: 'lesson/*', element: <ArkLesson /> },
      { path: 'course/:id', element: <ArkCourse /> },
      // { path: 'overview/*', element: <ArkOverview /> },
      { path: 'browse', element: <ArkCollections /> },
      { path: 'collection/*', element: <ArkCollection /> },
    ],
  },
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};

// routeConfig.tsx
import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { NotFoundPage } from 'pages/NotFoundPage';

import { Home } from 'pages/Home';
import { Library } from 'pages/Library';
import { Explore } from 'pages/Explore';
import { SearchResources } from 'pages/SearchResources';
import { MicrositeCollections } from 'pages/MicrositeCollections';
import { SharedPreferences } from 'widgets/SharedPreferences';
import { SubscribedPreferences } from 'widgets/SubscribedPreferences';
import { SubscribedUpdates } from 'widgets/SubscribedUpdates';
import { SharedUpdates } from 'widgets/SharedUpdates';
import { Collections } from 'pages/Collections';
import { Collection } from 'pages/Collection';
import { Dashboard } from 'pages/Dashboard';
import { Reports } from 'pages/Reports';
import { Groups } from 'pages/Groups';
import { Organs } from 'pages/Organs';
import { Cases } from 'pages/Cases';
import { Group } from 'pages/Group';
import { Case } from 'pages/Case';
import { Lti } from 'pages/Lti';
import { My } from 'pages/My';
import { LibraryContent } from '../../../widgets/LibraryContent';
import { MyAccount } from '../../../widgets/MyAccount';
import { MyOrganizations } from '../../../widgets/MyOrganizations';
import { MyItems } from '../../../widgets/MyItems';
import { SharedContent } from '../../../widgets/SharedContent';
import { SubscribedContent } from '../../../widgets/SubscribedContent';
import { AdvancedSearch } from '../../../pages/AdvancedSearch';
import { AdvancedSearchGlobal } from '../../../pages/AdvancedSearchGlobal';
import { AllCollections } from '../../../pages/AllCollections';
import { CollectionDetails } from '../../../pages/CollectionDetails/ui/CollectionDetails';
import { Asset } from '../../../pages/Asset';
import { WidgetDashboard } from '../../../widgets/WidgetDashboard';
import GrapesEditorComponent from 'widgets/WidgetDashboard/ui/GrapesJS';
import { MySettings } from 'widgets/MySettings';
import { MyGroups } from 'widgets/MyGroups';
import { MyHubs } from 'widgets/MyHubs';
import { Ticket } from 'pages/Ticket';
import ArkLayout from 'pages/Ark';
import ArkHome from 'pages/Ark/Home';
import ArkAbout from 'pages/Ark/About';
import ArkSearch from 'pages/Ark/Search';
import ArkResult from 'pages/Ark/Result';
import ArkCollections from 'pages/Ark/Browse';
import ArkCollection from 'pages/Ark/Collection';
import ArkOverview from 'pages/Ark/Overview';
import IMLSThemeProvider from 'shared/theme/IMLSThemeProvider';

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
  [AppRoutes.LTI]: '/lti/v1.3/picker/:id/resources',
  [AppRoutes.MY]: '/my/new',
  [AppRoutes.WIDGET_DASHBOARD]:"/new/my/page/dashboard",
  [AppRoutes.WIDGET_GRAPES]:"/new/my/page/grapes/new",
  [AppRoutes.WIDGET_GRAPES_EDIT]:"/new/my/page/grapes/:id",
  [AppRoutes.ARK]: '/ark',
  [AppRoutes.NOT_FOUND]: '*',
};

export const routeConfig: Record<AppRoutes, RouteObject> = {
  [AppRoutes.HOME]: {
    path: RoutePath.home,
    element: <IMLSThemeProvider><Home /></IMLSThemeProvider>,
  },
  [AppRoutes.EXPLORE]: {
    path: RoutePath.explore,
    element: <IMLSThemeProvider><Explore /></IMLSThemeProvider>,
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
    element: <GrapesEditorComponent/>,
  },
  [AppRoutes.WIDGET_GRAPES_EDIT]: {
    path: RoutePath.widget_grapes_edit,
    element: <GrapesEditorComponent/>,
  },
  [AppRoutes.LIBRARY]: {
    path: RoutePath.library,
    element: <IMLSThemeProvider><Library /></IMLSThemeProvider>,
    children: [
      // {
      //   index: true,
      //   element: <Navigate to="/imls/site-collections/subscribed-collections" replace />,
      // },
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
    element: <IMLSThemeProvider><SearchResources /></IMLSThemeProvider>,
  },
  [AppRoutes.ADVANCED]: {
    path: RoutePath.advanced,
    element: <IMLSThemeProvider><AdvancedSearch /></IMLSThemeProvider>,
  },
  [AppRoutes.ADVANCED_SEARCH]: {
    path: RoutePath.advanced_search,
    element: <AdvancedSearchGlobal />,
  },
  [AppRoutes.BROWSE]: {
    path: RoutePath.browse,
    element: <IMLSThemeProvider><AllCollections /></IMLSThemeProvider>,
  },
  [AppRoutes.DETAILS]: {
    path: RoutePath.details,
    element: <IMLSThemeProvider><CollectionDetails /></IMLSThemeProvider>,
  },
  [AppRoutes.MICROSITE]: {
    path: RoutePath.microsite,
    element: <IMLSThemeProvider><MicrositeCollections /></IMLSThemeProvider>,
  },
  [AppRoutes.ASSET]: {
    path: RoutePath.asset,
    element: <IMLSThemeProvider><Asset /></IMLSThemeProvider>,
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
      { path: 'result/*', element: <ArkResult /> },
      { path: 'overview/*', element: <ArkOverview /> },
      { path: 'browse', element: <ArkCollections /> },
      { path: 'collection/*', element: <ArkCollection /> },
    ],
  },
  [AppRoutes.NOT_FOUND]: {
    path: RoutePath.not_found,
    element: <NotFoundPage />,
  },
};

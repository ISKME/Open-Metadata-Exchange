// routeConfig.tsx
import React from 'react';
import { RouteObject } from 'react-router-dom';
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
import { Groups } from 'pages/Groups';
import { Organs } from 'pages/Organs';
import { Cases } from 'pages/Cases';
import { Group } from 'pages/Group';
import { Case } from 'pages/Case';
import { Lti } from 'pages/Lti';
import { LibraryContent } from '../../../widgets/LibraryContent';
import { MyAccount } from '../../../widgets/MyAccount';
import { MyOrganizations } from '../../../widgets/MyOrganizations';
import { SharedContent } from '../../../widgets/SharedContent';
import { SubscribedContent } from '../../../widgets/SubscribedContent';
import { AdvancedSearch } from '../../../pages/AdvancedSearch';
import { AllCollections } from '../../../pages/AllCollections';
import { CollectionDetails } from '../../../pages/CollectionDetails/ui/CollectionDetails';
import { Asset } from '../../../pages/Asset';

export enum AppRoutes {
	HOME = 'home',
	EXPLORE = 'explore',
	LIBRARY = 'library',
	SEARCH = 'search',
	ADVANCED = 'advanced',
	BROWSE = 'browse',
	DETAILS = 'details',
	MICROSITE = 'microsite',
	ASSET = 'asset',
	NOT_FOUND = 'not_found',
	GROUPS = 'groups',
	ORGANS = 'organs',
	CASES = 'cases',
	GROUP = 'group',
	CASE = 'case',
	LTI = 'lti',
	MY_ACCOUNT = 'my_account',
	MY_ORGANIZATIONS = 'my_organizations',
}

export const RoutePath: Record<AppRoutes, string> = {
	[AppRoutes.HOME]: '/imls',
	[AppRoutes.EXPLORE]: '/imls/explore-oer-exchange',
	[AppRoutes.LIBRARY]: '/imls/site-collections/*',
	[AppRoutes.SEARCH]: '/imls/search',
	[AppRoutes.ADVANCED]: '/imls/advanced-resource-search',
	[AppRoutes.BROWSE]: '/imls/browse',
	[AppRoutes.DETAILS]: '/imls/collection-details/:name/:id/resources',
	[AppRoutes.MICROSITE]: '/imls/microsite/:name',
	[AppRoutes.ASSET]: '/imls/asset/*',
	[AppRoutes.GROUPS]: '/groups/new',
	[AppRoutes.ORGANS]: '/organization/new',
	[AppRoutes.CASES]: '/courseware/new',
	[AppRoutes.GROUP]: '/groups/new/:id',
	[AppRoutes.CASE]: '/courseware/new/:id',
	[AppRoutes.LTI]: '/lti/v1.3/picker/:id/resources',
	[AppRoutes.MY_ACCOUNT]: '/new/my/account',
	[AppRoutes.MY_ORGANIZATIONS]: '/new/my/default-organization',
	[AppRoutes.NOT_FOUND]: '/',
};

export const routeConfig: Record<AppRoutes, RouteObject> = {
	[AppRoutes.HOME]: {
		path: RoutePath.home,
		element: <Home />,
	},
	[AppRoutes.EXPLORE]: {
		path: RoutePath.explore,
		element: <Explore />,
	},
	[AppRoutes.MY_ACCOUNT]: {
		path: RoutePath.my_account,
		element: <MyAccount />,
	},
	[AppRoutes.MY_ORGANIZATIONS]: {
		path: RoutePath.my_organizations,
		element: <MyOrganizations />,
	},
	[AppRoutes.LIBRARY]: {
		path: RoutePath.library,
		element: <Library />,
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
		element: <SearchResources />,
	},
	[AppRoutes.ADVANCED]: {
		path: RoutePath.advanced,
		element: <AdvancedSearch />,
	},
	[AppRoutes.BROWSE]: {
		path: RoutePath.browse,
		element: <AllCollections />,
	},
	[AppRoutes.DETAILS]: {
		path: RoutePath.details,
		element: <CollectionDetails />,
	},
	[AppRoutes.MICROSITE]: {
		path: RoutePath.microsite,
		element: <MicrositeCollections />,
	},
	[AppRoutes.ASSET]: {
		path: RoutePath.asset,
		element: <Asset />,
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
	[AppRoutes.NOT_FOUND]: {
		path: RoutePath.not_found,
		element: <NotFoundPage />,
	},
};

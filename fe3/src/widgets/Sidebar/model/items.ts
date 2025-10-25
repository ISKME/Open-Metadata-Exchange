import React from 'react';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import HomeIcon from '../../../shared/assets/icons/home.svg';
import CollectionsIcon from '../../../shared/assets/icons/collections.svg';
import LibraryIcon from '../../../shared/assets/icons/library.svg';

export interface SidebarItemType {
    path: string;
    text: string;
    Icon: React.VFC<React.SVGProps<SVGSVGElement>>;
}

export const SidebarItemsList: SidebarItemType[] = [
    {
        path: RoutePath.home,
        Icon: HomeIcon,
        text: 'Home',
    },
    {
        path: RoutePath.explore,
        Icon: CollectionsIcon,
        text: 'Explore',
    },
    {
        // path: RoutePath.library,
        path: '/imls/site-collections/main',
        Icon: LibraryIcon,
        text: 'My Library',
    },
];

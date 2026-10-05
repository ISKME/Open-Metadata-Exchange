import { memo } from 'react';
import cls from './SidebarItem.module.scss';
import { SidebarItemType } from '../../model/items';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
    item: SidebarItemType;
}

export const SidebarItem = memo(({ item }: SidebarItemProps) => {

    return (
        <NavLink
            to={item.path + '/'}
            end={true}
            className={({ isActive }) => {
                if (item.path.startsWith('/imls/site-collections')) {
                    return window.location.pathname.startsWith('/imls/site-collections') ? cls.active : cls.inactive;
                }
                return isActive ? cls.active : cls.inactive
            }}
        >
            <item.Icon className={cls.icon} />
            <span>
                {item.text}
            </span>
        </NavLink>
    );
});

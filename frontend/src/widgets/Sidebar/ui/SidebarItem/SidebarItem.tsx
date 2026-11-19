import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import cls from './SidebarItem.module.scss';
import { SidebarItemType } from '../../model/items';

interface SidebarItemProps {
    item: SidebarItemType;
}

export const SidebarItem = memo(({ item }: SidebarItemProps) => (
  <NavLink
    to={`${item.path}/`}
    end
    className={({ isActive }) => {
      if (item.path.startsWith('/imls/site-collections')) {
        return window.location.pathname.startsWith('/imls/site-collections') ? cls.active : cls.inactive;
      }
      return isActive ? cls.active : cls.inactive;
    }}
  >
    <item.Icon className={cls.icon} />
    <span>
      {item.text}
    </span>
  </NavLink>
));

/* eslint-disable no-undef */
import { classNames } from 'shared/lib/classNames/classNames';
import cls from './Sidebar.module.scss';
import { memo, useMemo } from 'react';
import { SidebarItemsList } from 'widgets/Sidebar/model/items';
import { SidebarItem } from 'widgets/Sidebar/ui/SidebarItem/SidebarItem';

interface SidebarProps {
  className?: string;
}

export const Sidebar = memo(({ className }: SidebarProps): JSX.Element => {
  const itemsList = useMemo(() => SidebarItemsList.map((item) => (
    <SidebarItem
      item={item}
      key={item.path}
    />
  )), []);

  return (
    <div data-testid="sidebar" className={classNames(cls.Sidebar, {}, [className])} style={{ order: -1 }}>
      <div className={cls.sidebar_content}>
        <nav className={cls.links}>
          {itemsList}
        </nav>
      </div>
    </div>
  );
})

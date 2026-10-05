/* eslint-disable no-undef */
import { classNames } from 'shared/lib/classNames/classNames';
import cls from './Sidebar.module.scss';
import { useState, useEffect, memo, useMemo } from 'react';
import { SidebarItemsList } from 'widgets/Sidebar/model/items';
import { SidebarItem } from 'widgets/Sidebar/ui/SidebarItem/SidebarItem';

interface SidebarProps {
  className?: string;
}

const useStyleObserver = (targetSelector, callback) => {
  useEffect(() => {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) return;

    // Create a new MutationObserver instance
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          callback(mutation.target);
        }
      });
    });

    // Start observing the target element for attribute changes
    observer.observe(targetElement, {
      attributes: true, // Observe attribute changes
      attributeFilter: ['style'], // Only observe style attribute changes
    });

    // Cleanup the observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, [targetSelector, callback]);
};

export const Sidebar = memo(({ className }: SidebarProps): JSX.Element => {
  const [mainMenuOpen, setMainMenuOpen] = useState(false) // out of react

  const itemsList = useMemo(() => SidebarItemsList.map((item) => (
    <SidebarItem
      item={item}
      key={item.path}
    />
  )), []);

  useStyleObserver('.global-wrapper', (el) => {
    setMainMenuOpen(el.style.position !== 'fixed');
  });

  return (
    <div data-testid="sidebar" id="sidebar" className={classNames(cls.Sidebar, {}, [className])} style={{ order: -1, zIndex: mainMenuOpen ? 1 : 0 }}>
      <div className={cls.sidebar_content}>
        <nav className={cls.links}>
          {itemsList}
        </nav>
      </div>
    </div>
  );
})

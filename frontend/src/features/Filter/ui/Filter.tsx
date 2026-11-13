/* eslint-disable no-unused-vars */
import { memo, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { Checkbox } from 'shared/ui/Checkbox/Checkbox';
import DownIcon from '../../../shared/assets/icons/arrow-down.svg';
import UpIcon from '../../../shared/assets/icons/arrow-up.svg';
import cls from './Filter.module.scss';

interface FilterProps {
  className?: string;
  filter?: any;
  checkMarks?: any;
  onFilterChange: (event: any) => void;
}

const ITEMS_PER_PAGE = 5;

export const Filter = memo(({
  checkMarks,
  filter,
  onFilterChange,
  className,
}: FilterProps) => {
  const options = filter.items;

  const [collapsed, setCollapsed] = useState(false);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);

  const handleSeeMoreClick = () => {
    setVisibleItems(visibleItems + ITEMS_PER_PAGE);
  };

  const filterName = filter.name === 'Tenants' ? 'Digital Library Providers' : filter.name;

  const onToggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <li className={classNames(cls.Filter, { [cls.collapsed]: collapsed }, [className])}>
      <div className={cls.filter_item}>
        <p className={cls.filter_name}>
          {filterName}
        </p>
        <button
          type="button"
          className={cls.icon_btn}
          onClick={onToggle}
          aria-label={`${collapsed ? 'Show' : 'Hide'} ${filterName} filter options`}
          aria-expanded={!collapsed}
        >
          {collapsed
            ? <UpIcon className={cls.icon} aria-hidden="true" focusable="false" />
            : <DownIcon className={cls.icon} aria-hidden="true" focusable="false" />}
        </button>
      </div>
      <div className={classNames(cls.panelCollapse, { [cls.collapsed]: collapsed }, [className])} hidden={collapsed}>
        {options && options.slice(0, visibleItems).map((el: any) => (
          <Checkbox
            key={el.name}
            filter={filter}
            element={el}
            onFilterChange={onFilterChange}
            checkMarks={checkMarks}
          />
        ))}
        {visibleItems < options.length && (
          <button type="button" onClick={handleSeeMoreClick} className={cls.seeMore}>+ See More</button>
        )}
      </div>
    </li>
  );
});

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

  const onToggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <li className={classNames(cls.Filter, { [cls.collapsed]: collapsed }, [className])}>
      <div className={cls.filter_item}>
        <p className={cls.filter_name} aria-label={filter.name}>
          {filter.name === 'Tenants' ? 'Digital Library Providers' : filter.name}
        </p>
        <button
          className={cls.icon_btn}
          onClick={onToggle}
        >
          {collapsed
            ? <UpIcon className={cls.icon} />
            : <DownIcon className={cls.icon} />}
        </button>
      </div>
      <div className={classNames(cls.panelCollapse, { [cls.collapsed]: collapsed }, [className])}>
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
          <button onClick={handleSeeMoreClick} className={cls.seeMore}>+ See More</button>
        )}
      </div>
    </li>
  );
});

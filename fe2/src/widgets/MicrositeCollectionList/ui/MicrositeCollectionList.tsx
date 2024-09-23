/* eslint-disable max-len */
import { Key, memo, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { MicrositeItemCard } from '../../../entities/MicrositeItemCard';
import cls from './MicrositeCollectionList.module.scss';

interface MicrositeCollectionListProps {
    className?: string;
    microsites?: any;
}

export const MicrositeCollectionList = memo(({ microsites, className }: MicrositeCollectionListProps) => {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <div className={classNames('', {}, [className])}>
      <div className={collapsed ? cls.is_collapsed : ''}>
        <ul className={cls.microsite_collection_list}>
          {microsites && microsites.map((el: { name: Key; }) => (
            <MicrositeItemCard microsite={el} key={el.name} />
          ))}
        </ul>
        <button
          type="button"
          className={!collapsed ? cls.u_hidden : cls.btn_link}
          onClick={() => setCollapsed(false)}
        >
          Show all

        </button>
        <button
          type="button"
          className={collapsed ? cls.u_hidden : cls.btn_link}
          onClick={() => setCollapsed(true)}
        >
          Show less

        </button>
      </div>
    </div>
  );
});

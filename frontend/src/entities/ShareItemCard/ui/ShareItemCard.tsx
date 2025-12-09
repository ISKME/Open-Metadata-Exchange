/* eslint-disable max-len */
import { classNames } from 'shared/lib/classNames/classNames';
import { Link } from 'react-router-dom';
import { memo, useEffect, useState } from 'react';
import cls from './ShareItemCard.module.scss';

interface ShareItemCardProps {
  className?: string;
  collection?: any;
  onSelect?: Function;
  onDeselect?: Function;
}

export const ShareItemCard = memo(({
  collection, className, onSelect, onDeselect,
}: ShareItemCardProps) => {
  const [share, setShare] = useState<boolean>(collection.isShared);

  return (
    <div className={classNames('', {}, [className])} onClick={() => console.log(collection.id)}>
      <li className={cls.item_card}>
        <div className={cls.item_img_wrapper}>
          <img src={collection.thumbnail} alt="" width="300" height="150" />
          <p className={cls.item_name}>
            {collection.name}
          </p>
          <div className={cls.action} style={{ cursor: 'pointer' }}>
            { !share && (
              <div
                className={cls.action_save}
                style={{ background: 'white' }}
                onClick={
                  () => {
                    setShare(true);
                    onSelect(collection.id);
                  }
                }
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 5v22M5 16h22" strokeWidth="3" stroke="#c4c4c4" />
                </svg>
              </div>
            ) }
            { share && (
              <div
                className={cls.action_save}
                style={{ background: '#0052cc' }}
                onClick={
                  () => {
                    setShare(false);
                    onDeselect(collection.id);
                  }
                }
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 15l6 8l10 -15" strokeWidth="3" stroke="white" />
                </svg>
              </div>
            ) }
          </div>
        </div>
        <h3 className={cls.site_name}>{collection.micrositeName}</h3>
        <p className="">
          {collection.numResources}
          resources
        </p>
      </li>
    </div>
  );
});

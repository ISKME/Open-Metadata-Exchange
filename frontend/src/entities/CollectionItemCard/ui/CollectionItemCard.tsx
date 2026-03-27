/* eslint-disable max-len */
import { classNames } from 'shared/lib/classNames/classNames';
import { Link } from 'react-router-dom';
import cls from './CollectionItemCard.module.scss';
import { memo, useEffect } from 'react';

interface CollectionItemCardProps {
    className?: string;
    collection?: any;
    isNew?: boolean;
}

export const CollectionItemCard = memo(({ collection, className, isNew = false }: CollectionItemCardProps) => {
  const level = [];
  let { educationLevels } = collection;
  if (educationLevels && educationLevels.length) {
    educationLevels = educationLevels.map((item) => item?.toLowerCase()?.replace(' / ', '/'));
    if (
      educationLevels.includes('preschool')
      || educationLevels.includes('lower primary')
      || educationLevels.includes('upper primary')
      || educationLevels.includes('middle school')
      || educationLevels.includes('high school')
    ) level.push('PreK-12');
    if (
      educationLevels.includes('community college/lower division')
      || educationLevels.includes('academic lower division')
      || educationLevels.includes('college/upper division')
      || educationLevels.includes('academic upper division')
    ) level.push('HigherEd');
    if (
      educationLevels.includes('career/technical')
      || educationLevels.includes('workforce education (technical)')
      || educationLevels.includes('graduate/professional')
      || educationLevels.includes('adult education')
    ) level.push('ContinuingEd');
  }
  return (
    <div className={classNames('', {}, [className])} style={{ position: 'relative' }}>
      <div className={cls.item_banner} style={{ display: isNew ? 'flex' : 'none' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
          <path d="M12.5 2.24951C7.1239 2.24951 2.75 6.62342 2.75 11.9995C2.75 17.3756 7.1239 21.7495 12.5 21.7495C17.8761 21.7495 22.25 17.3756 22.25 11.9995C22.25 6.62342 17.8761 2.24951 12.5 2.24951ZM17.5742 8.73185L11.2742 16.2319C11.2051 16.3142 11.1191 16.3807 11.0221 16.4268C10.925 16.473 10.8192 16.4978 10.7117 16.4995H10.6991C10.5939 16.4995 10.49 16.4773 10.394 16.4345C10.298 16.3917 10.212 16.3292 10.1417 16.2511L7.44172 13.2511C7.37315 13.1783 7.31981 13.0926 7.28483 12.999C7.24985 12.9054 7.23395 12.8057 7.23805 12.7058C7.24215 12.6059 7.26617 12.5079 7.3087 12.4174C7.35123 12.327 7.41142 12.2459 7.48572 12.1791C7.56002 12.1122 7.64694 12.0609 7.74136 12.0281C7.83578 11.9953 7.93581 11.9817 8.03556 11.9881C8.13531 11.9945 8.23277 12.0208 8.32222 12.0654C8.41166 12.1101 8.49128 12.1721 8.5564 12.2479L10.6794 14.6067L16.4258 7.76717C16.5547 7.61814 16.737 7.52582 16.9335 7.51017C17.1299 7.49452 17.3246 7.55679 17.4754 7.68352C17.6263 7.81026 17.7212 7.99127 17.7397 8.18744C17.7582 8.3836 17.6988 8.57917 17.5742 8.73185Z" fill="#FCFCFC"/>
        </svg>
        <span>Collection added</span>
      </div>
      <li className={cls.item_card}>
        <Link to={collection.id !== '' && `/imls/collection-details/${collection.micrositeSlug}/${collection.id}/resources`} aria-label="Go to Collection page" className="">
          <div className={cls.item_img_wrapper}>
            <img src={collection.thumbnail} alt="" width="300" height="150" />
            <p className={cls.item_name}>
              {collection.name}
            </p>
          </div>
          <h3 className={cls.site_name}>{collection.micrositeName}</h3>
          <p className={cls.info_text} style={{ color: '#444' }}>
            {level.join(', ')}
          </p>
          <p  style={{ color: '#444' }}>
            {collection.numResources}
            resources
          </p>
        </Link>
      </li>
    </div>
  );
});

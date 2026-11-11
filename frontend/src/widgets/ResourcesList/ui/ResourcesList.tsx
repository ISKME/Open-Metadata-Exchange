import { ResourcesItemCard } from 'entities/ResourcesItemCard';
import { memo } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import cls from './ResourcesList.module.scss';

interface CollectionListProps {
  className?: string;
  resourcesData?: any;
}

export const ResourcesList = memo(({ resourcesData, className }: CollectionListProps) => (
  <ul>
    {resourcesData && resourcesData.map((el: { id: any; }) => (
      <ResourcesItemCard resource={el} key={el.id} />
    ))}
  </ul>
));

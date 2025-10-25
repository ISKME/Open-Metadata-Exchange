import { memo } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { NavLink } from 'react-router-dom';
import cls from './MicrositeItemCard.module.scss';

interface MicrositeItemCardProps {
    className?: string;
    microsite?: any;
}
export const MicrositeItemCard = memo(({ microsite, className }: MicrositeItemCardProps) => {
  const level = [];
  let { educationalLevels } = microsite;
  if (educationalLevels && educationalLevels.length) {
    educationalLevels = educationalLevels.map((item) => item?.toLowerCase()?.replace(' / ', '/'));
    if (
      educationalLevels.includes('preschool')
      || educationalLevels.includes('lower primary')
      || educationalLevels.includes('upper primary')
      || educationalLevels.includes('middle school')
      || educationalLevels.includes('high school')
    ) level.push('PreK-12');
    if (
      educationalLevels.includes('community college/lower division')
      || educationalLevels.includes('academic lower division')
      || educationalLevels.includes('college/upper division')
      || educationalLevels.includes('academic upper division')
    ) level.push('HigherEd');
    if (
      educationalLevels.includes('career/technical')
      || educationalLevels.includes('workforce education (technical)')
      || educationalLevels.includes('graduate/professional')
      || educationalLevels.includes('adult education')
    ) level.push('ContinuingEd');
  }
  return (
    <div className={classNames('', {}, [className])}>
      <li className={cls.microsite_item_card}>
        <NavLink to={`/imls/browse/?tenant=${microsite.slug}`} aria-label="Explore more about microsite">
          <div className={cls.microsite_item_img_wrapper}>
            <img src={microsite.logo} alt="" />
            <h3 className={cls.microsite_name}>{microsite.name}</h3>
          </div>
          <div>
            <p className={cls.info_text}>{level.join(', ')}</p>
            <p className={cls.info_text}>{`${microsite.numCollections} Collections`}</p>
          </div>
        </NavLink>
      </li>
    </div>
  );
});

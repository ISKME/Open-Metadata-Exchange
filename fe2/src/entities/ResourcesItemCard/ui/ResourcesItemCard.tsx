/* eslint-disable max-len */
import { classNames } from 'shared/lib/classNames/classNames';
import { Link } from 'react-router-dom';
import { memo, useState } from 'react';
import cls from './ResourcesItemCard.module.scss';
import StarIcon from '../../../shared/assets/icons/star.svg';
import AccessibleIcon from '../../../shared/assets/icons/accessible.svg';
import FullCourseIcon from '../../../shared/assets/icons/full-course.svg';
import RightsIcon from '../../../shared/assets/icons/rights.svg';
import InfoIcon from '../../../shared/assets/icons/info.svg';

interface CollectionItemCardProps {
  className?: string;
  resource?: any;
}

const join = (arr) => arr.length ? arr?.reduce((a, b, i, array) => a + (i < array.length - 1 ? ', ' : ' and ') + b) : '';

export const ResourcesItemCard = memo(({ resource, className }: CollectionItemCardProps) => {
  const [see, setSee] = useState(false);
  const [checked, setChecked] = useState(false);
  function MetaData() {
    return (
      <>
        {(resource as any).metadata.map((item) => (
          <>
            {item.label && (
              <p className={cls.subTitle}>
                {item.label}:
                <span>{join(item.items?.map((el) => el.name))}</span>
              </p>
            )}
          </>
        ))}
      </>
    );
  }
  return (
    <li
      className={cls.item_card}
      style={{
        marginRight: '0',
        border: checked && 'rgb(125, 154, 203) solid 1px',
        background: checked && 'white',
      }}
    >
      <div className={cls.item_overview}>
        <p className={cls.microsite}>{resource.micrositeName || resource.site}</p>
        <div className={cls.item_label_wrapper}>
          <input type="checkbox" checked={checked} onChange={({ target }) => setChecked(target.checked)} />
          <Link to={`/imls/asset/${resource.detailURL?.split('/v2/resources/')?.pop()}`} aria-label="Go to Resource page" className={cls.item_link}>
            <label className={cls.item_label}>
              {resource.title || resource.name}
            </label>
          </Link>
        </div>
        <p>
          Updated
          {' '}
          {new Date(resource.updateDate).toDateString()}
          {' '}
        </p>
        <div style={{ display: 'flex' }}>
          <div className={cls.item_stars}>
            {Array.from({ length: Number(resource.rating) || 0 }, (_, index) => (
              <StarIcon className={cls.star_icon} key={index} />
            ))}
            {Array.from({ length: 5 - (Number(resource.rating) || 0) }, (_, index) => (
              <StarIcon className={cls.star_icon_disable} key={index} />
            ))}
          </div>
          <p style={{
            color: '#428bca', fontWeight: 'bold', fontSize: '15px', marginLeft: '8px',
          }}
          >
            {`(${resource.reviews || 0})`}
          </p>
        </div>
        <MetaData />
        <div className={cls.item_accessibility}>
          <AccessibleIcon className={cls.accessible_icon} />
          {resource.accessibility?.join(', ')}
        </div>
        <p className={cls.subTitle}>
          Overview:
          <span>
            {see ? resource.abstract : (`${resource.abstract?.split(' ')?.slice(0, 20)?.join(' ')}...`)}
            {' '}
          </span>
          {!see && <span className={cls.overview_link} onClick={() => setSee(true)}>Read More</span>}
        </p>
      </div>

      <div className={cls.item_info}>
        <div className={cls.item_big_icon}>
          <FullCourseIcon className={cls.full_course_icon} />
          Full Course
        </div>
        <div className={cls.subTitle}>
          <p>License Type:</p>
          <span style={{ marginLeft: '0' }}>{resource.license_bucket_title}</span>
        </div>
        <div className={cls.item_icons}>
          <span>{resource.license?.toUpperCase()}</span>
          <RightsIcon className={cls.icon} />
          <InfoIcon className={cls.info_icon} />
        </div>
      </div>
    </li>
  );
});
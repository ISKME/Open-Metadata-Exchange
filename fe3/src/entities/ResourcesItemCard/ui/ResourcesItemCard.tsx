/* eslint-disable max-len */
import { Link } from 'react-router-dom';
import { memo, useState } from 'react';
import cls from './ResourcesItemCard.module.scss';
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
            {/* Fully filled stars */}
            {Array.from({ length: Math.floor(Number(resource.rating) || 0) }, (_, index) => (
              <svg
                className={cls.star_icon}
                key={`active-${index}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
              >
                <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
              </svg>
            ))}

            {/* Partially filled star */}
            {Number(resource.rating) % 1 !== 0 && (
              <div
                className={cls.star_icon_partial}
                key="partial-star"
              >
                {/* Background for the inactive part of the star */}
                <svg
                  className={cls.star_icon_disable}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  style={{ position: "relative", top: 0, left: 0 }}
                >
                  <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
                </svg>
                {/* Fill for the active part of the star */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    clipPath: `inset(0 ${100 - (Number(resource.rating) % 1) * 100}% 0 0)`,
                  }}
                >
                  <path
                    d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z"
                    fill="#6f983d"
                  />
                </svg>
              </div>
            )}

            {/* Inactive stars */}
            {Array.from(
              { length: 5 - Math.ceil(Number(resource.rating) || 0) },
              (_, index) => (
                <svg
                  className={cls.star_icon_disable}
                  key={`inactive-${index}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                >
                  <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
                </svg>
              )
            )}
          </div>
          <p style={{
            color: '#428bca', fontWeight: 'bold', fontSize: '15px', margin: '-4px 0 0 8px',
          }}
          >
            {`(${resource.ratings_number || 0})`}
          </p>
        </div>
        {
          resource.visits !== undefined ? (
            <div>
              <strong>Views:</strong>
              <p style={{
                  color: '#428bca', fontWeight: 'bold', fontSize: '15px', marginLeft: '8px', display: 'inline',
                }}
                >
                  {`(${resource.visits || 0})`}
              </p>
            </div>
          ) : null
        }
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

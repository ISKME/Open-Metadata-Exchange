// @ts-nocheck
import { useState } from 'react';
import cls from './Collapse.module.scss';

export const Collapse = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={props.style || {}}>
      <div className={cls.collapseCard} onClick={() => props.number !== 0 && setIsOpen(!isOpen)} style={{ backgroundColor: props.number === 0 ? '#dadada' : '' }}>
        {props.number !== -1 && (
            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="24" viewBox="0 0 21 24" fill="none">
            <g clip-path="url(#clip0_220_1538)">
              <path d="M10.5001 0C9.67039 0 9.00008 0.670312 9.00008 1.5V2.4C5.5782 3.09375 3.00008 6.12187 3.00008 9.75V10.6313C3.00008 12.8344 2.18914 14.9625 0.726642 16.6125L0.379767 17.0016C-0.0139832 17.4422 -0.107733 18.075 0.131329 18.6141C0.370392 19.1531 0.909454 19.5 1.50008 19.5H19.5001C20.0907 19.5 20.6251 19.1531 20.8688 18.6141C21.1126 18.075 21.0141 17.4422 20.6204 17.0016L20.2735 16.6125C18.811 14.9625 18.0001 12.8391 18.0001 10.6313V9.75C18.0001 6.12187 15.422 3.09375 12.0001 2.4V1.5C12.0001 0.670312 11.3298 0 10.5001 0ZM12.6235 23.1234C13.186 22.5609 13.5001 21.7969 13.5001 21H10.5001H7.50008C7.50008 21.7969 7.81414 22.5609 8.37664 23.1234C8.93914 23.6859 9.7032 24 10.5001 24C11.297 24 12.061 23.6859 12.6235 23.1234Z" fill={props.number === 0 ? 'black' : '#1747A1'} />
            </g>
            <defs>
              <clipPath id="clip0_220_1538">
                <rect width="21" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        )}
        <span>{props.number !== -1 && <b style={{ color: props.number === 0 ? 'black' : '' }}>{props.number}</b>} {props.title}</span>
        {props.number !== 0 && (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : '' }}>
              <path d="M17 9.5L12 14.5L7 9.5H17Z" fill="#1E1E1E"/>
            </svg>
            {props.number !== -1 && <a href="#">Clear</a>}
          </>
        )}
      </div>
      {props.number !== 0 && isOpen && props.children}
    </div>
  );
};

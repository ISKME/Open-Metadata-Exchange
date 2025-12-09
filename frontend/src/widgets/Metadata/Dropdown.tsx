import { useEffect, useRef, useState } from 'react';
import cls from './Dropdown.module.scss';

function useOutsideAlerter(ref, cb) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        cb();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}

export const Dropdown = ({ keyword = '', list = [], initial = '', onSelect = (item) => {} }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initial);
  const wrapperRef = useRef(null);
  const divRef = useRef(null);
  const scrollDiv = (amount) => {
    divRef.current.scrollTop += amount;
  };
  useOutsideAlerter(wrapperRef, () => setOpen(false));
  return (
    <div className={cls['dropdown-wrapper']} ref={wrapperRef}>
      <div className={`${cls['frame-9']} ${(open ? cls['dropdown'] : '')}`} style={{ border: !selected ? 'red 1px solid' : '' }}>
        <div className={cls['frame-10']} onClick={() => setOpen(!open)}>
          <div className={cls['text-wrapper-3']}>{selected || ('Select ' + keyword)}</div>
          <svg className={cls['icons-arrow-drop-up']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : '' }}>
            <path d="M17 9.5L12 14.5L7 9.5H17Z" fill="#1E1E1E"/>
          </svg>
          <div style={{ flex: 1 }}></div>
        </div>
        {open && (
          <div className={cls['values']}>
            <svg onClick={() => scrollDiv(-115)} className={cls['icons-arrow-drop-up']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M7 14L12 9L17 14H7Z" fill="#054DD1"/>
            </svg>
            <div ref={divRef} className={cls['inner-values']}>
              {list.map((item) => (
                <div
                  className={cls['frame']}
                  onClick={() => {
                    setOpen(false);
                    setSelected(item.name);
                    onSelect(item.name);
                  }}
                >
                  {/* <div className={cls['filters-checkbox']}><div className={cls['rectangle']}></div></div> */}
                  <div className={cls['microsite']}>{item.name}</div>
                </div>
              ))}
            </div>
            <svg onClick={() => scrollDiv(115)} className={cls['icons-arrow-drop-up']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 10L12 15L7 10H17Z" fill="#054DD1"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

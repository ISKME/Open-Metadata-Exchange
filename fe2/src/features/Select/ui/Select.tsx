/* eslint-disable no-unused-vars */
import { memo, SelectHTMLAttributes, useRef, useState, useEffect } from 'react';
import { SelectRenderer } from 'react-dropdown-select';
import { classNames } from 'shared/lib/classNames/classNames';
import cls from './Select.module.scss';

interface SelectProps {
    className?: string;
    options: [];
    initial?: string;
    onSelectChange: (event: any) => void;
}
export const Select = memo((props: SelectProps) => {
  const {
    options, onSelectChange, initial, className,
  } = props;
  const selectOptions = options as Array<any>;
  const [isOpen, setIsOpen] = useState(false);
  const [isSelected, setIsSelected] = useState(initial || '');

  const sort = useRef(null);

  const handleClickOutside = (event) => {
    if (sort.current && !sort.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  
  useEffect(() => {
    const selected = selectOptions?.find((item) => item.slug === initial);
    selected && setIsSelected(selected.name);
  }, [initial]);

  const handleSortChange = (key) => {
    onSelectChange({ target: { value: key } });
    const selected = selectOptions.find((item) => item.slug === key);
    selected && setIsSelected(selected.name);
    setIsOpen(false);
  };

  return (
    <div className={classNames(cls.Select, {}, [className])}>
      <p>Sort By</p>
      <div className={cls.dropdown} onClick={() => setIsOpen(!isOpen)}>
        {isSelected || 'Relevance'}
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M16.59 8.29492L12 12.8749L7.41 8.29492L6 9.70492L12 15.7049L18 9.70492L16.59 8.29492Z" fill="#373A48" />
        </svg>
        {isOpen && (
          <ul className={cls.sort} ref={sort}>
            {selectOptions.map((option) => (
              <li key={option.slug} onClick={() => handleSortChange(option.slug)}>
                {option.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

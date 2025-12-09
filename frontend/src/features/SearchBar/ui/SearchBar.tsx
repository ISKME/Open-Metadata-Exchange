/* eslint-disable no-unused-vars */
import { classNames } from 'shared/lib/classNames/classNames';
import SearchIcon from 'shared/assets/icons/search.svg';
import cls from './SearchBar.module.scss';
import { memo, useEffect, useRef } from 'react';

interface SearchBarProps {
    className?: string;
    value?: string;
    onInputChange: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onClear?: () => void;
    placeholder: string;
}
export const SearchBar = memo(({ value, onInputChange, onKeyDown, onClear, placeholder, className }: SearchBarProps) => {
  // useEffect(() => {
  //   if (!value && onClear) onClear();
  // }, [value]);
  useEffect(() => {
    const handler = (event) => {
      if (event.target.value === '' && event.type === 'search' && onClear) onClear();
    };
    const element = ref.current;
    element.addEventListener('search', handler);
    return () => element.removeEventListener('search', handler);
  }, []);
  const ref = useRef(null);
  return (
    <div className={classNames(cls.Searchbar, {}, [className])}>
      <SearchIcon className={cls.search_icon} />
      <input
        type="search"
        name="search"
        aria-label="Search keywords"
        autoComplete="off"
        value={value}
        className={cls.input}
        placeholder={placeholder}
        onChange={onInputChange}
        onKeyDown={onKeyDown}
        ref={ref}
      />
    </div>
  );
});

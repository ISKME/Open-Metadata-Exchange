/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
import {
  FC, memo, useState, useEffect,
} from 'react';
import { useLocation } from 'react-router-dom';
import * as qs from 'query-string';
import cls from './Checkbox.module.scss';

interface CheckboxProps {
  className?: string;
  filter?: any;
  checkMarks?: any;
  element?: any;
  onFilterChange: (event: any) => void;
}

export const Checkbox: FC<CheckboxProps> = memo((props) => {
  const {
    checkMarks,
    filter,
    onFilterChange,
    element,
    className,
    ...otherProps
  } = props;

  const [value, setValue] = useState('');
  const [checkedValues, setCheckedValues] = useState({});

  const { search } = useLocation();

  useEffect(() => {
    const parsed = qs.parse(search);
    setCheckedValues(parsed);
  }, [search, setCheckedValues]);

  useEffect(() => {
    setValue(element.slug);
  }, []);

  return (
    <label className={cls.checkbox_label}>
      <input
        data-slug={filter.keyword}
        value={value || ''}
        type="checkbox"
        onChange={onFilterChange}
        checked={checkedValues[filter.keyword]?.includes(element.slug)}
        {...otherProps}
      />
      {element.name}
    </label>
  );
});

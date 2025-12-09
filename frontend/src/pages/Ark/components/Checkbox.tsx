/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-unused-vars */
// @ts-nocheck
import { memo, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as qs from 'query-string';

export const Checkbox = memo((props) => {
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
    <label>
      <input
        data-slug={filter.keyword}
        value={value || ''}
        type="checkbox"
        onChange={onFilterChange}
        checked={checkedValues[filter.keyword]?.includes(element.slug)}
        style={{ width: 20 }}
        {...otherProps}
      />
      {/* {element.name} */}
    </label>
  );
});

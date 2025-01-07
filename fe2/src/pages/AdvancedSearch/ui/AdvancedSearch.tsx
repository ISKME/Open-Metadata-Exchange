/* eslint-disable func-names */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import Select from 'react-dropdown-select';
import ArrowIcon from '../../../shared/assets/icons/arrow-back.svg';
import cls from './AdvancedSearch.module.scss';
import { Button } from '../../../shared/ui/Button/Button';
import { AppLink } from 'shared/ui/AppLink/AppLink';

// import { useEffect, useState } from 'react';

interface AdvancedSearchProps {
  className?: string;
}

export function AdvancedSearch({ className }: AdvancedSearchProps) {
  const [values, setValues] = useState([]);

    const options = [
        {
            value: '1',
            label: 'most',
        },
        {
            value: '2',
            label: 'louis',
        },
        {
            value: '3',
            label: 'viva',
        }];
    // useEffect(() => {
    //   fetch('/api/imls/v2/collections/browse')
    //     .then(res => res.json())
    //     .then(data => {
    //       console.log(data.collections.filters[0].items)
    //       setOptions(data.collections.filters[0].items)
    //     }
    //     )
    // }, []);

  return (
    <div className={classNames(cls.Advanced, {}, [className])}>
      <ArrowIcon className={cls.back_link_img} />
      <AppLink to="/imls/explore-oer-exchange" aria-label="Go Back to Explore Open Metadata Exchange" className={cls.back_link} text='Back to Explore Open Metadata Exchange' />
      <h1 className={cls.advanced_title}>Advanced Search</h1>
      <div className="">
        <div className="">
          <h2 className={cls.advanced_subtitle}>Filters</h2>
          <form>
            <ul>
              <li className={cls.advanced_filter_item}>
                <p className={cls.advanced_filter_item_title}>Microsite Curators</p>
                <div className={cls.include}>
                  <p>Include:</p>
                  <Select
                    options={options}
                    placeholder="Select"
                    searchable={false}
                    clearable
                    multi
                    onChange={(values) => setValues(values)}
                    values={[]}

                  />
                </div>
                <div className={cls.exclude}>
                  <p>Exclude:</p>
                  <Select
                    options={options}
                    placeholder="Select"
                    searchable={false}
                    clearable
                    multi
                    onChange={(values) => setValues(values)}
                    values={[]}
                  />
                </div>
              </li>
            </ul>
          </form>
        </div>
        <div className={cls.btns_wrapper}>
          <Button title="Search" />
          <Button title="Reset" />
        </div>
      </div>
    </div>
  );
}

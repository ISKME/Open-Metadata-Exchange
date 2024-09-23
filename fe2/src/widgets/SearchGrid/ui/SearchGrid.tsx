/* eslint-disable no-useless-computed-key */
/* eslint-disable react/button-has-type */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import qs from 'qs';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { Portal } from 'features/Portal';
import cls from './SearchGrid.module.scss';

function Check({ id, label, checked = false, onChange = () => {} }) { // , name, value, children
  return (
    <div className={cls.check}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

function formatStringArray(arr) {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return arr.join(' and ');
  } else {
    return arr.slice(0, arr.length - 1).join(', ') + ', and ' + arr[arr.length - 1];
  }
}

export function SearchGrid({ api, title, children, un = '', share = '', add = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [filters, setFilters] = useState([]);
  const [options, setOptions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [tenantFilter, setTenantFilter] = useState('');
  const [results, setResults] = useState([]);
  const [num, setNum] = useState(0);
  const [page, setPage] = useState(1);
  const [end, setEnd] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Value>(null); // ([new Date('2000'), new Date()]);
  const [isVisible, setIsVisible] = useState(false);
  const [subjectCheckStates, setSubjectCheckStates] = useState([]);
  const [levelCheckStates, setLevelCheckStates] = useState([]);
  const [tenantCheckStates, setTenantCheckStates] = useState([]);
  const [shareState, setShareState] = useState(share);
  const [addState, setAddState] = useState(add);

  useEffect(() => {
    setShareState(share);
    setAddState([]);
  }, [share]);
  useEffect(() => {
    if (add && add.length) {
      setShareState('');
      setAddState(add);
    }
  }, [add]);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/imls/v2/' + api, {
        params: {
          per_page: '9',
          page,
          sortby: sortOption || 'search',
          'f.search': searchTerm,
          'f.date_gte': date && date[0].toISOString().substring(0, 10),
          'f.date_lte': date && date[1].toISOString().substring(0, 10),
          'f.general_subject': subjectCheckStates.filter((subject) => subject.checked).map((subject) => subject.id),
          'f.sublevel': levelCheckStates.filter((level) => level.checked).map((level) => level.id),
          'tenant': tenantCheckStates.filter((tenant) => tenant.checked).map((tenant) => tenant.id),
        },
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
      });
      setEnd(false);
      if (response.data.code === 500) {
        setEnd(true);
      } else if (page === 1) {
        setResults(response.data.collections.items);
        setNum(Number(response.data.collections.pagination.count));
        if (!subjects.length) {
          const subjectItems = response.data.collections.filters.find((filter) => filter.keyword === 'f.general_subject')?.items;
          setSubjects(subjectItems);
          if (!subjectCheckStates.length) {
            setSubjectCheckStates(subjectItems.map((item) => ({ id: item.slug, checked: false })));
          }
        }
        if (!levels.length) {
          const levelItems = response.data.collections.filters.find((filter) => filter.keyword === 'f.sublevel')?.items;
          setLevels(levelItems);
          if (!levelCheckStates.length) {
            setLevelCheckStates(levelItems.map((item) => ({ id: item.slug, checked: false })));
          }
        }
        if (api.includes('subscribed')) {
          if (!tenants.length) {
            const tenantsItems = response.data.collections.filters.find((filter) => filter.keyword === 'tenant')?.items;
            setTenants(tenantsItems);
            if (!tenantCheckStates.length) {
              setTenantCheckStates(tenantsItems.map((item) => ({ id: item.slug, checked: false })));
            }
          }
        }
      } else {
        setResults([...results, ...response.data.collections.items]);
      }
      setOptions(response.data.collections.sortByOptions);
    } catch (error) {
      setEnd(true);
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortOption, filters, page, un, share]);

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleSortChange = (key) => {
    setSortOption(key);
    setPage(1); // Reset page number when sort option changes
    setIsOpen(false);
  };

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

  const apply = () => {
    setPage(1);
    fetchData();
    setIsVisible(false);
  };

  const clear = () => {
    setSubjectCheckStates(subjectCheckStates.map((subject) => ({ ...subject, checked: false })));
    setLevelCheckStates(levelCheckStates.map((level) => ({ ...level, checked: false })));
    setTenantCheckStates(tenantCheckStates.map((tenant) => ({ ...tenant, checked: false })));
    setDate(null);
  };
  function handleSubjectsCheckChange(slug) {
    const updatedCheckStates = subjectCheckStates.map((check) => {
      if (check.id === slug) {
        return { ...check, checked: !check.checked };
      }
      return check;
    });
    setSubjectCheckStates(updatedCheckStates);
  }
  function handleLevelsCheckChange(slug) {
    const updatedCheckStates = levelCheckStates.map((check) => {
      if (check.id === slug) {
        return { ...check, checked: !check.checked };
      }
      return check;
    });
    setLevelCheckStates(updatedCheckStates);
  }
  function handleTenantsCheckChange(slug) {
    const updatedCheckStates = tenantCheckStates.map((check) => {
      if (check.id === slug) {
        return { ...check, checked: !check.checked };
      }
      return check;
    });
    setTenantCheckStates(updatedCheckStates);
  }

  function correction(option) {
    if (option === 'search') {
      return 'Relevance'
    }
    if (option === 'title') {
      return 'Title'
    }
    if (option === 'visits') {
      return 'Last Updated'
    }
  }

  function message(condition, title, text) {
    if (condition) {
      return (
        <div className={cls['notification-button']}>
          <svg className={cls['ionicon-c-checkmark']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.24951C6.6239 2.24951 2.25 6.62342 2.25 11.9995C2.25 17.3756 6.6239 21.7495 12 21.7495C17.3761 21.7495 21.75 17.3756 21.75 11.9995C21.75 6.62342 17.3761 2.24951 12 2.24951ZM17.0742 8.73185L10.7742 16.2319C10.7051 16.3142 10.6191 16.3807 10.5221 16.4268C10.425 16.473 10.3192 16.4978 10.2117 16.4995H10.1991C10.0939 16.4995 9.99 16.4773 9.89398 16.4345C9.79796 16.3917 9.71202 16.3292 9.64172 16.2511L6.94172 13.2511C6.87315 13.1783 6.81981 13.0926 6.78483 12.999C6.74985 12.9054 6.73395 12.8057 6.73805 12.7058C6.74215 12.6059 6.76617 12.5079 6.8087 12.4174C6.85123 12.327 6.91142 12.2459 6.98572 12.1791C7.06002 12.1122 7.14694 12.0609 7.24136 12.0281C7.33578 11.9953 7.43581 11.9817 7.53556 11.9881C7.63531 11.9945 7.73277 12.0208 7.82222 12.0654C7.91166 12.1101 7.99128 12.1721 8.0564 12.2479L10.1794 14.6067L15.9258 7.76717C16.0547 7.61814 16.237 7.52582 16.4335 7.51017C16.6299 7.49452 16.8246 7.55679 16.9754 7.68352C17.1263 7.81026 17.2212 7.99127 17.2397 8.18744C17.2582 8.3836 17.1988 8.57917 17.0742 8.73185Z" fill="#34B53A"/>
          </svg>
          <p className={cls['text-wrapper']}>{title}</p>
          {text && <p className={cls['div']}>{text}</p>}
        </div>
      );
    }
  }

  return (
    <div className={cls.search}>
      <Portal visible={isVisible}>
        <div
          style={{
            display: 'flex',
            height: '478px',
            width: '900px',
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderRadius: '28px',
            background: 'rgb(252, 252, 252)',
          }}
        >
          <div className={cls['list-dialog']}>
            <div className={cls.content1}>
              {/* <StyleOutlined className="style-outlined" color="#1E1E1E" /> */}
              <div
                style={{
                  position: 'absolute', right: '24px', top: '24px', cursor: 'pointer', zIndex: 100,
                }}
                onClick={() => setIsVisible(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#1E1E1E" />
                </svg>
              </div>
              <div className={cls['text-content-wrapper']}>
                <div className={cls['text-content']}>
                  <div className={cls.headline}>Filter by</div>
                </div>
              </div>
            </div>
            <div className={cls['list-items']}>
              <div className={cls['date-added']}>
                <p className={cls['body-text']}>Added to the OER Exchange Date Range</p>
                <DateRangePicker onChange={setDate} value={date} />
              </div>
              <div className={cls.div}>
                {api.includes('subscribed') && (
                  <div className={cls['collection-owner']}>
                    <div className={cls['content-2']}>
                      <div className={cls['body-text-2']}>
                        <input type="text" placeholder="Collection Owner" value={tenantFilter} onChange={({ target }) => setTenantFilter(target.value)} />
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
                      </svg>
                    </div>
                    <div className={cls.divider} />
                    <div className={cls.values} style={{ height: '172px' }}>
                      {tenants.filter((item) => item.name && item.name.toLowerCase().includes(tenantFilter)).map((item, i) => (
                        <div className={cls['div-2']} id="subjects" key={`b-${i}`}>
                          <Check id={item.slug} label="" checked={tenantCheckStates.find((check) => check.id === item.slug)?.checked} onChange={() => handleTenantsCheckChange(item.slug)} />
                          <div className={cls['microsite-2']}>{item.name}</div>
                        </div>
                      ))}
                      {/* <div className={cls['text-wrapper-2']}>+ See More</div> */}
                    </div>
                  </div>
                )}
                <div className={cls['collection-owner']}>
                  <div className={cls['content-2']}>
                    <div className={cls['body-text-2']}>
                      <input type="text" placeholder="Subject Area" value={subjectFilter} onChange={({ target }) => setSubjectFilter(target.value)} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
                    </svg>
                  </div>
                  <div className={cls.divider} />
                  <div className={cls.values} style={{ height: '172px' }}>
                    {subjects.filter((item) => item.name && item.name.toLowerCase().includes(subjectFilter)).map((item, i) => (
                      <div className={cls['div-2']} id="subjects" key={`c-${i}`}>
                        <Check id={item.slug} label="" checked={subjectCheckStates.find((check) => check.id === item.slug)?.checked} onChange={() => handleSubjectsCheckChange(item.slug)} />
                        <div className={cls['microsite-2']}>{item.name}</div>
                      </div>
                    ))}
                    {/* <div className={cls['text-wrapper-2']}>+ See More</div> */}
                  </div>
                </div>
                <div className={cls['collection-owner-2']}>
                  <div className={cls['div-2']}>
                    <div className={cls['body-text-2']}>
                      <input type="text" placeholder="Education Level" value={levelFilter} onChange={({ target }) => setLevelFilter(target.value)} />
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
                    </svg>
                  </div>
                  <div className={cls.divider} />
                  <div className={cls['values-wrapper']}>
                    <div className={cls.values} style={{ height: '172px' }}>
                      {levels.filter((item) => item.name && item.name.toLowerCase().includes(levelFilter)).map((item, i) => (
                        <div className={cls['div-2']} id="levels" key={`a-${i}`}>
                          <Check id={item.slug} label="" checked={levelCheckStates.find((check) => check.id === item.slug)?.checked} onChange={() => handleLevelsCheckChange(item.slug)} />
                          <div className={cls['microsite-2']}>{item.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={cls.actionButtons}>
              <button className={cls.button} style={{ cursor: 'pointer' }}>
                <div className={cls['label-text']} onClick={apply}>Confirm filters</div>
              </button>
              <div className={cls['label-text-2']} style={{ cursor: 'pointer' }} onClick={clear}>Reset</div>
            </div>
          </div>
        </div>
      </Portal>
      {un && <div className={cls['notification-button']}>
        <svg className={cls['ionicon-c-checkmark']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.24951C6.6239 2.24951 2.25 6.62342 2.25 11.9995C2.25 17.3756 6.6239 21.7495 12 21.7495C17.3761 21.7495 21.75 17.3756 21.75 11.9995C21.75 6.62342 17.3761 2.24951 12 2.24951ZM17.0742 8.73185L10.7742 16.2319C10.7051 16.3142 10.6191 16.3807 10.5221 16.4268C10.425 16.473 10.3192 16.4978 10.2117 16.4995H10.1991C10.0939 16.4995 9.99 16.4773 9.89398 16.4345C9.79796 16.3917 9.71202 16.3292 9.64172 16.2511L6.94172 13.2511C6.87315 13.1783 6.81981 13.0926 6.78483 12.999C6.74985 12.9054 6.73395 12.8057 6.73805 12.7058C6.74215 12.6059 6.76617 12.5079 6.8087 12.4174C6.85123 12.327 6.91142 12.2459 6.98572 12.1791C7.06002 12.1122 7.14694 12.0609 7.24136 12.0281C7.33578 11.9953 7.43581 11.9817 7.53556 11.9881C7.63531 11.9945 7.73277 12.0208 7.82222 12.0654C7.91166 12.1101 7.99128 12.1721 8.0564 12.2479L10.1794 14.6067L15.9258 7.76717C16.0547 7.61814 16.237 7.52582 16.4335 7.51017C16.6299 7.49452 16.8246 7.55679 16.9754 7.68352C17.1263 7.81026 17.2212 7.99127 17.2397 8.18744C17.2582 8.3836 17.1988 8.57917 17.0742 8.73185Z" fill="#34B53A"/>
        </svg>
        <p className={cls['text-wrapper']}>You are unsubscribed from {un}.</p>
        <p className={cls['div']}>You will no longer receive content updates.</p>
      </div>}
      {shareState && <div className={cls['notification-button']}>
        <svg className={cls['ionicon-c-checkmark']} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2.24951C6.6239 2.24951 2.25 6.62342 2.25 11.9995C2.25 17.3756 6.6239 21.7495 12 21.7495C17.3761 21.7495 21.75 17.3756 21.75 11.9995C21.75 6.62342 17.3761 2.24951 12 2.24951ZM17.0742 8.73185L10.7742 16.2319C10.7051 16.3142 10.6191 16.3807 10.5221 16.4268C10.425 16.473 10.3192 16.4978 10.2117 16.4995H10.1991C10.0939 16.4995 9.99 16.4773 9.89398 16.4345C9.79796 16.3917 9.71202 16.3292 9.64172 16.2511L6.94172 13.2511C6.87315 13.1783 6.81981 13.0926 6.78483 12.999C6.74985 12.9054 6.73395 12.8057 6.73805 12.7058C6.74215 12.6059 6.76617 12.5079 6.8087 12.4174C6.85123 12.327 6.91142 12.2459 6.98572 12.1791C7.06002 12.1122 7.14694 12.0609 7.24136 12.0281C7.33578 11.9953 7.43581 11.9817 7.53556 11.9881C7.63531 11.9945 7.73277 12.0208 7.82222 12.0654C7.91166 12.1101 7.99128 12.1721 8.0564 12.2479L10.1794 14.6067L15.9258 7.76717C16.0547 7.61814 16.237 7.52582 16.4335 7.51017C16.6299 7.49452 16.8246 7.55679 16.9754 7.68352C17.1263 7.81026 17.2212 7.99127 17.2397 8.18744C17.2582 8.3836 17.1988 8.57917 17.0742 8.73185Z" fill="#34B53A"/>
        </svg>
        <p className={cls['text-wrapper']}>You are no longer sharing {shareState} on the OER Exchange.</p>
        <p className={cls['div']}>Current subscribers will no longer receive updates for this collection.</p>
      </div>}
      {message(addState.length, `Success! You are now sharing ${formatStringArray(addState.map((item) => item.name))} to the OER Exchange.`, '')}
      <h6>
        <span style={{ color: addState.length ? '#34B53A' : '' }}>{num + addState.length}</span>
        {` ${title}`}
      </h6>
      <div className={cls.fields}>
        <div className={cls.searchCollections}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M17.0163 10.0082C17.0163 11.5547 16.5143 12.9833 15.6686 14.1423L19.9341 18.4112C20.3553 18.8324 20.3553 19.5163 19.9341 19.9375C19.513 20.3587 18.829 20.3587 18.4078 19.9375L14.1423 15.6686C12.9833 16.5177 11.5547 17.0163 10.0082 17.0163C6.13682 17.0163 3 13.8795 3 10.0082C3 6.13682 6.13682 3 10.0082 3C13.8795 3 17.0163 6.13682 17.0163 10.0082ZM10.0082 14.86C10.6453 14.86 11.2762 14.7345 11.8649 14.4906C12.4535 14.2468 12.9884 13.8894 13.4389 13.4389C13.8894 12.9884 14.2468 12.4535 14.4906 11.8649C14.7345 11.2762 14.86 10.6453 14.86 10.0082C14.86 9.37101 14.7345 8.7401 14.4906 8.15145C14.2468 7.5628 13.8894 7.02795 13.4389 6.57741C12.9884 6.12688 12.4535 5.7695 11.8649 5.52568C11.2762 5.28185 10.6453 5.15636 10.0082 5.15636C9.37101 5.15636 8.7401 5.28185 8.15145 5.52568C7.5628 5.7695 7.02795 6.12688 6.57741 6.57741C6.12688 7.02795 5.7695 7.5628 5.52568 8.15145C5.28185 8.7401 5.15636 9.37101 5.15636 10.0082C5.15636 10.6453 5.28185 11.2762 5.52568 11.8649C5.7695 12.4535 6.12688 12.9884 6.57741 13.4389C7.02795 13.8894 7.5628 14.2468 8.15145 14.4906C8.7401 14.7345 9.37101 14.86 10.0082 14.86Z" fill="#262341" />
          </svg>
          <input className={cls.searchSearch} placeholder="Search collections" value={searchTerm} onChange={({ target }) => setSearchTerm(target.value)} onKeyDown={({ key }) => { key === 'Enter' && handleSearch() }} />
        </div>
        <div style={{ flex: 1 }}>
          <button className={cls.searchButton} onClick={handleSearch}>Search</button>
        </div>
        <span>Sort By</span>
        <div className={cls.dropdown} onClick={() => setIsOpen(!isOpen)}>
          {correction(sortOption) || 'Last Updated'}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M16.59 8.29492L12 12.8749L7.41 8.29492L6 9.70492L12 15.7049L18 9.70492L16.59 8.29492Z" fill="#373A48" />
          </svg>
          {isOpen && (
            <ul className={cls.sort} ref={sort}>
              {options.map((option) => (
                <li key={option.slug} onClick={() => handleSortChange(option.slug)}>
                  {option.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={cls.dropdown} onClick={() => setIsVisible(true)}>
          Filters
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="black" />
          </svg>
        </div>
      </div>
      {/* {children} */}
      {children(results)}
      {/* {React.Children.map(children, (child) => React.cloneElement(child, { results }))} */}
      {!end && <span className={cls.more} onClick={handleLoadMore}>Load More +</span>}
    </div>
  );
}

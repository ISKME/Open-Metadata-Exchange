// @ts-nocheck
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { AsyncPaging } from './async';

export const getQueryParams = (search: string) => {
  if (!search || search === '') {
    return null;
  }
  const resultArr = search.replace('?', '').split('&').map(p => {
    const parts = p.split('=');
    return {
      key: parts[0],
      value: parts[1],
    };
  });

  const result: any = {};
  resultArr.forEach(e => result[e.key] = e.value);
  return result;
};

export const queryArgsToString = (args: any) => {
  return args ? Object.keys(args).filter((k) => args[k] !== undefined).map((k) => `${k}=${args[k]}`).join('&') : null;
};

export const addQueryArgsToLocation = (location: string, queryArgs: any) => {
  const queryArgsString = queryArgsToString(queryArgs);

  if (location.indexOf('?') >= 0) {
    return `${location}&${queryArgsString}`;
  } else {
    return `${location}?${queryArgsString}`;
  }
};

export const AsyncQueryPaging = (props) => {
  const { pageSize } = props;
  const [historySearch, setHistorySearch] = useState<string>(window.location.search);
  const queryParams = getQueryParams(historySearch);

  const onPageChanged = (pageNumber: number) => {
    const newQueryArgs = {
      ...queryParams,
      __p: pageNumber,
      __s: pageSize,
    }
    const newLocation = addQueryArgsToLocation('', newQueryArgs)
    history.pushState({}, '', newLocation);
    setHistorySearch(newLocation);

    props.onPageChanged && props.onPageChanged(pageNumber);
  }

  const onReset = () => {
    history.replaceState({}, '', '');
    setHistorySearch('/');
  };

  const isInitialLoad = () => {
    return queryParams?.__p || 0;
  }

  useEffect(() => {

    const onHistoryChange = () => {
      setHistorySearch(window.location.search);
    };
    window.addEventListener('popstate', onHistoryChange);
    return () => window.removeEventListener('popstate', onHistoryChange)
  }, []);

  return (
    <AsyncPaging
      {...props}
      onPageChanged={onPageChanged}
      __onReset={onReset}
      __getInitialPage={isInitialLoad}
    />
  );
};

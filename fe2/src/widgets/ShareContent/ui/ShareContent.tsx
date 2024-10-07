/* eslint-disable no-useless-computed-key */
/* eslint-disable react/button-has-type */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */

import { Link, redirect, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';

import {
	fetchCollections,
	fetchFilters,
	loadFilteredCollections,
	loadSharedCollections,
	loadSortBy,
} from 'widgets/CollectionList/model/services/ActionCreators';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { Button } from 'shared/ui/Button/Button';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import ArrowIcon from '../../../shared/assets/icons/arrow-back.svg';
import { SearchBar } from '../../../features/SearchBar';
import { Select } from '../../../features/Select';
import { Filter } from '../../../features/Filter';
import { ShareItemCard } from '../../../entities/ShareItemCard';
import cls from './ShareContent.module.scss';
import { Paging } from 'components/paging';

interface ShareContentProps {
	className?: string;
}

function remove(array, item) {
	const index = array.findIndex((element) => element == item);
	array.splice(index, 1);
}

export function ShareContent({ className }: ShareContentProps) {
	const [data, setData] = useState<any[]>([]);
	const [filteredData, setFilteredData] = useState<any[]>(data);
	const [filters, setFilters] = useState<any[]>([]);
	const [checked, setChecked] = useState({});
	const [sorted, setSorted] = useState<string>('');
	const [itemCount, setItemCount] = useState<number>(0);
	const [inputValue, setInputValue] = useState<string>('');
	const [searchParams, setSearchParams] = useSearchParams();

	const selects = [];
	const deselects = [];

	const dispatch = useAppDispatch();
	const {
		collections,
		filteredCollections,
		filtersDisplayed,
		sortBy,
		isLoading,
		error,
	} = useAppSelector((state) => state.collectionReducer);

	const host = window.location.host.split('.');
	let search = '';
	if (host.length > 2 || host.includes('localhost:8000')) {
		search = host.shift();
	}

	const history = useNavigate();

	useEffect(() => {
		// dispatch(fetchCollections());
		dispatch(fetchFilters());
		// dispatch(loadSharedCollections(`?tenant=${search}`));
		dispatch(loadSharedCollections());
		dispatch(loadSortBy());
	}, [dispatch, search]);

	useEffect(() => {
		setData(collections);
		setFilters(filtersDisplayed);
		setFilteredData(filteredCollections);
	}, [collections, filtersDisplayed, filteredCollections]);

	const handleSelectChange = useCallback((event: any) => {
		setSorted(event.target.value);
	}, []);

	const handleSetSearchParams = useCallback(() => {
		setSearchParams({ ...checked, sortby: sorted || 'title' });
	}, [checked, sorted]);

	useEffect(() => {
		handleSetSearchParams();
	}, [handleSetSearchParams]);

	useEffect(() => {
		const url = searchParams.toString();
		history(`?${url}`);
	}, [searchParams]);

	function handleInputChange(event: any) {
		const cleanedUpQuery = event.target.value.trim().toLowerCase();
		console.log(cleanedUpQuery);
		if (cleanedUpQuery === '') {
			setFilteredData(data);
		} else {
			const updatedList = [...data].filter((x) =>
				x.name.toLowerCase().includes(cleanedUpQuery)
			);
			setFilteredData(updatedList);
		}
		setInputValue(event.target.value);
	}

	function cancel() {
		redirect(
			`${process.env.REACT_APP_API_URL}/imls/site-collections/shared-collections`
		);
	}

	function save() {
		axios
			.post(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker/`,
				null,
				{
					withCredentials: false,
					params: {
						share: selects,
						unshare: deselects,
					},
				}
			)
			.then(() => {
				setTimeout(() => {
					window.location.href = `${process.env.REACT_APP_API_URL}/imls/site-collections/shared-collections`;
				}, 1000);
			});
	}

	function select(id) {
		if (!selects.includes(id)) selects.push(id);
		if (deselects.includes(id)) remove(deselects, id);
		console.log(selects, deselects);
	}

	function deselect(id) {
		if (!deselects.includes(id)) deselects.push(id);
		if (selects.includes(id)) remove(selects, id);
		console.log(selects, deselects);
	}

	return (
		<div className={classNames(cls.allcollections, {}, [className])}>
			<h1 className={cls.allcollections_title}>Share Collections</h1>
			<div className={cls.search_block}>
				<SearchBar
					value={inputValue}
					onInputChange={handleInputChange}
					placeholder="Search Collections"
				/>
				<Select options={sortBy} onSelectChange={handleSelectChange} />
				<button className="btn btn-primary" onClick={save}>
					Save
				</button>
				<Link to="/imls/site-collections/shared-collections">
					<button
						className="btn btn-danger"
						onClick={cancel}
						style={{ borderRadius: '50%' }}>
						X
					</button>
				</Link>
			</div>
			<div className={cls.share_content}>
				{/* <Paging
          path="collections/site-collections/picker"
          done={(count) => setItemCount(count)}
          itemCount={itemCount}
          query
        >
          {(el) => {
            const data = JSON.parse(el);
            return <ShareItemCard key={data.id} collection={data} onSelect={select} onDeselect={deselect} />;
          }}
        </Paging> */}
			</div>
		</div>
	);
}

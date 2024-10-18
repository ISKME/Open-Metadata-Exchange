/* eslint-disable no-useless-computed-key */
/* eslint-disable react/button-has-type */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */

import { useLocation, useSearchParams } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { Button } from 'shared/ui/Button/Button';
import { ResourcesList } from 'widgets/ResourcesList';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import axios from 'axios';
import * as qs from 'query-string';
import ArrowIcon from '../../../shared/assets/icons/arrow-back.svg';
import { SearchBar } from '../../../features/SearchBar';
import { Select } from '../../../features/Select';
import { Filter } from '../../../features/Filter';
import cls from './SearchResources.module.scss';

let PAGE = 1;

let fSearch = '';
let fSubject = {};
let fSort = '';

function CircleLoader() {
	return (
		<div style={{ width: '100px', height: '100px' }}>
			<svg
				viewBox="0 0 50 50"
				width="100"
				height="100"
				style={{ transform: 'scale(-1) rotate(90deg)' }}>
				<circle
					cx="25"
					cy="25"
					r="20"
					fill="none"
					stroke="rgb(186 202 206)"
					strokeWidth="10"
				/>
				<circle
					className={cls.loader}
					cx="25"
					cy="25"
					r="20"
					fill="none"
					stroke="#93bfec"
					strokeWidth="10"
				/>
			</svg>
		</div>
	);
}

interface search_resourcesProps {
	className?: string;
}
export function SearchResources({ className }: search_resourcesProps) {
	const [resources, setResources] = useState<any[]>([]);
	const [filters, setFilters] = useState<any[]>([]);
	const [checked, setChecked] = useState({});
	const [sortBy, setSortBy] = useState<[]>([]);
	const [sorted, setSorted] = useState<string>('');
	const [totalNumber, setTotalNumber] = useState<number>(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const [inputValue, setInputValue] = useState<string>(
		searchParams.get('f.search')
	);
	const [hasAdd, setHasAdd] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	fSearch = inputValue;
	fSubject = checked;
	fSort = sorted;

	const { search } = useLocation();

	// useCallback ???
	const fetcher = async (queries) => {
		if (PAGE !== 1) {
			queries += `${queries ? '&' : '?'}page=${PAGE}`;
		}
		try {
			const endpoint = process.env.REACT_APP_API_URL;

			const { data } = await axios.get(
				`${endpoint}/api/imls/v2/resources/${queries}`
			);
			return data.resources;
		} catch (e) {
			return {};
		}
	};

	function update(key: any) {
		let queries = qs.parse(search);
		if (key === 'clear') queries = {};
		if (fSearch) queries['f.search'] = fSearch.toLowerCase();
		else delete queries['f.search'];
		if (key && fSubject[key]) queries[key] = fSubject[key];
		if (fSort) queries.sortby = fSort;
		setSearchParams(queries);
		if (key === 'append') {
			PAGE++;
		} else {
			setResources([]);
			PAGE = 1;
		}
		setIsLoading(true);
		fetcher(window.location.search.toString()).then((data) => {
			if (key === 'append') {
				if (!data) setHasAdd(false);
				else setResources(resources.concat(data.items));
			} else if (data) {
				setResources(data.items);
				setTotalNumber(data.pagination.count);
				setFilters(data.filters);
			}
			setIsLoading(false);
		});
	}

	useEffect(() => {
		fetcher(window.location.search.toString()).then(
			({ items, filters, pagination, sortByOptions }) => {
				setResources(items);
				setIsLoading(false);
				setSortBy(sortByOptions);
				setSorted(searchParams.get('sortby'));
				setTotalNumber(pagination.count);
				searchParams.delete('page');
				setFilters(filters);
				const params: any = qs.parse(search);
				for (const key in params) {
					if (!Array.isArray(params[key])) {
						params[key] = [params[key]];
					}
				}
				setChecked(params);
				// updatePath(null);
			}
		);
	}, []);

	const handleSelectChange = useCallback(({ target }) => {
		setSorted(target.value);
		fSort = target.value;
		update(null);
	}, []);

	const handleFilterChange = useCallback(
		(event: any) => {
			const slug = event.target.getAttribute('data-slug');
			const { value } = event.target;
			const updatedList = { ...checked };
			if (event.target.checked) {
				if (updatedList.hasOwnProperty(slug)) {
					updatedList[slug].push(value);
				} else {
					updatedList[slug] = [value];
				}
			} else {
				updatedList[slug]?.splice(updatedList[slug].indexOf(value), 1);
			}
			setChecked(updatedList);
			fSubject = updatedList || {};
			update(slug);
		},
		[checked]
	);

	const handleClearSearchParams = () => {
		setSearchParams('');
		setChecked({});
		setInputValue('');
	};

	function handleInputChange(event: any) {
		const cleanedUpQuery = event.target.value; // .trim(); // .toLowerCase();
		setInputValue(cleanedUpQuery);
		fSearch = cleanedUpQuery;
	}

	function handleSearching() {
		update(null);
	}

	function addMoreItems() {
		update('append');
	}

	function onPress({ key }) {
		if (key === 'Enter') {
			update(null);
		}
	}

	function clearing() {
		setInputValue('');
		fSearch = '';
		update(null);
	}

	return (
		<div className={classNames(cls.search_resources, {}, [className])}>
			<ArrowIcon className={cls.back_link_img} />
			<AppLink
				to="/imls/explore-oer-exchange"
				aria-label="Go Back to Explore OER Exchange"
				className={cls.back_link}
				text="Back to Explore OER Exchange"
			/>
			<h1 className={cls.search_resources_title}>Search</h1>
			<div className={cls.search_block}>
				<SearchBar
					value={inputValue}
					onInputChange={handleInputChange}
					placeholder="Search Individual Learning Materials"
					onKeyDown={onPress}
					onClear={clearing}
				/>
				<Button
					onClick={handleSearching}
					title="Search"
					className={cls.search_block_button}
				/>
				<Select
					options={sortBy}
					onSelectChange={handleSelectChange}
					initial={sorted}
				/>
			</div>
			{/* {isLoading && <h3>Loading...</h3>}
      {error && <h3>{error}</h3>} */}
			<div className={cls.search_resources_board}>
				<ul className={cls.filter_bar}>
					<h2 style={{ fontSize: '24px' }}>Filters</h2>
					{filters &&
						filters.map((el) => (
							<Filter
								key={el.name}
								filter={el}
								onFilterChange={handleFilterChange}
								checkMarks={checked}
							/>
						))}
					{/* <Button onClick={handleSubmit} title="Search" /> */}
					<Button
						onClick={handleClearSearchParams}
						title="Reset"
						style={{ backgroundColor: '#0e0f58', color: '#ffffff' }}
					/>
				</ul>
				<div className={cls.search_resources_list}>
					<span
						style={{
							position: 'absolute',
							top: '-24px',
						}}>{`${totalNumber} Resources`}</span>
					<ResourcesList resourcesData={resources} />
					{!isLoading && resources && resources.length === 0 && (
						<div className={cls.loaderContainer}>
							<span style={{ fontSize: '16px', color: '#474F60' }}>
								No results found.
							</span>
							<span style={{ fontSize: '12px', color: '#474F60' }}>
								Try adjusting your search or filter to find what you are looking
								for.
							</span>
						</div>
					)}
					{isLoading && (
						<div className={cls.loaderContainer}>
							<CircleLoader />
							Loading Materials...
						</div>
					)}
					{hasAdd && (
						<button onClick={() => addMoreItems()} className={cls.load_more}>
							+ Load More
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

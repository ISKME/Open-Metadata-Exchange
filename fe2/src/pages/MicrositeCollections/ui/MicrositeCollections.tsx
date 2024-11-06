/* eslint-disable react/jsx-no-bind */
import { useLocation, useSearchParams, useParams } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';

import { Button } from 'shared/ui/Button/Button';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import { Paging } from 'components/paging';
import * as qs from 'query-string';
import axios from 'axios';
import ArrowIcon from '../../../shared/assets/icons/arrow-back.svg';
import { SearchBar } from '../../../features/SearchBar';
import { Select } from '../../../features/Select';
import { Filter } from '../../../features/Filter';
import { CollectionItemCard } from '../../../entities/CollectionItemCard';
import cls from './MicrositeCollections.module.scss';
import { Link } from 'react-router-dom';

let fSearch = '';
let fSubject = {};
let fSort = '';

interface AllCollectionsProps {
	className?: string;
}

function debounce(func, wait) {
	let timeout;
	return function () {
		const context = this;
		const args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), wait);
	};
}

function throttle(func, delay) {
	let timeoutId = null;
	let lastArgs = null;
	const throttledFunction = function (...args) {
		lastArgs = args;
		if (!timeoutId) {
			timeoutId = setTimeout(() => {
				func.apply(this, lastArgs);
				timeoutId = null;
			}, delay);
		}
	};
	throttledFunction.cancel = function () {
		clearTimeout(timeoutId);
		timeoutId = null;
	};
	return throttledFunction;
}

const Breadcrumbs = () => {
	return (
		<div className={cls.navigation}>
			<div className={cls.frame}>
				<Link to="/imls/explore-oer-exchange">
					<div className={cls.div}>
						<div className={cls['frame-wrapper']}>
							<div className={cls.div}>
								<svg
									className={cls.vector}
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none">
									<path
										d="M1.6 3.2H0V14.4C0 15.28 0.72 16 1.6 16H12.8V14.4H1.6V3.2ZM14.4 0H4.8C3.92 0 3.2 0.72 3.2 1.6V11.2C3.2 12.08 3.92 12.8 4.8 12.8H14.4C15.28 12.8 16 12.08 16 11.2V1.6C16 0.72 15.28 0 14.4 0ZM12.8 1.6V5.6L11.6 4.9333L10.4 5.6V1.6H12.8ZM13.2 8.1333L11.2 6.9333L8.8 8.8L11.2 7.7333L13.6 8.8V1.6H13.3634L13.2 8.1333Z"
										fill="#FCFCFC"
									/>
								</svg>
								<div className={cls['sort-by']}>Explore</div>
							</div>
						</div>
						{/* <svg className={cls['arrow-drop-up']} xmlns="http://www.w3.org/2000/svg" width="23" height="16" viewBox="0 0 23 16" fill="none">
              <path d="M11.3318 6.33317L7.99845 9.6665L4.66512 6.33317L11.3318 6.33317Z" fill="#FCFCFC"/>
            </svg> */}
					</div>
				</Link>
				<svg
					className={cls.img}
					xmlns="http://www.w3.org/2000/svg"
					width="2"
					height="24"
					viewBox="0 0 2 24"
					fill="none">
					<path d="M1 0V24" stroke="white" />
				</svg>
				<Link to="/imls/browse">
					<div className={cls['sort-by-wrapper']}>
						<div className={cls['text-wrapper']}>Collections</div>
					</div>
				</Link>
			</div>
		</div>
	);
};

const MagnifyingGlassSolid = ({ color = '#1E1E1E', className }) => {
	return (
		<svg
			className={`${cls['magnifying-glass-solid-1']} ${className}`}
			fill="none"
			height="25"
			viewBox="0 0 24 25"
			width="24"
			xmlns="http://www.w3.org/2000/svg">
			<path
				className={cls['path']}
				d="M17.0163 10.8929C17.0163 12.4394 16.5143 13.868 15.6686 15.0271L19.9341 19.296C20.3553 19.7171 20.3553 20.4011 19.9341 20.8223C19.513 21.2434 18.829 21.2434 18.4078 20.8223L14.1423 16.5534C12.9833 17.4024 11.5547 17.9011 10.0082 17.9011C6.13682 17.9011 3 14.7643 3 10.8929C3 7.02159 6.13682 3.88477 10.0082 3.88477C13.8795 3.88477 17.0163 7.02159 17.0163 10.8929ZM10.0082 15.7447C10.6453 15.7447 11.2762 15.6192 11.8649 15.3754C12.4535 15.1316 12.9884 14.7742 13.4389 14.3237C13.8894 13.8731 14.2468 13.3383 14.4906 12.7496C14.7345 12.161 14.86 11.5301 14.86 10.8929C14.86 10.2558 14.7345 9.62486 14.4906 9.03622C14.2468 8.44757 13.8894 7.91271 13.4389 7.46218C12.9884 7.01165 12.4535 6.65427 11.8649 6.41044C11.2762 6.16662 10.6453 6.04112 10.0082 6.04112C9.37101 6.04112 8.7401 6.16662 8.15145 6.41044C7.5628 6.65427 7.02795 7.01165 6.57741 7.46218C6.12688 7.91271 5.7695 8.44757 5.52568 9.03622C5.28185 9.62486 5.15636 10.2558 5.15636 10.8929C5.15636 11.5301 5.28185 12.161 5.52568 12.7496C5.7695 13.3383 6.12688 13.8731 6.57741 14.3237C7.02795 14.7742 7.5628 15.1316 8.15145 15.3754C8.7401 15.6192 9.37101 15.7447 10.0082 15.7447Z"
				fill={color}
			/>
		</svg>
	);
};

export function MicrositeCollections({ className }: AllCollectionsProps) {
	const [filters, setFilters] = useState<any[]>([]);
	const [sortBy, setSortBy] = useState<[]>([]);
	const [sorted, setSorted] = useState<string>('');
	const [searchParams, setSearchParams] = useSearchParams();
	const [inputValue, setInputValue] = useState<string>(
		searchParams.get('f.search')
	);
	const [itemCount, setItemCount] = useState<number>(0);
	const [notFound, setNotFound] = useState<boolean>(false);
	const [path, setPath] = useState(
		`collections/browse/${window.location.search.toString()}`
	);

	fSearch = inputValue;
	fSort = sorted;

	const { name } = useParams();
	const { search } = useLocation();

	const [title, setTitle] = useState(name);
	const [tenantUrl, setTenantUrl] = useState('');

	const [checked, setChecked] = useState({});
	fSubject = checked;

	const fetcher = async () => {
		try {
			const { data } = await axios.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/browse`
			);
			return data.collections;
		} catch (e) {
			return {};
		}
	};

	useEffect(() => {
		fetcher().then(({ filters, sortByOptions }) => {
			setFilters(filters);
			setSortBy(sortByOptions);
			setSorted(searchParams.get('sortby'));
			updatePath(null);
			setTimeout(() => {
				setSearchParams({ tenant: [name] });
				setPath(`collections/browse/${window.location.search.toString()}`);
				setChecked({ tenant: [name] });
			}, 500);
		});
		axios
			.get(`${process.env.REACT_APP_API_URL}/api/imls/v2/microsites/${name}`)
			.then(({ data }) => {
				setTitle(data.name);
				setTenantUrl(data.url);
			});
	}, []);

	function updatePath(key: any) {
		let queries = qs.parse(search);
		if (key === 'clear') {
			queries = { tenant: [name] };
			fSubject = { tenant: [name] };
			setChecked({ tenant: [name] });
		} else {
			for (const tempKey in fSubject) {
				queries[tempKey] = fSubject[tempKey];
			}
			if (key && fSubject[key]) queries[key] = fSubject[key];
		}
		if (fSearch) queries['f.search'] = fSearch.toLowerCase();
		else delete queries['f.search'];
		if (fSort) queries.sortby = fSort;
		setSearchParams(queries);
		setPath(`collections/browse/${window.location.search.toString()}`);
	}

	const handleSelectChange = useCallback(({ target }) => {
		setSorted(target.value);
		fSort = target.value;
		updatePath(null);
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
			} else if (updatedList[slug]) {
				updatedList[slug]?.splice(updatedList[slug].indexOf(value), 1);
			}
			setChecked(updatedList);
			fSubject = updatedList || {};
			updatePath(slug);
		},
		[checked]
	);

	const searcher = debounce(() => {
		updatePath(null);
	}, 3000);

	function handleInputChange(event: any) {
		const cleanedUpQuery = event.target.value;
		setInputValue(cleanedUpQuery);
		fSearch = cleanedUpQuery;
		// searcher();
		// updatePath(null);
	}

	function handleSearching() {
		updatePath(null);
	}

	const handleClearSearchParams = () => {
		updatePath('clear');
	};

	function onPress({ key }) {
		if (key === 'Enter') {
			updatePath(null);
		}
	}

	return (
		<div className={classNames(cls.allcollections, {}, [className])}>
			<div className={cls['breadcrumb']}>
				<div className={cls['breadcrumbs']}>
					<Breadcrumbs />
				</div>
				<MagnifyingGlassSolid
					className={cls['square-up-right']}
					color="#1E1E1E"
				/>
			</div>
			{/* <ArrowIcon /> */}
			{/* <AppLink to="/imls/explore-oer-exchange" aria-label="Go Back to Explore OER Exchange" className={cls.back_link} text="Back to Explore OER Exchange" /> */}
			<h1 className={cls.allcollections_title}>{title} Collections</h1>
			<h5 className={cls.allcollections_desc}>
				All of the collections shared to the OER Exchange by{' '}
				<a href={`${tenantUrl}`}>{title}</a>
			</h5>
			<div className={cls.search_block}>
				<SearchBar
					value={inputValue}
					onInputChange={handleInputChange}
					placeholder="Search Collections"
					onKeyDown={onPress}
					onClear={() => updatePath(null)}
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
			<div className={cls.allcollections_board}>
				<ul className={cls.filter_bar}>
					<h6>Filters</h6>
					{filters &&
						filters.map((el) => (
							<Filter
								key={el.name}
								filter={el}
								onFilterChange={handleFilterChange}
								checkMarks={checked}
							/>
						))}
					<Button
						onClick={handleClearSearchParams}
						title="Reset"
						className={cls.reset}
					/>
				</ul>
				<Paging
					key={path}
					path={path}
					done={(count, _filters, _sortByOptions) => {
						setItemCount(count);
						setNotFound(count === 0);
					}}
					itemCount={itemCount}
					pageSize={9}
					styles={{
						display: 'grid',
						width: '70%',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gridAutoRows: 'min-content',
					}}>
					{(el, i) => {
						const data = JSON.parse(el);
						return (
							<CollectionItemCard key={`${data.id}-${i}`} collection={data} />
						);
					}}
				</Paging>
				{notFound && (
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
			</div>
		</div>
	);
}

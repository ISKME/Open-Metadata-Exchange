/* eslint-disable no-useless-computed-key */
/* eslint-disable react/button-has-type */
/* eslint-disable array-callback-return */
/* eslint-disable no-console */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable eqeqeq */

import {
	useLocation,
	useParams,
	useSearchParams,
	useNavigate,
} from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from 'shared/lib/classNames/classNames';
import { Button } from 'shared/ui/Button/Button';
import { ResourcesList } from 'widgets/ResourcesList';
import { Collapse } from 'widgets/Metadata/Collapse';
import { Dropdown } from 'widgets/Metadata/Dropdown';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import axios from 'axios';
import * as qs from 'query-string';
import ArrowIcon from '../../../shared/assets/icons/arrow-back.svg';
import { SearchBar } from '../../../features/SearchBar';
import { Select } from '../../../features/Select';
import { Filter } from '../../../features/Filter';
import cls from './SearchResources.module.scss';
import { CollectionHeader } from 'widgets/CollectionHeader';
import { CollectionItemCard } from 'entities/CollectionItemCard';

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

const compute = (obj) =>
	Object.values(obj).filter((item) => item === null).length;

export function CollectionDetails({ className }: search_resourcesProps) {
	const [resources, setResources] = useState<any[]>([]);
	const [filters, setFilters] = useState<any[]>([]);
	const [sortBy, setSortBy] = useState<[]>([]);
	const [sorted, setSorted] = useState<string>('');
	const [totalNumber, setTotalNumber] = useState<number>(0);
	const [searchParams, setSearchParams] = useSearchParams();
	const [inputValue, setInputValue] = useState<string>(
		searchParams.get('f.search')
	);
	const [hasAdd, setHasAdd] = useState<boolean>(true);
	const [collectionName, setCollectionName] = useState('');
	const [collectionMicrositeName, setCollectionMicrositeName] = useState('');
	const [numResources, setNumResources] = useState(0);
	const [educationLevels, setEducationLevels] = useState([]);
	const [updatedOn, setUpdatedOn] = useState(0);
	const [thumbnail, setThumbnail] = useState('');
	const [abstract, setAbstract] = useState('');
	const [micrositeSlug, setMicrositeSlug] = useState('');
	const [clientInfo, setClientInfo] = useState('');
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [checked, setChecked] = useState({});
	const [subscribed, setSubscribed] = useState(false);
	const [done, setDone] = useState(false);
	const [map, setMap] = useState(false);
	const [ready, setReady] = useState(false);
	const [progress, setProgress] = useState(0);
	const [sections, setSections] = useState([]);
	const [changes, setChanges] = useState({});
	const [stats, setStats] = useState({});

	fSearch = inputValue;
	fSubject = checked;
	fSort = sorted;

	const { search } = useLocation();
	const { name, id } = useParams();

	// useCallback ???
	const fetcher = async (queries) => {
		if (PAGE !== 1) {
			queries += `${queries ? '&' : '?'}page=${PAGE}`;
		}
		try {
			const { data } = await axios.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/${name}/${id}/resources${queries}`
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
			}
			setIsLoading(false);
		});
	}

	useEffect(() => {
		fetcher(window.location.search.toString()).then(
			({ items, filters, pagination, sortByOptions }) => {
				setResources(items);
				setIsLoading(false);
				setFilters(filters);
				setSortBy(sortByOptions);
				setSorted(searchParams.get('sortby'));
				setTotalNumber(pagination.count);
				searchParams.delete('page');
				// updatePath(null);
				const checks = {}; // Object.fromEntries
				Array.from(searchParams.entries())
					.filter((item) => !['f.search', 'sortby'].includes(item[0]))
					.forEach((item) => {
						const [key, val] = item;
						if (checks[key]) checks[key].push(val);
						else checks[key] = [val];
					});
				setChecked(checks);
			}
		);
		axios
			.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/${name}/${id}`
			)
			.then(({ data }) => {
				const {
					abstract,
					educationLevels,
					micrositeName,
					name,
					thumbnail,
					updatedOn,
					numResources,
					micrositeSlug,
					subscribed,
					// numSubscribers,
					// numAlerts,
					// isShared,
					id,
				} = data.collection;
				setCollectionName(name);
				setCollectionMicrositeName(micrositeName);
				setNumResources(numResources);
				setEducationLevels(educationLevels);
				setUpdatedOn(updatedOn);
				setThumbnail(thumbnail);
				setAbstract(abstract);
				setMicrositeSlug(micrositeSlug);
				setSubscribed(subscribed);
				setClientInfo(data.clientInfo?.name);

				if (window.location.hash === '#mapping') {
					if (subscribed) {
						setDone(true);
					}
				}
			});
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
				console.log(updatedList, slug, checked);
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

	function save(slug, data) {
		axios
			.post(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/metadata/mapping/${micrositeSlug}/collections/${id}`,
				{
					[slug]: data.reduce((ac, a) => ({ ...ac, [a[0]]: a[1] }), {}),
				}
			)
			.then(console.log)
			.catch(console.log);
	}

	useEffect(() => {
		if (!done) return () => {};
		const fetchData = async () => {
			axios
				.get(
					`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/${micrositeSlug}/${id}/status`
				)
				.then(({ data }) => {
					if (data.replication_status === 'completed') {
						setReady(true);
						clearInterval(interval);
					} else if (data.progress_info && Number(data.progress_info.total)) {
						const { total, transferred } = data.progress_info;
						setProgress(Number(transferred) / Number(total));
					}
				});
		};
		const interval = setInterval(fetchData, 10000);
		fetchData();
		return () => clearInterval(interval);
	}, [done]);

	useEffect(() => {
		if (ready) {
			axios
				.get(
					`${process.env.REACT_APP_API_URL}/api/imls/v2/metadata/mapping/${micrositeSlug}/collections/${id}`
				)
				.then(({ data }) => {
					const { sections } = data;
					const changes = {};
					const stats = {};
					setSections(sections);
					for (const item of sections) {
						Object.keys(item.mapping).forEach((key) => {
							if (!changes[item.name]) changes[item.name] = {};
							if (item.mapping[key].length > 0) {
								changes[item.name][key] = item.mapping[key][0];
							} else {
								changes[item.name][key] = null;
							}
						});
					}
					for (const key in changes) {
						stats[key] = compute(changes[key]);
					}
					setChanges(changes);
					setStats(stats);
					if (window.location.hash === '#meta') {
						document.getElementById('meta').scrollIntoView();
					}
				});
		}
	}, [ready]);

	const navigate = useNavigate();

	return (
		<div className={classNames(cls.search_resources, {}, [className])}>
			<ArrowIcon className={cls.back_link_img} />
			<AppLink
				to="/imls/explore-oer-exchange"
				aria-label="Go Back to Explore OER Exchange"
				className={cls.back_link}
				text="Back to Explore OER Exchange"
			/>
			{!done && (
				<div>
					<CollectionHeader
						id={id}
						subscribed={subscribed}
						thumbnail={thumbnail}
						name={collectionName}
						abstract={abstract}
						micrositeName={collectionMicrositeName}
						micrositeSlug={micrositeSlug}
						numResources={numResources}
						educationLevels={educationLevels}
						updatedOn={updatedOn}
						onDone={() => setDone(true)}
					/>
					<h1 className={cls.search_resources_title}>Search</h1>
					<div className={cls.search_block}>
						<SearchBar
							value={inputValue}
							onInputChange={handleInputChange}
							placeholder="Search Individual Learning Materials"
							onKeyDown={onPress}
							onClear={() => update(null)}
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
									<span style={{ fontSize: '18px', color: '#474F60' }}>
										No materials found!
									</span>
									<span style={{ fontSize: '16px', color: '#474F60' }}>
										Try adjusting your search or filter to find what you are
										looking for.
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
								<button
									onClick={() => addMoreItems()}
									className={cls.load_more}>
									+ Load More
								</button>
							)}
						</div>
					</div>
				</div>
			)}
			{done && (
				<div className={cls['dynamic-content']}>
					<div
						className={cls['back']}
						onClick={() => {
							setDone(false);
							setMap(false);
						}}>
						<svg
							className={cls['arrow-left-solid']}
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="16"
							viewBox="0 0 14 16"
							fill="none">
							<path
								d="M0.292969 7.29414C-0.0976562 7.68477 -0.0976562 8.31914 0.292969 8.70977L5.29297 13.7098C5.68359 14.1004 6.31797 14.1004 6.70859 13.7098C7.09922 13.3191 7.09922 12.6848 6.70859 12.2941L3.41172 9.00039H12.9992C13.5523 9.00039 13.9992 8.55352 13.9992 8.00039C13.9992 7.44727 13.5523 7.00039 12.9992 7.00039H3.41484L6.70547 3.70664C7.09609 3.31602 7.09609 2.68164 6.70547 2.29102C6.31484 1.90039 5.68047 1.90039 5.28984 2.29102L0.289844 7.29102L0.292969 7.29414Z"
								fill="#054DD1"
							/>
						</svg>
						<div className={cls['text-wrapper']}>Back</div>
					</div>
					<div className={cls['content']}>
						<div className={cls['frame']}>
							<div className={cls['div']}>
								<div className={cls['frame-2']}>
									<svg
										className={cls['icon']}
										xmlns="http://www.w3.org/2000/svg"
										width="21"
										height="25"
										viewBox="0 0 21 25"
										fill="none">
										<g clip-path="url(#clip0_442_1864)">
											<path
												d="M20.5594 8.00173C21.1453 7.4158 21.1453 6.46423 20.5594 5.8783L16.0594 1.3783C15.4734 0.792358 14.5219 0.792358 13.9359 1.3783C13.35 1.96423 13.35 2.9158 13.9359 3.50173L15.8766 5.44236H1.5C0.670312 5.44236 0 6.11267 0 6.94236C0 7.77205 0.670312 8.44236 1.5 8.44236H15.8766L13.9359 10.383C13.35 10.9689 13.35 11.9205 13.9359 12.5064C14.5219 13.0924 15.4734 13.0924 16.0594 12.5064L20.5594 8.00642V8.00173ZM4.93594 24.5017C5.52188 25.0877 6.47344 25.0877 7.05938 24.5017C7.64531 23.9158 7.64531 22.9642 7.05938 22.3783L5.12344 20.4424H19.5C20.3297 20.4424 21 19.772 21 18.9424C21 18.1127 20.3297 17.4424 19.5 17.4424H5.12344L7.06406 15.5017C7.65 14.9158 7.65 13.9642 7.06406 13.3783C6.47812 12.7924 5.52656 12.7924 4.94063 13.3783L0.440625 17.8783C-0.145313 18.4642 -0.145313 19.4158 0.440625 20.0017L4.94063 24.5017H4.93594Z"
												fill="#34B53A"
											/>
										</g>
										<defs>
											<clipPath id="clip0_442_1864">
												<rect
													width="21"
													height="24"
													fill="white"
													transform="translate(0 0.942383)"
												/>
											</clipPath>
										</defs>
									</svg>
									<div className={cls['text-wrapper-2']}>
										Exchange Successful
									</div>
								</div>
								<div className={cls['frame-3']}>
									<p className={cls['you-published-a-new']}>
										<span className={cls['span']}>
											You published a new collection to{' '}
										</span>
										<span className={cls['text-wrapper-3']}>{clientInfo} </span>
										<span className={cls['span']}>by subscribing.</span>
									</p>
									<p className={cls['any-changes-pushed']}>
										<span className={cls['text-wrapper-4']}>
											Any changes pushed to this content by{' '}
										</span>
										<span className={cls['text-wrapper-5']}>
											{collectionMicrositeName}
										</span>
										<span className={cls['text-wrapper-4']}>
											{' '}
											are automatically synced to{' '}
										</span>
										<span className={cls['text-wrapper-5']}>{clientInfo}</span>
										<span className={cls['text-wrapper-4']}>.</span>
									</p>
								</div>
							</div>
							{!map && (
								<div className={cls['frame-4']}>
									<CollectionItemCard
										collection={{
											micrositeName: collectionMicrositeName,
											numResources,
											thumbnail,
											name: collectionName,
											micrositeSlug,
											id: '',
											educationLevels,
										}}
									/>
									{ready && (
										<div className={cls['frame-5']}>
											<div
												className={cls['button']}
												onClick={() =>
													/*navigate('/imls/site-collections/subscribed-preferences/#meta')*/ setMap(
														true
													)
												}>
												<p className={cls['label-text']}>
													Map Metadata in the OER Exchange
												</p>
											</div>
										</div>
									)}
									{!ready && (
										<>
											<div className={cls.progress}>
												<div
													className={cls.progressBar}
													style={{ width: `${progress * 100}%` }}></div>
												<span>TRANSFERRING</span>
											</div>
											<p style={{ textAlign: 'center', width: '100%' }}>
												We're getting your new collection ready!
												<br />
												We'll email you when the process is complete.
											</p>
										</>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			)}
			{map && (
				<div
					style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
					className={cls.empty}>
					<h3>Map your Metadata Standards</h3>
					<p>Select your preferred metadata to map for each metadata item.</p>
					<div
						style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
						{sections.map((section) => (
							<Collapse number={stats[section.name]} title={section.name}>
								<div className={cls['preferences-values']}>
									<div className={cls['section-content']}>
										<div className={cls['frame']}>
											<div className={cls['text-wrapper']}>
												New Unmapped Values
											</div>
										</div>
										<div className={cls['div']}>
											<div className={cls['frame-2']}>
												<div className={cls['div-wrapper']}>
													<div className={cls['text-wrapper-2']}>
														OER Exchange {section.name}
													</div>
												</div>
												<div className={cls['frame-wrapper']}>
													<div className={cls['frame-3']}>
														<div className={cls['text-wrapper-2']}>
															Your {section.name}
														</div>
													</div>
												</div>
												{/* <div className={cls['frame-4']}>
                          <div className={cls['microsite']}>Also use as keyword</div>
                          <div className={cls['frame-5']}>
                            <div className={cls['microsite-2']}>Select All</div>
                            <div className={cls['microsite-2']}>Clear All</div>
                          </div>
                        </div> */}
											</div>
											<div className={cls['frame-6']}>
												{Object.entries(section.mapping).map((item) => (
													<div className={cls['frame-2']}>
														<div className={cls['frame-7']}>
															<div className={cls['frame-8']}>
																<div className={cls['text-wrapper-3']}>
																	{item[0]}
																</div>
															</div>
														</div>
														<div className={cls['frame-wrapper']}>
															<Dropdown
																keyword={section.name}
																list={section.metadata}
																initial={item[1][0]}
																onSelect={(selected) => {
																	const temp = changes;
																	temp[section.name][item[0]] = selected;
																	setChanges(temp);
																	const stats = {};
																	for (const key in changes) {
																		stats[key] = compute(changes[key]);
																	}
																	setChanges(changes);
																	setStats(stats);
																}}
															/>
														</div>
														{/* <div className={cls['property-unchecked-wrapper']}>
                              <div className={cls['property-unchecked']}><div className={cls['rectangle']}></div></div>
                            </div> */}
													</div>
												))}
											</div>
										</div>
									</div>
									<button
										className={cls['button']}
										style={{
											border: '2px solid #1E1E1E',
											background: '#054DD1',
											color: 'white',
											cursor: 'pointer',
										}}
										onClick={() => {
											save(
												section.slug,
												Object.entries(changes[section.name]).filter(
													(item) => item[1]
												)
											);
											if (stats[section.name] === 0)
												setStats({ ...stats, [section.name]: -1 });
										}}>
										<div
											className={cls['label-text']}
											style={{ color: 'white' }}>
											Save and Update Map
										</div>
									</button>
								</div>
							</Collapse>
						))}
					</div>
					{/* <div className={cls['buttons-frame']}>
            <div className={cls['div']}>
              <button className={cls['button']}><div className={cls['label-text']}>Download Map</div></button>
              <button className={cls['label-text-wrapper']}><div className={cls['text-wrapper']}>Upload Map</div></button>
            </div>
            <div className={cls['button-wrapper']}>
              <button className={cls['div-wrapper']}><div className={cls['label-text-2']}>Accept Metadata Mapping Structure</div></button>
            </div>
          </div> */}
				</div>
			)}
		</div>
	);
}

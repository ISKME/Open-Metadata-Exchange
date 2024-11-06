/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-console */
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { Portal } from 'features/Portal';
import { classNames } from 'shared/lib/classNames/classNames';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLink } from 'shared/ui/AppLink/AppLink';
import { SearchBar } from 'features/SearchBar';
import { Button } from 'shared/ui/Button/Button';
import { Breadcrumb } from 'components/breadcrumb';
import { CollectionItemCard } from 'entities/CollectionItemCard';
import axios from 'axios';
import cls from './Home.module.scss';

interface HomeProps {
	className?: string;
}

const styles = `
.react-daterange-picker {
  display: inline-flex;
  position: relative;
  font-family: Open Sans;
}

.react-daterange-picker,
.react-daterange-picker *,
.react-daterange-picker *:before,
.react-daterange-picker *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.react-daterange-picker--disabled {
  background-color: #f0f0f0;
  color: #6d6d6d;
}

.react-daterange-picker__wrapper {
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #000;
  background: #FCFCFC;
}

.react-daterange-picker__inputGroup {
  min-width: calc((4px * 3) + 0.54em * 8 + 0.217em * 2);
  height: 100%;
  flex-grow: 1;
  padding: 0 2px;
  box-sizing: content-box;
}

.react-daterange-picker__inputGroup__divider {
  padding: 1px 0;
  white-space: pre;
}

.react-daterange-picker__inputGroup__divider,
.react-daterange-picker__inputGroup__leadingZero {
  display: inline-block;
}

.react-daterange-picker__inputGroup__input {
  min-width: 0.54em;
  height: 100%;
  position: relative;
  padding: 0 1px;
  border: 0;
  background: none;
  color: currentColor;
  font: inherit;
  box-sizing: content-box;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.1px;
  box-shadow: none;
}

.react-daterange-picker__inputGroup__input::-webkit-outer-spin-button,
.react-daterange-picker__inputGroup__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  margin: 0;
}

.react-daterange-picker__inputGroup__input:invalid {
  background: rgba(255, 0, 0, 0.1);
}

.react-daterange-picker__inputGroup__input--hasLeadingZero {
  margin-left: -0.54em;
  padding-left: calc(1px + 0.54em);
}

.react-daterange-picker__button {
  border: 0;
  background: transparent;
  padding: 4px 6px;
}

.react-daterange-picker__button:enabled {
  cursor: pointer;
}

.react-daterange-picker__button:enabled:hover .react-daterange-picker__button__icon,
.react-daterange-picker__button:enabled:focus .react-daterange-picker__button__icon {
  stroke: #0078d7;
}

.react-daterange-picker__button:disabled .react-daterange-picker__button__icon {
  stroke: #6d6d6d;
}

.react-daterange-picker__button svg {
  display: inherit;
}

.react-daterange-picker__calendar {
  width: 350px;
  max-width: 100vw;
  z-index: 1;
}

.react-daterange-picker__calendar--closed {
  display: none;
}

.react-daterange-picker__calendar .react-calendar {
  border-width: thin;
}

.react-calendar {
  width: 350px;
  max-width: 100%;
  background: white;
  border: 1px solid #a0a096;
  font-family: Arial, Helvetica, sans-serif;
  line-height: 1.125em;
}

.react-calendar--doubleView {
  width: 700px;
}

.react-calendar--doubleView .react-calendar__viewContainer {
  display: flex;
  margin: -0.5em;
}

.react-calendar--doubleView .react-calendar__viewContainer > * {
  width: 50%;
  margin: 0.5em;
}

.react-calendar,
.react-calendar *,
.react-calendar *:before,
.react-calendar *:after {
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.react-calendar button {
  margin: 0;
  border: 0;
  outline: none;
}

.react-calendar button:enabled:hover {
  cursor: pointer;
}

.react-calendar__navigation {
  display: flex;
  height: 44px;
  margin-bottom: 1em;
}

.react-calendar__navigation button {
  min-width: 44px;
  background: none;
}

.react-calendar__navigation button:disabled {
  background-color: #f0f0f0;
}

.react-calendar__navigation button:enabled:hover,
.react-calendar__navigation button:enabled:focus {
  background-color: #e6e6e6;
}

.react-calendar__month-view__weekdays {
  text-align: center;
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.75em;
}

.react-calendar__month-view__weekdays__weekday {
  padding: 0.5em;
}

.react-calendar__month-view__weekNumbers .react-calendar__tile {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
  font-weight: bold;
}

.react-calendar__month-view__days__day--weekend {
  color: #d10000;
}

.react-calendar__month-view__days__day--neighboringMonth {
  color: #757575;
}

.react-calendar__year-view .react-calendar__tile,
.react-calendar__decade-view .react-calendar__tile,
.react-calendar__century-view .react-calendar__tile {
  padding: 2em 0.5em;
}

.react-calendar__tile {
  max-width: 100%;
  padding: 10px 6.6667px;
  background: none;
  text-align: center;
  line-height: 16px;
}

.react-calendar__tile:disabled {
  background-color: #f0f0f0;
}

.react-calendar__tile:enabled:hover,
.react-calendar__tile:enabled:focus {
  background-color: #e6e6e6;
}

.react-calendar__tile--now {
  background: #ffff76;
}

.react-calendar__tile--now:enabled:hover,
.react-calendar__tile--now:enabled:focus {
  background: #ffffa9;
}

.react-calendar__tile--hasActive {
  background: #76baff;
}

.react-calendar__tile--hasActive:enabled:hover,
.react-calendar__tile--hasActive:enabled:focus {
  background: #a9d4ff;
}

.react-calendar__tile--active {
  background: #006edc;
  color: white;
}

.react-calendar__tile--active:enabled:hover,
.react-calendar__tile--active:enabled:focus {
  background: #1087ff;
}

.react-calendar--selectRange .react-calendar__tile--hover {
  background-color: #e6e6e6;
}
`;

function Check({ id, label, checked = false, onChange = () => {} }) {
	// , name, value, children
	return (
		<div className={cls.check}>
			<input id={id} type="checkbox" checked={checked} onChange={onChange} />
			<label htmlFor={id}>{label}</label>
		</div>
	);
}

const openFreshdesk = () => {
	(window as any)?.FreshWidget?.show();
};

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Welcome = ({ name }) => {
	const navigate = useNavigate();
	return (
		<div className={cls['snackbar-but-cooler']}>
			<div className={cls.text}>
				<svg
					className={cls.ello}
					xmlns="http://www.w3.org/2000/svg"
					width="47"
					height="49"
					viewBox="0 0 47 49"
					fill="none">
					<g clip-path="url(#clip0_43_2681)">
						<path
							d="M23.25 1.1924C10.4091 1.1924 0 11.6015 0 24.4424C0 37.2833 10.4091 47.6924 23.25 47.6924C36.0909 47.6924 46.5 37.2833 46.5 24.4424C46.5 11.6015 36.0909 1.1924 23.25 1.1924ZM36.735 27.9299C35.1853 34.0527 29.6053 38.3924 23.25 38.3924C16.8947 38.3924 11.3147 34.0527 9.765 27.9299C9.61031 27.2324 9.9975 26.4571 10.695 26.3024C11.3925 26.1477 12.1678 26.5349 12.3225 27.2324C13.6397 32.1927 18.135 35.6802 23.25 35.6802C28.365 35.6802 32.8603 32.1927 34.1775 27.2324C34.3322 26.5349 35.1075 26.0699 35.805 26.3024C36.5025 26.4571 36.9675 27.2324 36.735 27.9299Z"
							fill="#054DD1"
						/>
					</g>
					<defs>
						<clipPath id="clip0_43_2681">
							<rect
								width="46.5"
								height="48"
								fill="white"
								transform="translate(0 0.442398)"
							/>
						</clipPath>
					</defs>
				</svg>
				<div className={cls.frame}>
					<div className={cls['text-wrapper']}>Welcome back {name}</div>
					<p className={cls.subhead}>
						Add collections and resources to your microsite from nationwide
						digital libraries sharing on the OER Exchange.
					</p>
				</div>
			</div>
			<div className={cls['button-wrapper']}>
				<div
					className={cls.button}
					onClick={() => navigate('/imls/site-collections/main')}>
					<p className={cls['label-text']}>View your OER content Library</p>
				</div>
			</div>
		</div>
	);
};

const News = () => (
	<div className={cls.news}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="28"
			height="24"
			viewBox="0 0 28 24"
			fill="none">
			<g clip-path="url(#clip0_43_2693)">
				<path
					d="M12.2 22.1016C12.7063 22.2797 13.25 21.9094 13.25 21.375V3.68437C13.25 3.4875 13.175 3.29062 13.0156 3.16875C12.0969 2.4375 9.9875 1.5 7.25 1.5C4.88281 1.5 2.67031 2.12344 1.34844 2.62969C0.81875 2.83594 0.5 3.36094 0.5 3.92813V21.2859C0.5 21.8438 1.1 22.2328 1.62969 22.0594C3.10625 21.5672 5.44531 21 7.25 21C8.83906 21 10.9531 21.6562 12.2 22.1016ZM15.8 22.1016C17.0469 21.6562 19.1609 21 20.75 21C22.5547 21 24.8938 21.5672 26.3703 22.0594C26.9 22.2375 27.5 21.8438 27.5 21.2859V3.92813C27.5 3.36094 27.1813 2.83594 26.6516 2.63438C25.3297 2.12344 23.1172 1.5 20.75 1.5C18.0125 1.5 15.9031 2.4375 14.9844 3.16875C14.8297 3.29062 14.75 3.4875 14.75 3.68437V21.375C14.75 21.9094 15.2984 22.2797 15.8 22.1016Z"
					fill="#FCFCFC"
				/>
			</g>
			<defs>
				<clipPath id="clip0_43_2693">
					<rect
						width="27"
						height="24"
						fill="white"
						transform="translate(0.5)"
					/>
				</clipPath>
			</defs>
		</svg>
		<p>What’s New in the OER Exchange</p>
	</div>
);

export function Home({ className }: HomeProps) {
	const [inputValue, setInputValue] = useState<string>('');
	const [data, setData] = useState<any>();
	const [date, setDate] = useState<Value>(null); // ([new Date('2000'), new Date()]);
	const [isVisible, setIsVisible] = useState(false);
	const [subjects, setSubjects] = useState([]);
	const [levels, setLevels] = useState([]);
	const [tenants, setTenants] = useState([]);
	const [subjectCheckStates, setSubjectCheckStates] = useState([]);
	const [levelCheckStates, setLevelCheckStates] = useState([]);
	const [tenantCheckStates, setTenantCheckStates] = useState([]);
	const [subjectFilter, setSubjectFilter] = useState('');
	const [levelFilter, setLevelFilter] = useState('');
	const [tenantFilter, setTenantFilter] = useState('');
	const [name, setName] = useState('');
	const [searchParams, setSearchParams] = useSearchParams();

	const updateFilters = () => {
		try {
			axios
				.get(
					`${
						process.env.REACT_APP_API_URL
					}/api/imls/v2/resources${window.location.search.toString()}`
				)
				.then(({ data }) => {
					const subjectItems = data.resources.filters.find(
						(filter) => filter.keyword === 'f.general_subject'
					)?.items;
					setSubjects(subjectItems);
					const levelItems = data.resources.filters.find(
						(filter) => filter.keyword === 'f.sublevel'
					)?.items;
					setLevels(levelItems);
					const tenantsItems = data.resources.filters.find(
						(filter) => filter.keyword === 'tenant'
					)?.items;
					setTenants(tenantsItems);
					if (!subjectCheckStates.length) {
						setSubjectCheckStates(
							subjectItems.map((item) => ({ id: item.slug, checked: false }))
						);
					}
					if (!levelCheckStates.length) {
						setLevelCheckStates(
							levelItems.map((item) => ({ id: item.slug, checked: false }))
						);
					}
					if (!tenantCheckStates.length) {
						setTenantCheckStates(
							tenantsItems.map((item) => ({ id: item.slug, checked: false }))
						);
					}
				});
		} catch (err) {
			if (err.response) {
				console.log(err.response.data);
				// The client was given an error response (5xx, 4xx)
			} else if (err.request) {
				console.log(err.request);
				// The client never received a response, and the request was never left
			} else {
				console.log(err);
				// Anything else
			}
		}
	};

	useEffect(() => {
		const styleTag = document.createElement('style');
		styleTag.textContent = styles;
		document.head.appendChild(styleTag);
		axios
			.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/browse/?sortby=timestamp&per_page=3`
			)
			.then(({ data }) => {
				console.log(data);
				setData(data.collections.items);
				setName(data.userInfo.name || data.userInfo.email);
			});
		updateFilters();
	}, []);

	const navigate = useNavigate();

	const nav = () => {
		const params = {
			'f.general_subject': subjectCheckStates
				.filter((subject) => subject.checked)
				.map((subject) => subject.id),
			'f.sublevel': levelCheckStates
				.filter((level) => level.checked)
				.map((level) => level.id),
			tenant: tenantCheckStates
				.filter((tenant) => tenant.checked)
				.map((tenant) => tenant.id),
			'f.search': inputValue,
		};
		if (date && date[0]) {
			params['f.date_gte'] = date[0].toISOString().substring(0, 10);
			params['f.date_lte'] = date[1].toISOString().substring(0, 10);
		}
		setSearchParams(params);
	};

	function onPress({ key }) {
		if (key === 'Enter') {
			nav();
			navigate(
				`${
					process.env.REACT_APP_API_URL
				}/imls/search/${window.location.search.toString()}`
			);
		}
	}

	const clear = () => {
		setSubjectCheckStates(
			subjectCheckStates.map((subject) => ({ ...subject, checked: false }))
		);
		setLevelCheckStates(
			levelCheckStates.map((level) => ({ ...level, checked: false }))
		);
		setTenantCheckStates(
			tenantCheckStates.map((tenant) => ({ ...tenant, checked: false }))
		);
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
		//   nav();
		//   updateFilters();
	}
	const apply = () => {
		setIsVisible(false);
		nav();
	};

	return (
		<div className={classNames(cls.Home, {}, [className])}>
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
					}}>
					<div className={cls['list-dialog']}>
						<div className={cls.content1}>
							{/* <StyleOutlined className="style-outlined" color="#1E1E1E" /> */}
							<div
								style={{
									position: 'absolute',
									right: '24px',
									top: '24px',
									cursor: 'pointer',
									zIndex: 100,
								}}
								onClick={() => setIsVisible(false)}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none">
									<path
										d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
										fill="#1E1E1E"
									/>
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
								<p className={cls['body-text']}>
									Added to the OER Exchange Date Range
								</p>
								<DateRangePicker onChange={setDate} value={date} />
							</div>
							<div className={cls.div}>
								<div className={cls['collection-owner']}>
									<div className={cls['content-2']}>
										<div className={cls['body-text-2']}>
											<input
												type="text"
												placeholder="Collection Owner"
												value={tenantFilter}
												onChange={({ target }) => setTenantFilter(target.value)}
											/>
										</div>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none">
											<path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
										</svg>
									</div>
									<div className={cls.divider} />
									<div className={cls.values} style={{ height: '172px' }}>
										{tenants
											.filter(
												(item) =>
													item.name &&
													item.name.toLowerCase().includes(tenantFilter)
											)
											.map((item, i) => (
												<div
													className={cls['div-2']}
													id="subjects"
													key={item.id}>
													<Check
														id={item.slug}
														label=""
														checked={
															tenantCheckStates.find(
																(check) => check.id === item.slug
															)?.checked
														}
														onChange={() => handleTenantsCheckChange(item.slug)}
													/>
													<div className={cls['microsite-2']}>{item.name}</div>
												</div>
											))}
										{/* <div className={cls['text-wrapper-2']}>+ See More</div> */}
									</div>
								</div>
								<div className={cls['collection-owner']}>
									<div className={cls['content-2']}>
										<div className={cls['body-text-2']}>
											<input
												type="text"
												placeholder="Subject Area"
												value={subjectFilter}
												onChange={({ target }) =>
													setSubjectFilter(target.value)
												}
											/>
										</div>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none">
											<path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
										</svg>
									</div>
									<div className={cls.divider} />
									<div className={cls.values} style={{ height: '172px' }}>
										{subjects
											.filter(
												(item) =>
													item.name &&
													item.name.toLowerCase().includes(subjectFilter)
											)
											.map((item, i) => (
												<div
													className={cls['div-2']}
													id="subjects"
													key={item.id}>
													<Check
														id={item.slug}
														label=""
														checked={
															subjectCheckStates.find(
																(check) => check.id === item.slug
															)?.checked
														}
														onChange={() =>
															handleSubjectsCheckChange(item.slug)
														}
													/>
													<div className={cls['microsite-2']}>{item.name}</div>
												</div>
											))}
										{/* <div className={cls['text-wrapper-2']}>+ See More</div> */}
									</div>
								</div>
								<div className={cls['collection-owner-2']}>
									<div className={cls['div-2']}>
										<div className={cls['body-text-2']}>
											<input
												type="text"
												placeholder="Education Level"
												value={levelFilter}
												onChange={({ target }) => setLevelFilter(target.value)}
											/>
										</div>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											width="24"
											height="24"
											viewBox="0 0 24 24"
											fill="none">
											<path d="M7 14.5L12 9.5L17 14.5H7Z" fill="#1E1E1E" />
										</svg>
									</div>
									<div className={cls.divider} />
									<div className={cls['values-wrapper']}>
										<div className={cls.values} style={{ height: '172px' }}>
											{levels
												.filter(
													(item) =>
														item.name &&
														item.name.toLowerCase().includes(levelFilter)
												)
												.map((item, i) => (
													<div
														className={cls['div-2']}
														id="levels"
														key={item.id}>
														<Check
															id={item.slug}
															label=""
															checked={
																levelCheckStates.find(
																	(check) => check.id === item.slug
																)?.checked
															}
															onChange={() =>
																handleLevelsCheckChange(item.slug)
															}
														/>
														<div className={cls['microsite-2']}>
															{item.name}
														</div>
													</div>
												))}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className={cls.actionButtons}>
							<button className={cls.button} style={{ cursor: 'pointer' }}>
								<div className={cls['label-text']} onClick={apply}>
									Confirm filters
								</div>
							</button>
							<div
								className={cls['label-text-2']}
								style={{ cursor: 'pointer' }}
								onClick={clear}>
								Reset
							</div>
						</div>
					</div>
				</div>
			</Portal>
			<div className={cls.breadcrumb}>
				<div className={cls.breadcrumbs}>
					<Breadcrumb first="Home" />
				</div>
			</div>
			<div className={cls.links_wrapper}>
				{/* <NavLink to="/imls/search" className={cls.search_redirect}> */}
				<div className={cls.search_redirect}>
					<div className={cls.dropdown} onClick={() => setIsVisible(true)}>
						Filters
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none">
							<path
								d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"
								fill="black"
							/>
						</svg>
					</div>
					<SearchBar
						value={inputValue}
						onInputChange={({ target }) => setInputValue(target.value)}
						onKeyDown={onPress}
						placeholder="Search Individual Learning Materials"
					/>
					<Button
						onClick={() =>
							navigate(`/imls/search/${window.location.search.toString()}`)
						}
						title="Search"
						className={cls.search_button}
					/>
				</div>
				<AppLink
					to="/imls/advanced-resource-search"
					aria-label="Go to Advanced resource search page"
					className={cls.back_link}
					text="Go to Advanced resource search"
				/>
			</div>
			<Welcome name={name} />
			<News />
			{data && (
				<div className={cls.cards}>
					{data.map((item) => (
						<CollectionItemCard collection={item} className={cls.cardWidth} />
					))}
				</div>
			)}
			<div className={cls.grid}>
				<div>
					<div className={cls.heading}>
						<svg
							width="54"
							height="57"
							viewBox="0 0 54 57"
							fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<rect
								x="0.5"
								y="0.969482"
								width="53"
								height="56"
								rx="8"
								fill="#EB4D39"
							/>
							<path
								d="M28.5 20.7195C28.5 19.8898 27.8297 19.2195 27 19.2195C26.1703 19.2195 25.5 19.8898 25.5 20.7195V27.4695H18.75C17.9203 27.4695 17.25 28.1398 17.25 28.9695C17.25 29.7992 17.9203 30.4695 18.75 30.4695H25.5V37.2195C25.5 38.0492 26.1703 38.7195 27 38.7195C27.8297 38.7195 28.5 38.0492 28.5 37.2195V30.4695H35.25C36.0797 30.4695 36.75 29.7992 36.75 28.9695C36.75 28.1398 36.0797 27.4695 35.25 27.4695H28.5V20.7195Z"
								fill="#FCFCFC"
							/>
						</svg>
					</div>
					<div className={cls.content} style={{ background: '#FF8754' }}>
						<h5>Share</h5>
						<p>Share your institution’s OER content with other libraries.</p>
						<div
							className={cls.action}
							onClick={() =>
								navigate('/imls/site-collections/shared-collections')
							}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="25"
								viewBox="0 0 22 25"
								fill="none">
								<g clipPath="url(#clip0_43_2739)">
									<path
										d="M18.5 2.46948C20.1547 2.46948 21.5 3.8148 21.5 5.46948V20.4695C21.5 22.1242 20.1547 23.4695 18.5 23.4695H3.5C1.84531 23.4695 0.5 22.1242 0.5 20.4695V5.46948C0.5 3.8148 1.84531 2.46948 3.5 2.46948H18.5ZM15.5 15.6601V9.21948C15.5 8.80698 15.1625 8.46948 14.75 8.46948H8.30938C7.72344 8.46948 7.25 8.94292 7.25 9.52886C7.25 9.81011 7.3625 10.082 7.55938 10.2789L9.125 11.8445L6.01719 14.9523C5.84375 15.1257 5.75 15.3554 5.75 15.5945C5.75 15.8335 5.84375 16.0632 6.01719 16.2367L7.7375 17.957C7.90625 18.1257 8.13594 18.2242 8.37969 18.2242C8.62344 18.2242 8.84844 18.1304 9.02188 17.957L12.125 14.8445L13.6906 16.4101C13.8875 16.607 14.1594 16.7195 14.4406 16.7195C15.0266 16.7195 15.5 16.246 15.5 15.6601Z"
										fill="#1E1E1E"
									/>
								</g>
								<defs>
									<clipPath id="clip0_43_2739">
										<rect
											width="21"
											height="24"
											fill="white"
											transform="translate(0.5 0.969482)"
										/>
									</clipPath>
								</defs>
							</svg>
							<span>Manage shared OER</span>
						</div>
					</div>
				</div>
				<div>
					<div className={cls.heading}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="49"
							viewBox="0 0 48 49"
							fill="none">
							<path
								d="M4.8 10.5695H0V44.1695C0 46.8095 2.16 48.9695 4.8 48.9695H38.4V44.1695H4.8V10.5695ZM43.2 0.969482H14.4C11.76 0.969482 9.6 3.12948 9.6 5.76948V34.5695C9.6 37.2095 11.76 39.3695 14.4 39.3695H43.2C45.84 39.3695 48 37.2095 48 34.5695V5.76948C48 3.12948 45.84 0.969482 43.2 0.969482ZM38.4 5.76948V17.7695L34.8 15.7694L31.2 17.7695V5.76948H38.4ZM39.6 25.3694L33.6 21.7694L26.4 27.3695L33.6 24.1694L40.8 27.3695V5.76948H40.0902L39.6 25.3694Z"
								fill="#D6B35E"
							/>
						</svg>
					</div>
					<div className={cls.content} style={{ background: '#FFCD54' }}>
						<h5>Explore and Sync</h5>
						<p>
							Explore and sync subscribed OER content to your institution’s
							library.
						</p>
						<div
							className={cls.action}
							onClick={() => navigate('/imls/search')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="25"
								viewBox="0 0 24 25"
								fill="none">
								<path
									d="M17.0163 10.9776C17.0163 12.5241 16.5143 13.9527 15.6686 15.1118L19.9341 19.3807C20.3553 19.8018 20.3553 20.4858 19.9341 20.907C19.513 21.3281 18.829 21.3281 18.4078 20.907L14.1423 16.6381C12.9833 17.4871 11.5547 17.9858 10.0082 17.9858C6.13682 17.9858 3 14.849 3 10.9776C3 7.10631 6.13682 3.96948 10.0082 3.96948C13.8795 3.96948 17.0163 7.10631 17.0163 10.9776ZM10.0082 15.8294C10.6453 15.8294 11.2762 15.7039 11.8649 15.4601C12.4535 15.2163 12.9884 14.8589 13.4389 14.4084C13.8894 13.9578 14.2468 13.423 14.4906 12.8343C14.7345 12.2457 14.86 11.6148 14.86 10.9776C14.86 10.3405 14.7345 9.70958 14.4906 9.12093C14.2468 8.53229 13.8894 7.99743 13.4389 7.5469C12.9884 7.09637 12.4535 6.73898 11.8649 6.49516C11.2762 6.25133 10.6453 6.12584 10.0082 6.12584C9.37101 6.12584 8.7401 6.25133 8.15145 6.49516C7.5628 6.73898 7.02795 7.09637 6.57741 7.5469C6.12688 7.99743 5.7695 8.53229 5.52568 9.12093C5.28185 9.70958 5.15636 10.3405 5.15636 10.9776C5.15636 11.6148 5.28185 12.2457 5.52568 12.8343C5.7695 13.423 6.12688 13.9578 6.57741 14.4084C7.02795 14.8589 7.5628 15.2163 8.15145 15.4601C8.7401 15.7039 9.37101 15.8294 10.0082 15.8294Z"
									fill="#1E1E1E"
								/>
							</svg>
							<span>Search for OER</span>
						</div>

						<div
							className={cls.action}
							onClick={() => navigate('/imls/browse')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="25"
								viewBox="0 0 24 25"
								fill="none">
								<path
									d="M17.0163 10.9776C17.0163 12.5241 16.5143 13.9527 15.6686 15.1118L19.9341 19.3807C20.3553 19.8018 20.3553 20.4858 19.9341 20.907C19.513 21.3281 18.829 21.3281 18.4078 20.907L14.1423 16.6381C12.9833 17.4871 11.5547 17.9858 10.0082 17.9858C6.13682 17.9858 3 14.849 3 10.9776C3 7.10631 6.13682 3.96948 10.0082 3.96948C13.8795 3.96948 17.0163 7.10631 17.0163 10.9776ZM10.0082 15.8294C10.6453 15.8294 11.2762 15.7039 11.8649 15.4601C12.4535 15.2163 12.9884 14.8589 13.4389 14.4084C13.8894 13.9578 14.2468 13.423 14.4906 12.8343C14.7345 12.2457 14.86 11.6148 14.86 10.9776C14.86 10.3405 14.7345 9.70958 14.4906 9.12093C14.2468 8.53229 13.8894 7.99743 13.4389 7.5469C12.9884 7.09637 12.4535 6.73898 11.8649 6.49516C11.2762 6.25133 10.6453 6.12584 10.0082 6.12584C9.37101 6.12584 8.7401 6.25133 8.15145 6.49516C7.5628 6.73898 7.02795 7.09637 6.57741 7.5469C6.12688 7.99743 5.7695 8.53229 5.52568 9.12093C5.28185 9.70958 5.15636 10.3405 5.15636 10.9776C5.15636 11.6148 5.28185 12.2457 5.52568 12.8343C5.7695 13.423 6.12688 13.9578 6.57741 14.4084C7.02795 14.8589 7.5628 15.2163 8.15145 15.4601C8.7401 15.7039 9.37101 15.8294 10.0082 15.8294Z"
									fill="#1E1E1E"
								/>
							</svg>
							<span>Discover OER collections</span>
						</div>
					</div>
				</div>
				<div>
					<div className={cls.heading}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="42"
							height="49"
							viewBox="0 0 42 49"
							fill="none">
							<g clipPath="url(#clip0_43_2758)">
								<path
									d="M20.9999 0.969482C19.3405 0.969482 17.9999 2.31011 17.9999 3.96948V5.76948C11.1562 7.15698 5.99991 13.2132 5.99991 20.4695V22.232C5.99991 26.6382 4.37804 30.8945 1.45304 34.1945L0.759289 34.9726C-0.0282105 35.8539 -0.215711 37.1195 0.262414 38.1976C0.740539 39.2757 1.81866 39.9695 2.99991 39.9695H38.9999C40.1812 39.9695 41.2499 39.2757 41.7374 38.1976C42.2249 37.1195 42.028 35.8539 41.2405 34.9726L40.5468 34.1945C37.6218 30.8945 35.9999 26.6476 35.9999 22.232V20.4695C35.9999 13.2132 30.8437 7.15698 23.9999 5.76948V3.96948C23.9999 2.31011 22.6593 0.969482 20.9999 0.969482ZM25.2468 47.2164C26.3718 46.0914 26.9999 44.5632 26.9999 42.9695H20.9999H14.9999C14.9999 44.5632 15.628 46.0914 16.753 47.2164C17.878 48.3414 19.4062 48.9695 20.9999 48.9695C22.5937 48.9695 24.1218 48.3414 25.2468 47.2164Z"
									fill="#513ABA"
								/>
							</g>
							<defs>
								<clipPath id="clip0_43_2758">
									<rect
										width="42"
										height="48"
										fill="white"
										transform="translate(0 0.969482)"
									/>
								</clipPath>
							</defs>
						</svg>
					</div>
					<div className={cls.content} style={{ background: '#A08BFF' }}>
						<h5>Stay Updated</h5>
						<p>
							Get notified of the newest changes in OER when you subscribe to
							collections.
						</p>
						<div className={cls.act}>
							<span>See what’s new in </span>
						</div>
						<div
							className={cls.action}
							onClick={() =>
								navigate('/imls/site-collections/subscribed-updates')
							}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="25"
								viewBox="0 0 24 25"
								fill="none">
								<path
									d="M2.23125 15.0507L10.7016 22.9586C11.0531 23.2867 11.5172 23.4695 12 23.4695C12.4828 23.4695 12.9469 23.2867 13.2984 22.9586L21.7687 15.0507C23.1938 13.7242 24 11.8632 24 9.91793V9.64605C24 6.36949 21.6328 3.57574 18.4031 3.03668C16.2656 2.68043 14.0906 3.37886 12.5625 4.90699L12 5.46949L11.4375 4.90699C9.90938 3.37886 7.73438 2.68043 5.59688 3.03668C2.36719 3.57574 0 6.36949 0 9.64605V9.91793C0 11.8632 0.80625 13.7242 2.23125 15.0507Z"
									fill="#1E1E1E"
								/>
							</svg>
							<span>Subscribed OER</span>
						</div>
						<div
							className={cls.action}
							onClick={() => navigate('/imls/site-collections/shared-updates')}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="25"
								viewBox="0 0 22 25"
								fill="none">
								<g clipPath="url(#clip0_43_2771)">
									<path
										d="M18.5 2.46948C20.1547 2.46948 21.5 3.8148 21.5 5.46948V20.4695C21.5 22.1242 20.1547 23.4695 18.5 23.4695H3.5C1.84531 23.4695 0.5 22.1242 0.5 20.4695V5.46948C0.5 3.8148 1.84531 2.46948 3.5 2.46948H18.5ZM15.5 15.6601V9.21948C15.5 8.80698 15.1625 8.46948 14.75 8.46948H8.30938C7.72344 8.46948 7.25 8.94292 7.25 9.52886C7.25 9.81011 7.3625 10.082 7.55938 10.2789L9.125 11.8445L6.01719 14.9523C5.84375 15.1257 5.75 15.3554 5.75 15.5945C5.75 15.8335 5.84375 16.0632 6.01719 16.2367L7.7375 17.957C7.90625 18.1257 8.13594 18.2242 8.37969 18.2242C8.62344 18.2242 8.84844 18.1304 9.02188 17.957L12.125 14.8445L13.6906 16.4101C13.8875 16.607 14.1594 16.7195 14.4406 16.7195C15.0266 16.7195 15.5 16.246 15.5 15.6601Z"
										fill="#1E1E1E"
									/>
								</g>
								<defs>
									<clipPath id="clip0_43_2771">
										<rect
											width="21"
											height="24"
											fill="white"
											transform="translate(0.5 0.969482)"
										/>
									</clipPath>
								</defs>
							</svg>
							<span>Shared OER</span>
						</div>
					</div>
				</div>
				<div>
					<div className={cls.heading}>
						<svg
							width="96"
							height="49"
							viewBox="0 0 96 49"
							fill="none"
							xmlns="http://www.w3.org/2000/svg">
							<g clipPath="url(#clip0_43_2776)">
								<g clipPath="url(#clip1_43_2776)">
									<path
										d="M64.6594 6.99521C63.1195 5.45537 60.6305 5.45537 59.0906 6.99521L56.9742 9.10459L63.8578 15.9882L65.9742 13.8718C67.5141 12.3319 67.5141 9.84287 65.9742 8.30303L64.6594 6.99521ZM43.6219 22.464C43.193 22.8929 42.8625 23.4202 42.6727 24.0038L40.5914 30.2476C40.3875 30.8522 40.5492 31.5202 40.9992 31.9772C41.4492 32.4343 42.1172 32.589 42.7289 32.3851L48.9727 30.3038C49.5492 30.114 50.0766 29.7835 50.5125 29.3546L62.2758 17.5843L55.3852 10.6937L43.6219 22.464ZM38.25 9.96943C34.5234 9.96943 31.5 12.9929 31.5 16.7194V34.7194C31.5 38.446 34.5234 41.4694 38.25 41.4694H56.25C59.9766 41.4694 63 38.446 63 34.7194V27.9694C63 26.7249 61.9945 25.7194 60.75 25.7194C59.5055 25.7194 58.5 26.7249 58.5 27.9694V34.7194C58.5 35.964 57.4945 36.9694 56.25 36.9694H38.25C37.0055 36.9694 36 35.964 36 34.7194V16.7194C36 15.4749 37.0055 14.4694 38.25 14.4694H45C46.2445 14.4694 47.25 13.464 47.25 12.2194C47.25 10.9749 46.2445 9.96943 45 9.96943H38.25Z"
										fill="#70D0A9"
									/>
								</g>
							</g>
							<defs>
								<clipPath id="clip0_43_2776">
									<rect
										width="36"
										height="36"
										fill="white"
										transform="translate(31.5 5.46948)"
									/>
								</clipPath>
								<clipPath id="clip1_43_2776">
									<rect
										width="36"
										height="36"
										fill="white"
										transform="translate(31.5 5.46948)"
									/>
								</clipPath>
							</defs>
						</svg>
					</div>
					<div className={cls.content} style={{ background: '#7EF6C6' }}>
						<h5>Set Preferences</h5>
						<p>
							Get recommended content delivered when you set your content
							preferences.
						</p>
						<div className={cls.act}>
							<span>Set your preferences</span>
						</div>
						{/* <div className={cls.action}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                <g clip-path="url(#clip0_149_586)">
                  <path d="M22.1063 1.98672C21.0797 0.960156 19.4203 0.960156 18.3937 1.98672L16.9828 3.39297L21.5719 7.98203L22.9828 6.57109C24.0094 5.54453 24.0094 3.88516 22.9828 2.85859L22.1063 1.98672ZM8.08125 12.2992C7.79531 12.5852 7.575 12.9367 7.44844 13.3258L6.06094 17.4883C5.925 17.8914 6.03281 18.3367 6.33281 18.6414C6.63281 18.9461 7.07812 19.0492 7.48594 18.9133L11.6484 17.5258C12.0328 17.3992 12.3844 17.1789 12.675 16.893L20.5172 9.04609L15.9234 4.45234L8.08125 12.2992ZM4.5 3.96953C2.01562 3.96953 0 5.98516 0 8.46953V20.4695C0 22.9539 2.01562 24.9695 4.5 24.9695H16.5C18.9844 24.9695 21 22.9539 21 20.4695V15.9695C21 15.1398 20.3297 14.4695 19.5 14.4695C18.6703 14.4695 18 15.1398 18 15.9695V20.4695C18 21.2992 17.3297 21.9695 16.5 21.9695H4.5C3.67031 21.9695 3 21.2992 3 20.4695V8.46953C3 7.63984 3.67031 6.96953 4.5 6.96953H9C9.82969 6.96953 10.5 6.29922 10.5 5.46953C10.5 4.63984 9.82969 3.96953 9 3.96953H4.5Z" fill="#1E1E1E" />
                  <path d="M22.1063 1.98672C21.0797 0.960156 19.4203 0.960156 18.3937 1.98672L16.9828 3.39297L21.5719 7.98203L22.9828 6.57109C24.0094 5.54453 24.0094 3.88516 22.9828 2.85859L22.1063 1.98672ZM8.08125 12.2992C7.79531 12.5852 7.575 12.9367 7.44844 13.3258L6.06094 17.4883C5.925 17.8914 6.03281 18.3367 6.33281 18.6414C6.63281 18.9461 7.07812 19.0492 7.48594 18.9133L11.6484 17.5258C12.0328 17.3992 12.3844 17.1789 12.675 16.893L20.5172 9.04609L15.9234 4.45234L8.08125 12.2992ZM4.5 3.96953C2.01562 3.96953 0 5.98516 0 8.46953V20.4695C0 22.9539 2.01562 24.9695 4.5 24.9695H16.5C18.9844 24.9695 21 22.9539 21 20.4695V15.9695C21 15.1398 20.3297 14.4695 19.5 14.4695C18.6703 14.4695 18 15.1398 18 15.9695V20.4695C18 21.2992 17.3297 21.9695 16.5 21.9695H4.5C3.67031 21.9695 3 21.2992 3 20.4695V8.46953C3 7.63984 3.67031 6.96953 4.5 6.96953H9C9.82969 6.96953 10.5 6.29922 10.5 5.46953C10.5 4.63984 9.82969 3.96953 9 3.96953H4.5Z" fill="black" fill-opacity="0.2" />
                  <path d="M22.1063 1.98672C21.0797 0.960156 19.4203 0.960156 18.3937 1.98672L16.9828 3.39297L21.5719 7.98203L22.9828 6.57109C24.0094 5.54453 24.0094 3.88516 22.9828 2.85859L22.1063 1.98672ZM8.08125 12.2992C7.79531 12.5852 7.575 12.9367 7.44844 13.3258L6.06094 17.4883C5.925 17.8914 6.03281 18.3367 6.33281 18.6414C6.63281 18.9461 7.07812 19.0492 7.48594 18.9133L11.6484 17.5258C12.0328 17.3992 12.3844 17.1789 12.675 16.893L20.5172 9.04609L15.9234 4.45234L8.08125 12.2992ZM4.5 3.96953C2.01562 3.96953 0 5.98516 0 8.46953V20.4695C0 22.9539 2.01562 24.9695 4.5 24.9695H16.5C18.9844 24.9695 21 22.9539 21 20.4695V15.9695C21 15.1398 20.3297 14.4695 19.5 14.4695C18.6703 14.4695 18 15.1398 18 15.9695V20.4695C18 21.2992 17.3297 21.9695 16.5 21.9695H4.5C3.67031 21.9695 3 21.2992 3 20.4695V8.46953C3 7.63984 3.67031 6.96953 4.5 6.96953H9C9.82969 6.96953 10.5 6.29922 10.5 5.46953C10.5 4.63984 9.82969 3.96953 9 3.96953H4.5Z" fill="black" fill-opacity="0.2" />
                </g>
                <defs>
                  <clipPath id="clip0_149_586">
                    <rect width="24" height="24" fill="white" transform="translate(0 0.969482)" />
                  </clipPath>
                </defs>
              </svg>
              <span>Recommended OER</span>
            </div> */}
						<div
							className={cls.action}
							onClick={() =>
								navigate('/imls/site-collections/subscribed-preferences')
							}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="25"
								viewBox="0 0 24 25"
								fill="none">
								<path
									d="M2.23125 15.0507L10.7016 22.9586C11.0531 23.2867 11.5172 23.4695 12 23.4695C12.4828 23.4695 12.9469 23.2867 13.2984 22.9586L21.7687 15.0507C23.1938 13.7242 24 11.8632 24 9.91793V9.64605C24 6.36949 21.6328 3.57574 18.4031 3.03668C16.2656 2.68043 14.0906 3.37886 12.5625 4.90699L12 5.46949L11.4375 4.90699C9.90938 3.37886 7.73438 2.68043 5.59688 3.03668C2.36719 3.57574 0 6.36949 0 9.64605V9.91793C0 11.8632 0.80625 13.7242 2.23125 15.0507Z"
									fill="#1E1E1E"
								/>
							</svg>
							<span>Subscribed OER</span>
						</div>
						<div
							className={cls.action}
							onClick={() =>
								navigate('/imls/site-collections/shared-preferences')
							}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="25"
								viewBox="0 0 22 25"
								fill="none">
								<g clipPath="url(#clip0_43_2792)">
									<path
										d="M18.5 2.46948C20.1547 2.46948 21.5 3.8148 21.5 5.46948V20.4695C21.5 22.1242 20.1547 23.4695 18.5 23.4695H3.5C1.84531 23.4695 0.5 22.1242 0.5 20.4695V5.46948C0.5 3.8148 1.84531 2.46948 3.5 2.46948H18.5ZM15.5 15.6601V9.21948C15.5 8.80698 15.1625 8.46948 14.75 8.46948H8.30938C7.72344 8.46948 7.25 8.94292 7.25 9.52886C7.25 9.81011 7.3625 10.082 7.55938 10.2789L9.125 11.8445L6.01719 14.9523C5.84375 15.1257 5.75 15.3554 5.75 15.5945C5.75 15.8335 5.84375 16.0632 6.01719 16.2367L7.7375 17.957C7.90625 18.1257 8.13594 18.2242 8.37969 18.2242C8.62344 18.2242 8.84844 18.1304 9.02188 17.957L12.125 14.8445L13.6906 16.4101C13.8875 16.607 14.1594 16.7195 14.4406 16.7195C15.0266 16.7195 15.5 16.246 15.5 15.6601Z"
										fill="#1E1E1E"
									/>
								</g>
								<defs>
									<clipPath id="clip0_43_2792">
										<rect
											width="21"
											height="24"
											fill="white"
											transform="translate(0.5 0.969482)"
										/>
									</clipPath>
								</defs>
							</svg>
							<span>Shared OER</span>
						</div>
					</div>
				</div>
			</div>
			{(window as any).FreshWidget && (
				<div className={cls.note}>
					<span>Let us help you out</span>
					<button onClick={openFreshdesk}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="25"
							viewBox="0 0 24 25"
							fill="none">
							<path
								d="M2.25 3.88477C1.00781 3.88477 0 4.89258 0 6.13477C0 6.84258 0.332813 7.5082 0.9 7.93477L11.1 15.5848C11.6344 15.9832 12.3656 15.9832 12.9 15.5848L23.1 7.93477C23.6672 7.5082 24 6.84258 24 6.13477C24 4.89258 22.9922 3.88477 21.75 3.88477H2.25ZM0 9.13477V18.8848C0 20.5395 1.34531 21.8848 3 21.8848H21C22.6547 21.8848 24 20.5395 24 18.8848V9.13477L13.8 16.7848C12.7312 17.5863 11.2688 17.5863 10.2 16.7848L0 9.13477Z"
								fill="#FCFCFC"
							/>
						</svg>
						Send us a Note
					</button>
				</div>
			)}
		</div>
	);
}

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import cls from './Dropdown.module.scss';

// eslint-disable-next-line react/prop-types
const Arrow = ({ up = false }) => (
	<svg
		fill="none"
		height="24"
		viewBox="0 0 24 24"
		width="24"
		xmlns="http://www.w3.org/2000/svg"
		style={{ transform: up ? 'rotate(180deg)' : '', cursor: 'pointer' }}>
		<path className="path" d="M17 10L12 15L7 10H17Z" fill="#1F1F1F" />
	</svg>
);

const share = [];
let PAGE = 1;

const FiltersCheckbox = ({ id = 0, onChange = (id) => {} }) => {
	const [checked, setChecked] = useState(false);

	useEffect(() => {
		if (checked) {
			share.push(id);
		} else {
			share.splice(share.indexOf(id), 1);
		}
		console.log(share);
	}, [checked]);

	let component = (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="13"
			height="13"
			viewBox="0 0 15 14"
			fill="none"
			onClick={() => setChecked(true)}
			style={{ cursor: 'pointer' }}>
			<rect
				x="1"
				y="0.5"
				width="13"
				height="13"
				rx="2"
				fill="#FCFCFC"
				stroke="#979797"
			/>
		</svg>
	);
	if (checked) {
		component = (
			<svg
				fill="none"
				height="13"
				viewBox="0 0 15 14"
				width="13"
				xmlns="http://www.w3.org/2000/svg"
				style={{ cursor: 'pointer' }}
				onClick={() => setChecked(false)}>
				<rect
					className="rect"
					fill="#265BC1"
					height="13"
					rx="2"
					stroke="#265BC1"
					width="13"
					x="1"
					y="0.5"
				/>
				<path
					className="path"
					d="M3.82226 6.81247L3.63913 6.64358L3.4696 6.82611L2.76063 7.58941L2.58989 7.77323L2.77432 7.94332L5.79961 10.7334L5.98339 10.9029L6.15288 10.7191L12.1424 4.22476L12.3118 4.04098L12.1281 3.8715L11.365 3.16773L11.1813 2.99832L11.0118 3.18193L5.89537 8.7244L3.82226 6.81247Z"
					fill="#FCFCFC"
					stroke="#FCFCFC"
					strokeWidth="0.5"
				/>
			</svg>
		);
	}
	return component;
};

const Button = ({
	// eslint-disable-next-line react/prop-types
	property1,
	className,
	labelTextClassName,
	text = 'Share your institution’s OER content',
	onClick = () => {},
}) => (
	<div
		className={`${cls.button} ${cls[property1]} ${cls[className]}`}
		onClick={onClick}>
		<p className={`${cls.labelText} ${cls[labelTextClassName]}`}>{text}</p>
	</div>
);

export const Dropdown = ({ onAdd = (collectios) => {} }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState([]);
	const [shared, setShared] = useState([]);

	const fetchData = async () => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker/`,
				{
					params: {
						per_page: '30',
						page: PAGE,
						unshared: true,
						sortby: 'title',
					},
				}
			);
			if (PAGE === 1) {
				setResults(response.data.collections.items);
				const data = await axios.get(
					`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections`,
					{
						params: {
							per_page: '90',
							'f.search': searchTerm,
						},
					}
				);
				setShared(data.data.collections.items);
			} else {
				setResults([...results, ...response.data.collections.items]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const [tenantFilter, setTenantFilter] = useState('');

	useEffect(() => {
		fetchData();
	}, []);

	const divRef = useRef(null);

	const scrollDiv = (amount) => {
		divRef.current.scrollTop += amount;
		if (
			divRef.current.scrollTop + divRef.current.offsetHeight >=
			divRef.current.scrollHeight - 70
		) {
			PAGE++;
			fetchData();
		}
	};

	const adding = () => {
		axios
			.post(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker/`,
				null,
				{ params: { share } }
			)
			.then(() => {
				onAdd(results.filter((item) => share.includes(item.id)));
			});
	};

	const search = async (clear = false) => {
		try {
			const response = await axios.get(
				`${process.env.REACT_APP_API_URL}/api/imls/v2/collections/site-collections/picker`,
				{
					params: {
						per_page: '30',
						unshared: true,
						sortby: 'title',
						'f.title': clear ? '' : tenantFilter,
					},
				}
			);
			setResults(response.data.collections.items);
		} catch (error) {
			console.error(error);
		}
	};

	function changeInput({ target }) {
		setTenantFilter(target.value);
		if (target.value === '') search(true);
	}

	return (
		<div className={cls.filters}>
			<div className={cls.searchCollections}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					onClick={() => search()}>
					{/* eslint-disable-next-line max-len */}
					<path
						d="M17.0163 10.0082C17.0163 11.5547 16.5143 12.9833 15.6686 14.1423L19.9341 18.4112C20.3553 18.8324 20.3553 19.5163 19.9341 19.9375C19.513 20.3587 18.829 20.3587 18.4078 19.9375L14.1423 15.6686C12.9833 16.5177 11.5547 17.0163 10.0082 17.0163C6.13682 17.0163 3 13.8795 3 10.0082C3 6.13682 6.13682 3 10.0082 3C13.8795 3 17.0163 6.13682 17.0163 10.0082ZM10.0082 14.86C10.6453 14.86 11.2762 14.7345 11.8649 14.4906C12.4535 14.2468 12.9884 13.8894 13.4389 13.4389C13.8894 12.9884 14.2468 12.4535 14.4906 11.8649C14.7345 11.2762 14.86 10.6453 14.86 10.0082C14.86 9.37101 14.7345 8.7401 14.4906 8.15145C14.2468 7.5628 13.8894 7.02795 13.4389 6.57741C12.9884 6.12688 12.4535 5.7695 11.8649 5.52568C11.2762 5.28185 10.6453 5.15636 10.0082 5.15636C9.37101 5.15636 8.7401 5.28185 8.15145 5.52568C7.5628 5.7695 7.02795 6.12688 6.57741 6.57741C6.12688 7.02795 5.7695 7.5628 5.52568 8.15145C5.28185 8.7401 5.15636 9.37101 5.15636 10.0082C5.15636 10.6453 5.28185 11.2762 5.52568 11.8649C5.7695 12.4535 6.12688 12.9884 6.57741 13.4389C7.02795 13.8894 7.5628 14.2468 8.15145 14.4906C8.7401 14.7345 9.37101 14.86 10.0082 14.86Z"
						fill="#262341"
					/>
				</svg>
				<input
					className={cls.searchSearch}
					type="text"
					placeholder="Search for Collections to Share"
					value={tenantFilter}
					onChange={changeInput}
					onKeyDown={(event) => {
						if (event.key === 'Enter') search();
					}}
				/>
			</div>
			<div className={cls.categories}>
				<div className={cls.div}>
					<header className={cls.header}>
						<div className={cls.subjectArtHistory}>Collection name</div>
						<Arrow up />
					</header>
					<svg
						width="308"
						height="2"
						viewBox="0 0 308 2"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M0 1H308" stroke="#1E1E1E" strokeOpacity="0.5" />
					</svg>
					<div className={cls.div}>
						<div className={cls.div}>
							<div onClick={() => scrollDiv(-100)}>
								<Arrow up />
							</div>
							<div
								ref={divRef}
								style={{
									maxHeight: '300px',
									overflow: 'hidden',
								}}>
								{results /*.filter((item) => item.name && item.name.toLowerCase().includes(tenantFilter))*/
									.map((item) => (
										<div className={cls.frame}>
											<FiltersCheckbox
												id={item.id}
												onChange={(id) => console.log(id)}
											/>
											<div className={cls.microsite}>{item.name}</div>
										</div>
									))}
							</div>
							<div onClick={() => scrollDiv(70)}>
								<Arrow />
							</div>
						</div>
					</div>
					<svg
						width="308"
						height="2"
						viewBox="0 0 308 2"
						fill="none"
						xmlns="http://www.w3.org/2000/svg">
						<path d="M0 1H308" stroke="#1E1E1E" strokeOpacity="0.5" />
					</svg>
				</div>
				<Button
					className="button-instance"
					labelTextClassName={cls.designComponentInstanceNode}
					property1="default"
					text="Share to the OER Exchange"
					onClick={adding}
				/>
			</div>
		</div>
	);
};

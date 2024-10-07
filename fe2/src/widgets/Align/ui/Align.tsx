import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';

export function AlignWidget({ onSelect = (tag) => {} }) {
	const [field, setField] = useState('');
	const [middle, setMiddle] = useState({ name: '', data: {} });

	const [framework, setFramework] = useState('');
	const [frameworks, setFrameworks] = useState([]);
	const [frameworkArea, setFrameworkArea] = useState('');
	const [frameworkAreas, setFrameworkAreas] = useState([]);
	const [frameworkTag, setFrameworkTag] = useState('');
	const [frameworkTags, setFrameworkTags] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const result = await axios(
				`${process.env.REACT_APP_API_URL}/standards/align-widget-helper`
			);
			setField(result.data.name);
			setFrameworks(result.data.choices);
		};
		fetchData();
	}, []);

	const handleFrameworkChange = async (event) => {
		const selected = event.target.value;
		setFramework(selected);
		const result = await axios(
			`${process.env.REACT_APP_API_URL}/standards/align-widget-helper`,
			{
				params: {
					field,
					[field]: selected,
				},
			}
		);
		setMiddle({ name: result.data.name, data: { [field]: selected } });
		setFrameworkAreas(result.data.choices);
	};
	const handleFrameworkAreaChange = async (event) => {
		const selected = event.target.value;
		setFrameworkArea(selected);
		const result = await axios(
			`${process.env.REACT_APP_API_URL}/standards/align-widget-helper`,
			{
				params: {
					field: middle.name,
					[middle.name]: selected,
					...middle.data,
				},
			}
		);
		setFrameworkTags(result.data.choices.options);
	};
	const handleFrameworkTagChange = async (event) => {
		const selected = event.target.value;
		setFrameworkTag(selected);
		onSelect(frameworkTags.find((item) => item.value === selected));
	};

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'stretch',
				gap: '16px',
				margin: '16px',
				minWidth: '500px',
			}}>
			<FormControl>
				<InputLabel id="framework-dropdown-label">Framework</InputLabel>
				<Select
					value={framework}
					onChange={handleFrameworkChange}
					id="framework-select"
					label="Framework"
					labelId="framework-dropdown-label">
					*
					<MenuItem value="">
						<em>None</em>
					</MenuItem>
					{frameworks.map((option) => (
						<MenuItem key={option.value} value={option.value}>
							{option.label}
						</MenuItem>
					))}
				</Select>
			</FormControl>
			{frameworkAreas.length ? (
				<FormControl>
					<InputLabel id="FrameworkArea">Framework Area</InputLabel>
					<Select
						value={frameworkArea}
						onChange={handleFrameworkAreaChange}
						label="Framework Area"
						labelId="FrameworkArea">
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
						{frameworkAreas.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			) : (
				''
			)}
			{frameworkTags.length ? (
				<FormControl>
					<InputLabel id="FrameworkTag">Framework Tag</InputLabel>
					<Select
						value={frameworkTag}
						onChange={handleFrameworkTagChange}
						label="Framework Tag"
						labelId="FrameworkTag">
						<MenuItem value="">
							<em>None</em>
						</MenuItem>
						{frameworkTags.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			) : (
				''
			)}
		</div>
	);
}

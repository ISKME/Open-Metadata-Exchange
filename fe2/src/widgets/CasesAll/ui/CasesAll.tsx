/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import { CasesList } from 'widgets/CasesList';
import cls from './CasesAll.module.scss';
import axios from 'axios';

const styles = {
	accordion: {
		boxShadow: 'none',
		marginBottom: '16px',
	},
	sub: {
		marginBottom: '16px',
		border: '1px solid #d6d8da',
		boxShadow: 'none',
		borderRadius: '4px',
		'&::before': {
			opacity: '0',
		},
	},
	summary: {
		backgroundColor: '#303e48',
		stroke: '#fad000',
		color: '#fad000',
		borderRadius: '4px',
		boxShadow: 'none',
	},
	inner: {
		borderRadius: '4px',
		boxShadow: 'none',
		'&.Mui-expanded': {
			backgroundColor: '#56788f',
			border: 'none',
			stroke: 'white',
			color: 'white',
		},
	},
};

const FilterInnerItems = ({ name, items = [] }) => (
	<>
		{items.map((item, index) => (
			<Accordion sx={styles.sub} key={`panel${name}-${index}`}>
				<AccordionSummary
					expandIcon={
						item.children && item.children.length ? <ExpandMoreIcon /> : ''
					}
					sx={styles.inner}>
					<Typography>
						{item.name} ({item.numResources})
					</Typography>
				</AccordionSummary>
				{item.children && item.children.length && (
					<AccordionDetails>
						{item.children &&
							item.children.map((child, j) => (
								<Typography
									sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer' }}
									key={`panel${name}-${index}-${j}`}>
									{item.title} ({item.number})
								</Typography>
							))}
					</AccordionDetails>
				)}
			</Accordion>
		))}
	</>
);

const FilterItems = ({ items = [] }) => {
	const [expanded, setExpanded] = React.useState<string | false>(false);
	const handleChange = (panel) => (_event, isExpanded) => {
		setExpanded(isExpanded ? panel : false);
	};
	return (
		<>
			{items.map((item, index) => (
				<Accordion
					expanded={expanded === `panel${index}`}
					onChange={handleChange(`panel${index}`)}
					sx={styles.accordion}
					key={`panel${index}`}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.summary}>
						<Typography>{item.title}</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ padding: '8px 0 0' }}>
						{item.children && (
							<FilterInnerItems name={index} items={item.children} />
						)}
					</AccordionDetails>
				</Accordion>
			))}
		</>
	);
};

let tempTopics = [];
let tempGrades = [];

const Subject = ({ data = {}, onSelect = () => {}, selected = [] }) => {
	const [expanded, setExpanded] = React.useState(false);
	React.useEffect(() => {
		const index = selected.findIndex((item) => item.slug === data.slug);
		if (index >= 0) {
			setExpanded(true);
		}
	}, [selected]);
	return (
		<Accordion
			expanded={expanded}
			onChange={(_event, isExpanded) => {
				const index = tempTopics.findIndex((item) => item.parent === data.slug);
				if (index < 0) {
					setExpanded(isExpanded);
				}
				onSelect(data);
			}}
			sx={styles.sub}>
			<AccordionSummary
				expandIcon={
					data.children && data.children.length ? <ExpandMoreIcon /> : ''
				}
				sx={styles.inner}>
				<Typography>
					{data.name} ({data.numResources})
				</Typography>
			</AccordionSummary>
			{data.children && data.children.length ? (
				<AccordionDetails>
					{data.children.map((item, j) => (
						<Typography
							sx={{
								color: '#56788f',
								padding: '4px 0',
								cursor: 'pointer',
								backgroundColor:
									selected.findIndex((select) => select.slug === item.slug) < 0
										? ''
										: '#ececec',
							}}
							key={`panel${name}-${data.name}-${j}`}
							onClick={() => onSelect({ ...item, parent: data.slug })}>
							{item.name} ({item.numResources})
						</Typography>
					))}
				</AccordionDetails>
			) : (
				''
			)}
		</Accordion>
	);
};

// function parent(slug) {
//   let result = 0
//   const index = temp1.findIndex((item) => item.slug == slug)
//   for (let i = 0; i < index; i++) {
//     if (temp1[i].level === 0) result = i
//   }
//   return result
// }

let first = false;

export function CasesAll() {
	const { cases, count, pages, sorts, order, topics, grades } = useAppSelector(
		(state) => state.CasesSlice
	);
	const [searchParams, setSearchParams] = useSearchParams();

	const [expandTopic, setExpandTopic] = React.useState(false);
	const [expandGrade, setExpandGrade] = React.useState(false);
	const [filteredTopics, setFilteredTopics] = React.useState([]);
	const [filteredGrades, setFilteredGrades] = React.useState([]);
	const [filteredFrameworks, setFilteredFrameworks] = React.useState([]);
	const [frameworks, setFrameworks] = React.useState([]);

	React.useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_API_URL}/standards/list-existing/standard`)
			.then(({ data }) => {
				setFrameworks(data.options);
			});
	}, []);

	const applyFilter = (topic) => {
		const index = filteredTopics.findIndex((item) => item.slug === topic.slug);
		tempTopics = JSON.parse(JSON.stringify(filteredTopics));
		if (index < 0) {
			// add topic
			tempTopics = tempTopics.filter((item) => item.slug !== topic.parent); // rem parent if child
			tempTopics.push(topic);
		} else {
			// rem topic
			tempTopics.splice(index, 1);
			if (topic.parent)
				tempTopics.push(topics.find((item) => item.slug === topic.parent));
		}
		tempTopics = tempTopics.filter((item) => item.parent !== topic.slug); // rem children
		setFilteredTopics(tempTopics);
	};

	const applyGradeFilter = (grade) => {
		const index = filteredGrades.findIndex((item) => item.slug === grade.slug);
		tempGrades = JSON.parse(JSON.stringify(filteredGrades));
		if (index < 0) {
			// add topic
			tempGrades.push(grade);
		} else {
			// rem topic
			tempGrades.splice(index, 1);
		}
		setFilteredGrades(tempGrades);
	};

	const applyFrameworkFilter = (framework) => {
		const index = filteredFrameworks.findIndex(
			(item) => item.id === framework.id
		);
		const temp = JSON.parse(JSON.stringify(filteredFrameworks));
		if (index < 0) {
			// add topic
			temp.push(framework);
		} else {
			// rem topic
			temp.splice(index, 1);
		}
		setFilteredFrameworks(temp);
	};

	React.useEffect(() => {
		let grade = searchParams.get('f.grade_codes');
		let subject = searchParams.get('f.general_subject');
		if (!first && ((grade && grades.length) || (subject && topics.length))) {
			first = true;
			const parent = topics.find(
				(item) => item.children.findIndex((child) => child.slug == subject) > 0
			);
			grade = grades.find((item) => item.slug === grade);
			subject = topics.find((item) => item.slug === subject);
			if (grade) {
				setExpandGrade(true);
				applyGradeFilter(grade);
			}
			if (subject) {
				setExpandTopic(true);
				applyFilter(subject);
			}
			if (parent) {
				applyFilter(parent);
				let temp = parent.children.find(
					(item) => item.slug === searchParams.get('f.general_subject')
				);
				temp = { ...temp, parent: parent.slug };
				setExpandTopic(true);
				setTimeout(() => applyFilter(temp));
			}
		}
	}, [grades, topics]);

	return (
		<Grid
			container
			spacing={2}
			sx={{ padding: '24px 10%' }}
			className={cls.cases}>
			<Grid item xs={4} sx={{ paddingRight: '32px' }}>
				{/* <FilterItems
          items={[
            {
              title: 'Subject & Topic',
              children: [
                {
                  title: 'Art',
                  number: 7,
                  children: [
                    { title: 'Art History', number: 3 },
                    { title: 'Creating Works of Art', number: 1 },
                    { title: 'Responding to, Interpreting, and Evaluating Works of Art', number: 6 },
                  ],
                },
                {
                  title: 'Career and Technical Education',
                  number: 3,
                  children: [
                    { title: 'Engineering, Design, and Fabrication', number: 1 },
                    { title: 'Information Systems and Technology, Communications, and the Arts', number: 1 },
                    { title: 'Leisure and Recreation Services', number: 1 },
                  ],
                }
              ],
            },
            { title: 'Grade Level' },
            { title: 'Framework', children: [
              { title: 'edTPA™', number: 70 },
              { title: 'National Board Standards', number: 70 },
              { title: 'TeachingWorks High-Leverage Practices', number: 68 },
            ] },
          ]}
        /> */}
				<Accordion
					expanded={expandTopic}
					onChange={(_event, isExpanded) => setExpandTopic(isExpanded)}
					sx={styles.accordion}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.summary}>
						<Typography>Subject & Topic</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ padding: '8px 0 0' }}>
						{topics.map((topic, j) => (
							// <Typography sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer', backgroundColor: filteredTopics.includes(child) ? '#ececec' : '' }} key={`topic-${child.slug}`} onClick={() => applyFilter(child)}>
							//   {child.name} ({child.numResources})
							// </Typography>
							<Subject
								key={topic.slug}
								data={topic}
								onSelect={(item) => applyFilter(item)}
								selected={filteredTopics}
							/>
						))}
					</AccordionDetails>
				</Accordion>
				<Accordion
					expanded={expandGrade}
					onChange={(_event, isExpanded) => setExpandGrade(isExpanded)}
					sx={styles.accordion}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.summary}>
						<Typography>Grade Level</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ padding: 0 }}>
						<ul className={cls.grades}>
							{grades.map((grade) => (
								<li
									key={grade.slug}
									className={cls.grade}
									style={{
										backgroundColor: grade.isSelected ? '#56788f' : '',
										borderColor: grade.isSelected ? '#56788f' : '',
										color: grade.isSelected ? 'white' : '',
									}}
									onClick={() => applyGradeFilter(grade)}>
									<span>{grade.name}</span>
									<br />
									<span className="facet-count"> ({grade.numResources})</span>
								</li>
							))}
						</ul>
					</AccordionDetails>
				</Accordion>
				<Accordion sx={styles.accordion}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.summary}>
						<Typography>Framework</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
						{frameworks.map((item) => (
							<Accordion
								key={item.id}
								sx={styles.sub}
								onClick={() => applyFrameworkFilter(item)}>
								<AccordionSummary sx={styles.inner}>
									<Typography>
										{item.name} ({item.count})
									</Typography>
								</AccordionSummary>
							</Accordion>
						))}
					</AccordionDetails>
				</Accordion>
				<Typography sx={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
					<Search />
					Advanced Search
				</Typography>
			</Grid>
			<Grid item xs={8}>
				<CasesList
					data={cases}
					sorts={sorts}
					order={order}
					pages={pages}
					count={count}
					topics={filteredTopics}
					grades={filteredGrades}
					frameworks={filteredFrameworks}
					unselectTopic={applyFilter}
					unselectGrade={applyGradeFilter}
					unselectFramework={applyFrameworkFilter}
					onClear={() => {
						setFilteredTopics([]);
						setFilteredGrades([]);
						setFilteredFrameworks([]);
					}}
				/>
			</Grid>
		</Grid>
	);
}

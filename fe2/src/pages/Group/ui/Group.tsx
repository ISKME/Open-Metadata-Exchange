/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import { GroupsMembers } from 'widgets/GroupsMembers';
import { GroupsFolders } from 'widgets/GroupsFolders';
import { GroupsSettings } from 'widgets/GroupsSettings';
import cls from './Group.module.scss';

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function CustomTabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}>
			{value === index && (
				<Box sx={{ p: 3 }}>
					<Typography>{children}</Typography>
				</Box>
			)}
		</div>
	);
}

function a11yProps(index: number) {
	return {
		id: `simple-tab-${index}`,
		'aria-controls': `simple-tabpanel-${index}`,
	};
}

// function CloseSquare(props: SvgIconProps) { return <SvgIcon {...props}><path d="" /></SvgIcon> }

const customUrl = 'https://semantic-ui.com/images/wireframe/image.png';

export function Group() {
	const [value, setValue] = React.useState(0);
	const [title, setTitle] = React.useState('');
	const [cover, setCover] = React.useState('');
	const [description, setDescription] = React.useState('');
	const [membersCount, setMembersCount] = React.useState(0);
	const [folders, setFolders] = React.useState([]);
	const [members, setMembers] = React.useState([]);

	// group_type
	// url

	const { id } = useParams();

	React.useEffect(() => {
		axios
			.get(`${process.env.REACT_APP_API_URL}/api/groups/v1/groups/${id}.json`)
			.then(({ data }) => {
				let i = 0;
				const { title, cover, description, members_count, folders, members } =
					data;
				setTitle(title);
				setCover(cover || customUrl);
				setMembersCount(members_count);
				setFolders(folders);
				setMembers(
					members.map((item) => ({
						...item,
						id: i++,
						joined: new Date(item.joined),
					}))
				);
				setDescription(description);
			});
	}, []);

	const handleChange = (event: React.SyntheticEvent, newValue: number) => {
		setValue(newValue);
	};

	const primaryColor = '#303e48';

	const globalStyles = {
		'.MuiTabs-root': {
			background: 'rgb(48, 62, 72)',
			paddingLeft: '10%',
		},
		'.MuiTabs-flexContainer': {
			paddingTop: '3px',
		},
		'.MuiButtonBase-root.MuiTab-root.Mui-selected': {
			color: primaryColor,
			background: 'white',
		},
		'.MuiButtonBase-root.MuiTab-root': {
			color: 'white',
		},
		'.MuiTabs-indicator': {
			display: 'none',
		},
	};

	return (
		<Box sx={{ width: '100%', padding: '64px 0' }}>
			<GlobalStyles styles={globalStyles} />
			<section className={cls['group-info']}>
				<div className={cls['group-info-container']}>
					<div className={cls['group-info-cover']}>
						<img
							src={cover}
							width="150"
							height="150"
							alt={title}
							onError={({ target }) => {
								target.src =
									'https://semantic-ui.com/images/wireframe/image.png';
							}}
						/>
					</div>
					<div className={cls['group-info-text']}>
						<h1>{title}</h1>
						<p className={cls['group-info-administrators-list']}>
							Group Leader: Michelle Brennan
						</p>
						<br />
						<p
							dangerouslySetInnerHTML={{
								__html: description
									.replace(/\n/g, '<br />')
									.replace(/\r\n/g, '<br />'),
							}}
						/>
						<br />
						<div className={cls['group-info-counters']}>
							<div className={cls['group-info-counters-item']}>
								<i className={cls['fa fa-user']} aria-hidden="true" />
								<span className={cls.text}>
									Members:
									<span
										className={cls['text-counter']}
										style={{ marginLeft: '6px' }}>
										{membersCount}
									</span>
								</span>
							</div>
							<div className={cls['group-info-counters-item']}>
								<i className={cls['fa fa-file-video-o']} aria-hidden="true" />
								<span className={cls.text}>
									Cases:
									<span
										className={cls['text-counter']}
										style={{ marginLeft: '6px' }}>
										86
									</span>
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>
			{/* sx={{ borderBottom: 1, borderColor: 'divider' }} */}
			<Box>
				{/* style={{ background: 'rgb(48, 62, 72)' }} */}
				<Tabs
					value={value}
					onChange={handleChange}
					aria-label="basic tabs example">
					<Tab label="Folders" {...a11yProps(0)} />
					<Tab label="Members" {...a11yProps(1)} />
					<Tab label="Settings" {...a11yProps(2)} />
				</Tabs>
			</Box>
			<CustomTabPanel value={value} index={0}>
				<GroupsFolders folders={folders} />
			</CustomTabPanel>
			<CustomTabPanel value={value} index={1}>
				<GroupsMembers members={members} />
			</CustomTabPanel>
			<CustomTabPanel value={value} index={2}>
				<GroupsSettings title={title} cover={cover} description={description} />
			</CustomTabPanel>
		</Box>
	);
}

/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import GlobalStyles from '@mui/material/GlobalStyles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { red } from '@mui/material/colors';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FormControlLabel from '@mui/material/FormControlLabel';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AddIcon from '@mui/icons-material/Add';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
// import { VideoPlayer } from 'components/player';
import { Player } from 'components/kaltural';
import cls from './Case.module.scss';
import { Comment } from '@mui/icons-material';
import { AlignWidget } from 'widgets/Align';

const globalStyles = {
	'.MuiAccordionSummary-contentGutters': {
		margin: '0 !important',
	},
	'.MuiAccordionSummary-gutters': {
		minHeight: '36px !important',
	},
};

const styles = `
input[type="text"] {
  height: 32px;
  box-shadow: none;
}
textarea {
  box-shadow: none;
}
.sidebar {
  position: relative;
  padding-right: 10px;
  min-height: 50px;
  font-family: "Roboto", sans-serif;
}
.sidebar a {
  text-decoration: none;
}
.sidebar h1, .sidebar h2 {
  font-size: 26px;
  line-height: 1.1;
  font-family: "DINPro", sans-serif;
  color: #303e48;
  font-weight: 500;
  margin-bottom: 16px;
}
.sidebar h2 {
  font-size: 24px;
  margin-top: 24px;
}
.show-popup-form-button.mod-case-annotation {
  display: inline-block;
  padding: 4px 15px 4px 10px;
  background-color: #56798f;
  border-radius: 2px;
  color: #ffffff;
  font-size: 13px;
  font-family: "DINPro", sans-serif;
  outline: none;
  border-color: transparent;
  text-align: center;
  vertical-align: middle;
}
.toggle-collapse {
  display: inline-block;
}
.toggle-part button {
  float: right;
  margin-top: 24px;
}
.case-fields {
  padding-bottom: 5px;
}

.case-field {
  display: inline;
  font: 400 13px/21px "Roboto", sans-serif;
  color: #333333;
  padding-inline-start: 0;
  list-style-type: none; }
  .case-field:after {
    content: "|";
    display: inline;
    margin-left: 4px;
    color: #d9d9da; }
  .case-field:last-child:after {
    display: none; }
  .case-field dt {
    display: inline;
    font-weight: 400;
    margin-right: 3px; }
  .case-field dd, .case-field li {
    display: inline; }
    .case-field dd:after, .case-field li:after {
      content: "/";
      display: inline;
      margin: 0 8px;
      color: #d9d9da; }
    .case-field dd:last-child:after, .case-field li:last-child:after {
      display: none; }
    .case-field dd a, .case-field li a {
      color: #56788f; }

      .hashmarks-ct {
  margin-top: 1px;
  padding: 5px 10px 10px;
  background-color: #000000; }

.hashmarks-help-text {
  color: #8a8a8a;
  font-size: 12px; }

.hashmarks {
  height: 25px;
  margin-top: 5px;
  margin-bottom: 0; }

.hashmark-panel {
  position: relative;
  display: none; }
  .hashmark-panel.active {
    display: block; }
  .hashmark-panel .tooltip.in {
    opacity: 1; }
  .hashmark-panel .tooltip.top .tooltip-arrow {
    border-top-color: #ffffff; }
  .hashmark-panel .tooltip-inner {
    -moz-box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
    -webkit-box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
    box-shadow: 1px 2px 8px 0 rgba(0, 0, 0, 0.2);
    color: #303e48;
    background-color: #ffffff; }

.hashmark-link {
  position: absolute;
  top: 0;
  display: block;
  width: 5px;
  height: 25px;
  background-color: #56798f; }
  .hashmark-link:hover, .hashmark-link.selected {
    background-color: #84a5bc; }
.links {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px; }
  @media only screen and (max-width: 767px) {
    .links .how-to-wrapper {
      margin-top: 10px; } }
  .links > a {
    margin-right: 15px; }
.case .copyright-comment {
  margin-top: 16px;
  margin-bottom: 17px;
  font-family: "Roboto", sans-serif;
  font-size: 12px;
  font-weight: 400; }
  .case .copyright-comment div {
    margin-bottom: 2px; }
  .case .copyright-comment p {
    margin: 0; }
.case .tab-content .text {
  line-height: 24px;
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: 400; }

.links a,
.case-link {
  padding: 0;
  color: #56788f;
  font-family: "DINPro", sans-serif;
  font-size: 15px;
  text-align: left;
  border: 0;
  background: transparent; }
  .links a i,
  .case-link i {
    padding-right: 2px;
    vertical-align: -2px;
    color: #303e48;
    font-size: 16px; }
    .links a i.fa-question-circle,
    .case-link i.fa-question-circle {
      vertical-align: 0; }
  .links a:hover,
  .case-link:hover {
    color: #666666; }
    .links a:hover i,
    .case-link:hover i {
      color: #8f9bae; }
  .links a.how-to-link .how-to-link-popover-content,
  .case-link.how-to-link .how-to-link-popover-content {
    display: none; }
.show-popup-form-button {
  border-radius: 3px;
  padding: 0;
  outline: none;
  border: none;
  font-size: 13px; }
  @media only screen and (max-width: 767px) {
    .show-popup-form-button {
      display: block;
      margin-top: 10px;
      margin-left: -2px; } }
  .show-popup-form-button:hover, .show-popup-form-button:focus {
    color: #8f9bae; }
    .show-popup-form-button:hover .fa, .show-popup-form-button:focus .fa {
      color: #ffffff; }
  .show-popup-form-button .fa {
    width: 20px;
    height: 20px;
    margin-right: 5px;
    padding: 4px;
    font-size: 13px; }
  .show-popup-form-button.mod-video-note, .show-popup-form-button.mod-material-note, .show-popup-form-button.mod-case-annotation {
    display: inline-block;
    padding: 4px 15px 4px 10px;
    background-color: #56798f;
    border-radius: 2px;
    color: #ffffff; }
  .show-popup-form-button.mod-case-annotation {
    margin-top: 15px; }
.commentary {
  font-family: "DINPro", sans-serif;
  position: relative;
}
.commentary h3 {
  margin-bottom: 15px;
  font-size: 16px;
}
.commentary h4 {
  margin-bottom: 15px;
  font-size: 14px;
}
.commentary p {
  line-height: 24px;
  font-size: 14px;
  margin: 0 0 10px;
}

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
  cursor: pointer;
}
.tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}
.tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
#control {
  background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0MHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+DQo8cGF0aCBkPSJNMTIgMTRWMTAuNU0xMiA3SDEyLjAxTTkuOSAxOS4yTDExLjM2IDIxLjE0NjdDMTEuNTc3MSAyMS40MzYyIDExLjY4NTcgMjEuNTgwOSAxMS44MTg4IDIxLjYzMjdDMTEuOTM1MyAyMS42NzggMTIuMDY0NyAyMS42NzggMTIuMTgxMiAyMS42MzI3QzEyLjMxNDMgMjEuNTgwOSAxMi40MjI5IDIxLjQzNjIgMTIuNjQgMjEuMTQ2N0wxNC4xIDE5LjJDMTQuMzkzMSAxOC44MDkxIDE0LjUzOTcgMTguNjEzNyAxNC43MTg1IDE4LjQ2NDVDMTQuOTU2OSAxOC4yNjU2IDE1LjIzODMgMTguMTI0OCAxNS41NDA1IDE4LjA1MzVDMTUuNzY3MSAxOCAxNi4wMTE0IDE4IDE2LjUgMThDMTcuODk3OCAxOCAxOC41OTY3IDE4IDE5LjE0ODEgMTcuNzcxNkMxOS44ODMxIDE3LjQ2NzIgMjAuNDY3MiAxNi44ODMxIDIwLjc3MTYgMTYuMTQ4MUMyMSAxNS41OTY3IDIxIDE0Ljg5NzggMjEgMTMuNVY3LjhDMjEgNi4xMTk4NCAyMSA1LjI3OTc2IDIwLjY3MyA0LjYzODAzQzIwLjM4NTQgNC4wNzM1NCAxOS45MjY1IDMuNjE0NiAxOS4zNjIgMy4zMjY5OEMxOC43MjAyIDMgMTcuODgwMiAzIDE2LjIgM0g3LjhDNi4xMTk4NCAzIDUuMjc5NzYgMyA0LjYzODAzIDMuMzI2OThDNC4wNzM1NCAzLjYxNDYgMy42MTQ2IDQuMDczNTQgMy4zMjY5OCA0LjYzODAzQzMgNS4yNzk3NiAzIDYuMTE5ODQgMyA3LjhWMTMuNUMzIDE0Ljg5NzggMyAxNS41OTY3IDMuMjI4MzYgMTYuMTQ4MUMzLjUzMjg0IDE2Ljg4MzEgNC4xMTY4NyAxNy40NjcyIDQuODUxOTUgMTcuNzcxNkM1LjQwMzI2IDE4IDYuMTAyMTggMTggNy41IDE4QzcuOTg4NTggMTggOC4yMzI4NyAxOCA4LjQ1OTUxIDE4LjA1MzVDOC43NjE2OSAxOC4xMjQ4IDkuMDQzMTIgMTguMjY1NiA5LjI4MTUgMTguNDY0NUM5LjQ2MDI4IDE4LjYxMzcgOS42MDY4NSAxOC44MDkxIDkuOSAxOS4yWiIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPg0KPC9zdmc+");
  cursor: pointer;
  position: absolute;
  width: 40px;
  height: 40px;
  background-color: white;
}
`;

const accordionStyles = {
	accordion: {
		boxShadow: 'none',
		marginBottom: '4px',
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
			<Accordion sx={accordionStyles.sub} key={`panel${name}-${index}`}>
				<AccordionSummary
					expandIcon={
						item.children && item.children.length && <ExpandMoreIcon />
					}
					sx={accordionStyles.inner}>
					<Typography>{item.name}</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography
						sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer' }}>
						{item.description}
					</Typography>
				</AccordionDetails>
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
					sx={accordionStyles.accordion}
					key={`panel${index}`}>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						sx={accordionStyles.summary}>
						<Typography>{item.name}</Typography>
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

function Note({ name, text, date, framework }) {
	return (
		<Card>
			<CardHeader
				avatar={
					<Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
						{name.charAt(0)}
					</Avatar>
				}
				action={
					<IconButton aria-label="settings">
						<MoreVertIcon />
					</IconButton>
				}
				title={name}
				subheader={new Date(date).toLocaleString()}
			/>
			<CardContent>
				<Typography variant="p" sx={{ fontFamily: '"DINPro", sans-serif' }}>
					{text}
				</Typography>
				{framework ? (
					<Typography
						variant="body2"
						color="text.secondary"
						sx={{ marginTop: '8px' }}>
						Framework: {framework.name}
					</Typography>
				) : (
					''
				)}
			</CardContent>
		</Card>
	);
}

function AlignDialog({ onClose, open, onSelect = (tag) => {} }) {
	const [selected, setSelected] = React.useState({});
	const handleSelect = () => {
		onSelect(selected);
		onClose();
	};
	return (
		<Dialog onClose={() => onClose(/*selectedValue*/)} open={open}>
			<DialogTitle>Framework Select</DialogTitle>
			<DialogContent>
				<AlignWidget onSelect={setSelected} />
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleSelect} autoFocus>
					Agree
				</Button>
			</DialogActions>
		</Dialog>
	);
}

const CButton = styled(Button)(({ theme }) => ({
	padding: '6px 12px',
	borderColor: '#303e48',
	backgroundColor: '#303e48',
	color: '#fad000',
	fontFamily: '"DINPro", sans-serif',
	boxShadow: '0 3px 0 #202c34',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	display: 'block',
	maxWidth: '100%',
	'&:hover': {
		borderColor: '#8f9bae',
		backgroundColor: '#8f9bae',
		color: '#ffffff',
		boxShadow: '0 3px 0 #7c8ba2',
	},
}));

const GButton = styled(Button)(({ theme }) => ({
	padding: '4px 12px',
	borderColor: '#56798f',
	backgroundColor: '#56798f',
	color: '#ffffff',
	fontFamily: '"DINPro", sans-serif',
	boxShadow: '0 3px 0 #202c34',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	overflow: 'hidden',
	maxWidth: '100%',
	'&:hover': {
		borderColor: '#8f9bae',
		backgroundColor: '#8f9bae',
		color: '#ffffff',
		boxShadow: '0 3px 0 #7c8ba2',
	},
}));

const post = (url, body) =>
	new Promise((res, rej) => {
		axios
			.get(`${process.env.REACT_APP_API_URL}/api/csrf-token`, {
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				withCredentials: false,
			})
			.then(({ data }) => {
				const headers = {
					'Content-Type': 'multipart/form-data',
					'X-Csrftoken': data.token,
				};
				axios({
					method: 'POST',
					url,
					headers,
					data: { ...body, csrfmiddlewaretoken: data.token },
				})
					.then(({ data }) => res(data))
					.catch(rej);
			})
			.catch(rej);
	});

let annotationUri;

function categorizeByTimeRange(data, range) {
	const result = [];
	if (data.length === 0) return result;
	// Sort the data by end_position to ensure proper range grouping
	data.sort((a, b) => a.end_position - b.end_position);
	// Start the grouping
	let currentGroup = [data[0]]; // Start with the first item
	for (let i = 1; i < data.length; i++) {
		const currentItem = data[i];
		const lastItemInGroup = currentGroup[currentGroup.length - 1];
		// Check if the current item is within the range of the last item in the current group
		if (currentItem.end_position - lastItemInGroup.end_position <= range) {
			currentGroup.push(currentItem);
		} else {
			// If not in range, push the current group to results and start a new group
			result.push(currentGroup);
			currentGroup = [currentItem]; // Start a new group with the current item
		}
	}
	// Push the last group if it exists
	if (currentGroup.length > 0) {
		result.push(currentGroup);
	}
	return result;
}

const getTagPositions = (htmlString) => {
	const regex = /(<\/?([a-zA-Z0-9]+)[^>]*>)/g;
	const positions = [];
	let match;
	while ((match = regex.exec(htmlString)) !== null) {
		const tag = match[1]; // the full tag
		const startPos = match.index; // start position of the tag
		const endPos = startPos + tag.length - 1; // end position of the tag
		positions.push({
			tag: match[2], // the tag name
			start: startPos,
			end: endPos,
		});
	}
	return positions;
};

function findSectionIndex(htmlString, charIndex) {
	// Create an array of sections from the HTML string
	const sections = Array.from(htmlString.matchAll(/<[^>]+>.*?<\/[^>]+>/g)).map(
		(m) => m[0]
	);
	// Calculate the cumulative length of each section
	let cumulativeLength = 0;
	for (let i = 0; i < sections.length; i++) {
		cumulativeLength += sections[i].length;
		if (charIndex < cumulativeLength) {
			return i; // Return the section index
		}
	}
	return -1; // If charIndex is out of range, return -1
}

function getSelectionText() {
	let text = '';
	if (window.getSelection) {
		text = window.getSelection().toString();
	} else if (document.selection && document.selection.type != 'Control') {
		text = document.selection.createRange().text;
	}
	return text;
}

function getStartEndPositions(mainString, searchText) {
	const startPosition = mainString.indexOf(searchText);
	if (startPosition !== -1) {
		const endPosition = startPosition + searchText.length;
		return { start: startPosition, end: endPosition };
	} else {
		return null; // or handle the case when searchText is not found
	}
}

function timeToSeconds(timeString, text = '') {
	if (typeof timeString === 'number') return timeString;
	const parts = timeString.split(':');
	let seconds = 0;
	if (parts.length === 3) {
		// hh:mm:ss format
		seconds =
			parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
	} else if (parts.length === 2) {
		// mm:ss format
		seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
	} else if (parts.length === 1) {
		// ss format
		seconds = parseInt(parts[0]);
	}
	if (isNaN(seconds)) alert('Enter valid time!');
	else if (seconds > duration)
		alert(text + ' time entered cannot be bigger than duration of the video');
	else if (seconds < 0) alert('Time cannot be negative');
	else return seconds;
}

function matchTimeFormat(input) {
	const regex = /^(?:(\d{1,2}):(\d{2}):(\d{2})|(\d{1,2}):(\d{2})|(\d{1,2}))$/;
	return !regex.test(input);
}

const notesByComments = [];
let quote;
let duration = 1000;

export function Case() {
	const { id } = useParams();
	const [value, setValue] = React.useState(0);
	const handleChange = (_event, newValue) => setValue(newValue);
	const [title, setTitle] = React.useState('');
	const [abstract, setAbstract] = React.useState('');
	const [thumbnail, setThumbnail] = React.useState('');
	const [entryId, setEntryId] = React.useState('');
	const [generalSubjects, setGeneralSubjects] = React.useState([]);
	const [grades, setGrades] = React.useState([]);
	const [videos, setVideos] = React.useState([]);
	const [video, setVideo] = React.useState();
	const [checked, setChecked] = React.useState(false);
	const [checkedTag, setCheckedTag] = React.useState(false);
	const [commentary, setCommentary] = React.useState('');
	const [commentaryFile, setCommentaryFile] = React.useState('');
	const [instruction, setInstruction] = React.useState('');
	const [material, setMaterial] = React.useState('');
	const [frameworks, setFrameworks] = React.useState([]);
	const [notes, setNotes] = React.useState([]);
	const [selectedNotes, setSelectedNotes] = React.useState([]);
	const [annotations, setAnnotations] = React.useState([]);
	const [form, setForm] = React.useState(false);
	const [tagForm, setTagForm] = React.useState(false);
	const [active, setActive] = React.useState(-1);
	const [alignOpen, setAlignOpen] = React.useState(false);
	const [alignOpenVideo, setAlignOpenVideo] = React.useState(false);
	const [selectedTag, setSelectedTag] = React.useState({});
	const [selectedTagVideo, setSelectedTagVideo] = React.useState({});
	const [formStart, setFormStart] = React.useState('');
	const [formStartTag, setFormStartTag] = React.useState('');
	const [formEnd, setFormEnd] = React.useState('');
	const [formEndTag, setFormEndTag] = React.useState('');
	const [formText, setFormText] = React.useState('');
	const [formTextTag, setFormTextTag] = React.useState('');
	const [formTextVideo, setFormTextVideo] = React.useState('');
	const [selectedComment, setSelectedComment] = React.useState(-1);
	const [textRange, setTextRange] = React.useState({});
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const openSave = Boolean(anchorEl);

	const handleClick = ({ currentTarget }) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	React.useEffect(() => {
		const styleTag = document.createElement('style');
		styleTag.textContent = styles;
		document.head.appendChild(styleTag);
		//
		axios
			.get(`${process.env.REACT_APP_API_URL}/api/courseware/v1/lessons/${id}`, {
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				withCredentials: false,
			})
			.then(({ data }) => {
				const {
					title,
					abstract,
					thumbnail,
					general_subjects,
					grades,
					sections,
					alignment_tags,
					annotation_uri,
				} = data;
				setTitle(title);
				annotationUri = annotation_uri;
				setAbstract(abstract);
				setThumbnail(thumbnail);
				general_subjects && setGeneralSubjects(general_subjects);
				grades && setGrades(grades);
				setEntryId(thumbnail.match(/entry_id\/(.+?)\//)?.[1]);
				if (sections && sections.length) {
					setVideos(sections[0].attachments);
					if (sections.length > 1) {
						setCommentary(sections[1].content);
						setCommentaryFile(sections[1].attachments[0]?.url);
					}
					if (sections.length > 2) {
						setInstruction(sections[2].content);
						setMaterial(sections[2].attachments[0]?.url);
					}
				}
				//
				var control = document.querySelector('template').querySelector('span');
				const commentary = document.querySelector('.commentary');
				control.addEventListener('pointerdown', oncontroldown, true);
				document.querySelectorAll('.comment').forEach((item) => {
					item.onpointerup = () => {
						let selection = document.getSelection(),
							text = selection.toString();
						if (text !== '') {
							let rect = selection.getRangeAt(0).getBoundingClientRect();
							const boundary = commentary.getBoundingClientRect();
							control.style.top = `calc(${rect.top}px - 48px - ${boundary.top}px)`;
							control.style.left = `calc(${rect.left}px + calc(${rect.width}px / 2) - 40px - ${boundary.left}px)`;
							control['text'] = text;
							commentary.appendChild(control);
						}
					};
				});
				function oncontroldown(event) {
					setActive(-1);
					quote = this.text;
					const range = getStartEndPositions(
						sections[1].content
							.trim()
							.replace(/<[^>]+>/g, '')
							.replace(/\n/g, '')
							.replace(/&#39;/g, "'"),
						quote.trim().replace(/\n/g, '')
					);
					setTextRange(range);
					setSelectedComment(findSectionIndex(sections[1].content, range.end));
					this.remove();
					document.getSelection().removeAllRanges();
					event.stopPropagation();
				}
				document.onpointerdown = () => {
					let control = document.querySelector('#control');
					if (control !== null) {
						control.remove();
						document.getSelection().removeAllRanges();
					}
				};
				//
				const frameworks = [];
				for (const tag of alignment_tags) {
					if (
						frameworks.findIndex((item) => item.name === tag.standard.name) < 0
					)
						frameworks.push({ ...tag.standard, children: [] });
				}
				for (const tag of alignment_tags) {
					const index = frameworks.findIndex(
						(item) => item.name === tag.standard.name
					);
					frameworks[index].children.push(tag);
				}
				setFrameworks(frameworks);
				axios
					.get('/api/annotations?uri=' + annotationUri, {
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
						withCredentials: false,
					})
					.then(({ data }) => {
						const annotations = data?.pop()?.annotations;
						setAnnotations(annotations);
						annotations
							?.filter((item) => !!item.quote)
							?.forEach((item) => {
								const i = findSectionIndex(
									sections[1].content,
									item.end_position
								);
								if (i < 0) return;
								if (notesByComments[i]) notesByComments[i].push(item);
								else notesByComments[i] = [item];
							});
						if (sections[0].attachments.length) {
							setVideo(sections[0].attachments[0]);
						}
					});
			});
	}, []);
	const publish = (
		isPrivate = false,
		text = '',
		isChecked = false,
		start,
		end,
		tag
	) => {
		const start_position = isChecked ? 0 : timeToSeconds(start || 0, 'Start');
		const end_position = isChecked
			? duration
			: timeToSeconds(end || duration, 'End');
		if (!start_position || !end_position) return;
		post('/api/annotations/annotate', {
			uri: annotationUri,
			text,
			start_position,
			end_position,
			alignment_tag: tag.value,
			private: isPrivate,
		}).then(() => window.location.reload());
	};
	const create = () => {
		post('/api/annotations/annotate', {
			uri: annotationUri,
			text: formText,
			start_position: textRange.start,
			end_position: textRange.end,
			quote,
			private: false,
		}).then(() => window.location.reload());
	};
	return (
		<Box sx={{ width: '100%', padding: '64px 0' }}>
			<GlobalStyles styles={globalStyles} />
			<div
				style={{
					display: 'flex',
					gap: '8px',
					height: '70px',
					backgroundColor: '#fefefe',
					padding: '0 10% 36px',
					'@media (maxWidth: 1168px)': { padding: '0 16px' },
				}}>
				<CButton href="/courseware/new">Back</CButton>
				<div style={{ flex: 1 }}></div>
				<CButton href={`/admin/courseware/lesson/${id}/change/`}>
					Edit in Admin
				</CButton>
				<div>
					<CButton
						id="fade-button"
						aria-controls={openSave ? 'fade-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={openSave ? 'true' : undefined}
						endIcon={<KeyboardArrowDownIcon />}
						onClick={handleClick}
						sx={{ display: 'flex', height: '34px' }}>
						Save
					</CButton>
					<Menu
						id="fade-menu"
						MenuListProps={{
							'aria-labelledby': 'fade-button',
						}}
						anchorEl={anchorEl}
						open={openSave}
						onClose={handleClose}>
						<div>
							<div
								style={{
									width: '350px',
									height: '200px',
									padding: '16px',
									borderBottom: '1px dashed #ccc',
								}}>
								<Typography>Groups</Typography>
							</div>
							<div>
								<CButton style={{ float: 'right', margin: '16px' }}>
									Create new folder
								</CButton>
							</div>
						</div>
					</Menu>
				</div>
			</div>
			<Grid
				container
				spacing={2}
				sx={{
					padding: '0 10%',
					'@media (maxWidth: 1168px)': { padding: '0 16px' },
				}}>
				<Grid item xs={4}>
					<div className="sidebar">
						<p className="case-id">Case #{id}</p>
						<h1>{title}</h1>
						<div
							className="description"
							dangerouslySetInnerHTML={{ __html: abstract }}></div>
						<div className="case-fields">
							<div className="case-subjects">
								<h2>TOPICS</h2>
								<dl className="case-field case-field-subjects">
									{generalSubjects.map((item) => (
										<dd className="case-field-subject" key={item.slug}>
											<a
												href={'/courseware/new?f.general_subject=' + item.slug}>
												{item.name}
											</a>
										</dd>
									))}
								</dl>
							</div>
							<div className="case-grades">
								<h2>GRADES</h2>
								<ul className="case-field case-field-grades">
									{grades.map((item) => (
										<li key={item.code}>
											<a href={'/courseware/new?f.grade_codes=' + item.code}>
												{item.name}
											</a>
										</li>
									))}
								</ul>
							</div>
						</div>
						<div>
							<div className="toggle-part">
								<h2 className="toggle-collapse">Frameworks</h2>
								<GButton
									onClick={() => setTagForm(true)}
									startIcon={<AddIcon />}>
									Add Tag
								</GButton>
							</div>
							{tagForm ? (
								<Card>
									<CardContent>
										<Grid container sx={{ margin: '16px 0' }}>
											<Grid item xs={12}>
												<div>
													<FormControlLabel
														control={
															<Checkbox
																checked={checkedTag}
																onChange={({ target }) =>
																	setCheckedTag(target.checked)
																}
																inputProps={{ 'aria-label': 'controlled' }}
															/>
														}
														label="Entire Video"
													/>
												</div>
												<div
													style={{
														display: 'flex',
														gap: '8px',
														margin: '8px 0',
													}}>
													<TextField
														label="Start time"
														variant="outlined"
														size="small"
														value={formStartTag}
														onChange={({ target }) =>
															setFormStartTag(target.value)
														}
														disabled={checkedTag}
														error={matchTimeFormat(formStartTag)}
														helperText="Enter time (hh:mm:ss)"
													/>
													<TextField
														label="End time"
														variant="outlined"
														size="small"
														value={formEndTag}
														onChange={({ target }) =>
															setFormEndTag(target.value)
														}
														disabled={checkedTag}
														error={matchTimeFormat(formEndTag)}
														helperText="Enter time (hh:mm:ss)"
													/>
												</div>
												<div>
													<TextField
														label="Video note"
														multiline
														rows={4}
														variant="outlined"
														size="small"
														style={{ width: '100%' }}
														value={formTextTag}
														onChange={({ target }) =>
															setFormTextTag(target.value)
														}
													/>
												</div>
											</Grid>
										</Grid>
										<CButton onClick={() => setAlignOpen(true)}>
											{selectedTag.label || 'Framework Tag'}
										</CButton>
										<AlignDialog
											open={alignOpen}
											onClose={() => setAlignOpen(false)}
											onSelect={setSelectedTag}
										/>
									</CardContent>
									<CardActions>
										<CButton
											disabled={
												!checkedTag &&
												(matchTimeFormat(formEndTag) ||
													matchTimeFormat(formStartTag))
											}
											onClick={() =>
												publish(
													false,
													formTextTag,
													checkedTag,
													formStartTag,
													formEndTag,
													selectedTag
												)
											}>
											Publish
										</CButton>
										<CButton
											disabled={
												!checkedTag &&
												(matchTimeFormat(formEndTag) ||
													matchTimeFormat(formStartTag))
											}
											onClick={() =>
												publish(
													true,
													formTextTag,
													checkedTag,
													formStartTag,
													formEndTag,
													selectedTag
												)
											}>
											Draft
										</CButton>
										<CButton onClick={() => setTagForm(false)}>Cancel</CButton>
									</CardActions>
								</Card>
							) : (
								''
							)}
							<div>
								<FilterItems items={frameworks} />
							</div>
						</div>
					</div>
				</Grid>
				<Grid item xs={8}>
					<div style={{ padding: '10px', backgroundColor: '#303e47' }}>
						<div style={{ marginBottom: '8px' }}>
							{videos.map((item, index) => (
								<Button
									key={index}
									variant="contained"
									onClick={() => setVideo(videos[index])}
									disabled={videos[index].title === video?.title}>
									Video {index + 1}
								</Button>
							))}
						</div>
						{/* <VideoPlayer width="100%" /> */}
						{video ? (
							<Player
								entryId={video?.url?.match(/entry_id=(.+?)\&/)?.[1]}
								onLoad={(data) => {
									// const vid = document.querySelector('video')
									// console.log(data, vid)
									duration = data.sources.duration; // vid ? vid.duration : 1000 // sec
									// document.querySelector('.playkit-time-display').innerText.split('/').pop().trim() // 03:23
									const range = duration / 100;
									let notes = annotations
										?.filter((item) => !item.quote)
										?.filter(
											(item) =>
												item.end_position <= duration &&
												item.start_position >= 0 &&
												item.start_position <= duration &&
												item.end_position >= 0
										);
									notes = categorizeByTimeRange(notes, range);
									notes = notes.map((item) => ({
										data: item,
										position: (item[0].end_position / duration) * 98 + '%',
									}));
									setNotes(notes);
								}}
								onFail={() => {}}
							/>
						) : (
							''
						)}
						<div className="hashmarks-ct js-hashmarks-ct">
							<span className="hashmarks-help-text">
								Click to see Video Notes
							</span>
							<ul className="list-unstyled hashmarks">
								<li
									className="hashmark-panel js-hashmark-panel active"
									data-kaltura-id="1_m64st8go">
									{notes.map((item, index) => (
										<div
											key={index}
											style={{ left: item.position }}
											className="hashmark-link js-hashmark tooltip"
											onClick={() => setSelectedNotes(item.data)}>
											<span className="tooltiptext">
												{item.data.length} Video Note
												{item.data.length > 1 ? 's' : ''}
											</span>
										</div>
									))}
								</li>
							</ul>
							<GButton
								sx={{ margin: '4px 0' }}
								onClick={() => setForm(!form)}
								startIcon={<AddIcon />}>
								Video Note
							</GButton>
						</div>
					</div>
					{selectedNotes.length ? (
						<div
							style={{
								padding: '15px 20px 20px',
								backgroundColor: '#efeff1',
								display: 'flex',
								flexDirection: 'column',
								gap: '8px',
							}}>
							<div
								style={{
									display: 'flex',
									justifyContent: 'space-between',
								}}>
								<h4>Video Notes ({selectedNotes.length})</h4>
								<Button
									onClick={() => setSelectedNotes([])}
									sx={{ padding: '0' }}>
									Hide Notes
								</Button>
							</div>
							{selectedNotes.map((item) => (
								<Note
									key={item.id}
									name={
										item.user?.first_name
											? `${item.user.first_name} ${item.user.last_name}`
											: item.user.email
									}
									text={item.text}
									date={item.created}
									framework={item.alignment_tag}
								/>
							))}
						</div>
					) : (
						''
					)}
					{form ? (
						<Card sx={{ minWidth: 275 }}>
							<CardContent>
								<Grid container sx={{ margin: '16px 0' }}>
									<Grid item xs={6}>
										<div>
											<FormControlLabel
												control={
													<Checkbox
														checked={checked}
														onChange={({ target }) =>
															setChecked(target.checked)
														}
														inputProps={{ 'aria-label': 'controlled' }}
													/>
												}
												label="Entire Video"
											/>
										</div>
										<div
											style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
											<TextField
												label="Start time"
												variant="outlined"
												size="small"
												value={formStart}
												onChange={({ target }) => setFormStart(target.value)}
												disabled={checked}
												error={matchTimeFormat(formStart)}
												helperText="Enter time (hh:mm:ss)"
											/>
											<TextField
												label="End time"
												variant="outlined"
												size="small"
												value={formEnd}
												onChange={({ target }) => setFormEnd(target.value)}
												disabled={checked}
												error={matchTimeFormat(formEnd)}
												helperText="Enter time (hh:mm:ss)"
											/>
										</div>
										<div>
											<TextField
												label="Video note"
												multiline
												rows={4}
												variant="outlined"
												size="small"
												style={{ width: '100%' }}
												value={formTextVideo}
												onChange={({ target }) =>
													setFormTextVideo(target.value)
												}
											/>
										</div>
									</Grid>
									<Grid item xs={6}></Grid>
								</Grid>
								<CButton onClick={() => setAlignOpenVideo(true)}>
									{selectedTagVideo.label || 'Framework Tag'}
								</CButton>
								<AlignDialog
									open={alignOpenVideo}
									onClose={() => setAlignOpenVideo(false)}
									onSelect={setSelectedTagVideo}
								/>
							</CardContent>
							<CardActions>
								<CButton
									disabled={
										!checked &&
										(matchTimeFormat(formEnd) || matchTimeFormat(formStart))
									}
									onClick={() =>
										publish(
											false,
											formTextVideo,
											checked,
											formStart,
											formEnd,
											selectedTagVideo
										)
									}>
									Publish
								</CButton>
								<CButton onClick={() => setForm(false)}>Cancel</CButton>
							</CardActions>
						</Card>
					) : (
						''
					)}
					<Box
						sx={{ borderBottom: 1, borderColor: 'divider', marginTop: '4px' }}>
						<Tabs
							value={value}
							onChange={handleChange}
							aria-label="basic tabs example">
							<Tab label="Commentary" />
							<Tab label="Instructional Materials" />
							<Tab label="Notes" />
						</Tabs>
					</Box>
					{/* <div hidden={value !== 0}>
            <div style={{ backgroundColor: '#efeff1', padding: '16px' }}>
              <Note />
            </div>
          </div> */}
					<div hidden={value !== 0}>
						<div className="links">
							<a href={commentaryFile} target="_blank">
								{/* <i className="fa fa-external-link"></i> */}
								Open Commentary
							</a>
							<div className="how-to-wrapper visible-xs-block visible-sm-inline-block visible-md-inline-block visible-lg-inline-block">
								<button
									type="button"
									className="case-link how-to-link"
									data-trigger="hover focus"
									data-original-title=""
									title="">
									{/* <i className="fa fa-question-circle"></i> */}
									How to add notes on Commentary
									{/* <div className="how-to-link-popover-content js-how-to-link-popover-content">
                    <ul className="how-to-link-popover-text">
                      <li>Select text to annotate and click on note icon.</li>
                      <li>Write a note.</li>
                      <li>Add framework tag if needed.</li>
                      <li>Choose "Only Me" or select group(s) and/or group leader(s) with whom to share the note.</li>
                      <li>Select Publish. A speech bubble icon will appear on the right. Click on icon to open and close note.</li>
                    </ul>
                  </div> */}
								</button>
							</div>
						</div>
						{/* <div dangerouslySetInnerHTML={{__html: commentary}} className="commentary"></div> */}
						<div className="commentary">
							{commentary?.match(/<(.+)>.*?<\/\1>/g)?.map((item, index) => {
								if (item.startsWith('<p')) {
									return (
										<div
											key={index}
											style={{
												display: 'flex',
												alignItems: 'flex-start',
												gap: '16px',
											}}>
											<div
												style={{ flex: 1 }}
												dangerouslySetInnerHTML={{
													__html: item.replace('<p', '<p class="comment"'),
												}}></div>
											<div
												style={{
													flex:
														active === index && notesByComments[active]
															? 1
															: '',
												}}>
												{active === index ? (
													<div>
														{notesByComments[active]?.map((item) => (
															<Note
																key={item.id}
																name={
																	item.user?.first_name
																		? `${item.user.first_name} ${item.user.last_name}`
																		: item.user.email
																}
																text={item.text}
																date={item.created}
																framework={item.alignment_tag}
															/>
														))}
														{notesByComments[active] ? (
															<Button onClick={() => setActive(-1)}>
																Hide
															</Button>
														) : (
															''
														)}
														{!notesByComments[active] && (
															<span>No notes yet.</span>
														)}
													</div>
												) : (
													<div>
														<IconButton onClick={() => setActive(index)}>
															<Comment />
														</IconButton>
														{notesByComments[index]?.length ? (
															<span>({notesByComments[index]?.length})</span>
														) : (
															''
														)}
														{selectedComment === index ? (
															<Card>
																<CardHeader title="New Commentary Note" />
																<CardContent>
																	<TextField
																		label="Leave a Comment"
																		multiline
																		rows={4}
																		variant="outlined"
																		size="small"
																		style={{ width: '100%' }}
																		value={formText}
																		onChange={({ target }) =>
																			setFormText(target.value)
																		}
																	/>
																</CardContent>
																<CardActions>
																	<CButton onClick={create}>Publish</CButton>
																	<CButton
																		onClick={() => setSelectedComment(-1)}>
																		Cancel
																	</CButton>
																</CardActions>
															</Card>
														) : (
															''
														)}
													</div>
												)}
											</div>
										</div>
									);
								}
								return (
									<div
										key={index}
										dangerouslySetInnerHTML={{ __html: item }}></div>
								);
							})}
							<template>
								<span id="control"></span>
							</template>
						</div>
					</div>
					<div hidden={value !== 1}>
						<div className="links">
							<a href={material} target="_blank" className="case-link">
								{/* <i className="fa fa-external-link"></i> */}
								Open Instructional Materials
							</a>
							<button
								className="btn btn-link pull-right show-popup-form-button mod-material-note js-show-material-note-form"
								title="Add a note about Instructional Materials">
								{/* <i className="fa fa-plus"></i> */}
								Instructional Material Note
							</button>
						</div>
						<div dangerouslySetInnerHTML={{ __html: instruction }}></div>
					</div>
					<div hidden={value !== 2}>
						{annotations?.filter((item) => !item.quote)?.length ? (
							<div
								style={{
									padding: '15px 20px 20px',
									backgroundColor: '#efeff1',
									display: 'flex',
									flexDirection: 'column',
									gap: '8px',
								}}>
								<div
									style={{
										display: 'flex',
										justifyContent: 'space-between',
									}}>
									<h4>
										Video Notes (
										{annotations?.filter((item) => !item.quote)?.length})
									</h4>
								</div>
								{annotations
									?.filter((item) => !item.quote)
									?.map((item) => (
										<Note
											key={item.id}
											name={
												item.user?.first_name
													? `${item.user.first_name} ${item.user.last_name}`
													: item.user.email
											}
											text={item.text}
											date={item.created}
											framework={item.alignment_tag}
										/>
									))}
							</div>
						) : (
							''
						)}
					</div>
				</Grid>
			</Grid>
		</Box>
	);
}

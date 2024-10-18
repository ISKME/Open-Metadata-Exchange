/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Modal } from 'widgets/Modal';
import StarIcon from 'shared/assets/icons/star.svg';
import cls from './Asset.module.scss';
import Pen from '../../../shared/assets/icons/pen.svg';
import historyImage from '../../../shared/assets/icons/history.png';
import remix from '../../../shared/assets/icons/remix.png';
import cc from '../../../shared/assets/icons/cc.png';
import book from '../../../shared/assets/icons/book.png';
import check from '../../../shared/assets/icons/check.png';
import note from '../../../shared/assets/icons/note.png';

const Fab = () => (
	<button className={cls.fab}>
		<Pen />
	</button>
);

export function Asset() {
	const params = useParams();
	let details = params['*'];
	if (details.endsWith('/')) details = details.substring(0, details.length - 1);
	const [title, setTitle] = useState('');
	const [create, setCreate] = useState('');
	const [update, setUpdate] = useState('');
	const [desc, setDesc] = useState('');
	const [license, setLicense] = useState('');
	const [licenseImage, setLicenseImage] = useState('');
	const [url, setUrl] = useState('');
	const [subjects, setSubjects] = useState([]);
	const [levels, setLevels] = useState([]);
	const [collections, setCollections] = useState([]);
	const [materials, setMaterials] = useState([]);
	const [languages, setLanguages] = useState([]);
	const [formats, setFormats] = useState([]);
	const [keywords, setKeywords] = useState([]);
	const [authors, setAuthors] = useState([]);
	const [history, setHistory] = useState([]);
	const [rate, setRate] = useState('');
	const [thumbnail, setThumbnail] = useState('');
	const [visits, setVisits] = useState(0);
	const [saves, setSaves] = useState(0);
	const [downloads, setDownloads] = useState(0);

	useEffect(() => {
		// `/api/imls/v2/resources/${name}/materials/${id}`
		// axios.get(`/api/imls/v2/resources/${details}`).then(({ data }) => {
		axios
			.get(`${process.env.REACT_APP_API_URL}/api/imls/v2/resources/${details}`)
			.then(({ data }) => {
				const {
					// id,
					authors,
					createDate,
					abstract,
					generalSubjects,
					keywords,
					languages,
					levels,
					materialTypes,
					mediaFormats,
					rating,
					title,
					thumbnail,
					visits,
					saves_count,
					downloads_count,
					collections_titles,
					license_title,
					license_image,
					micrositeResourceURL,
					updateDate,
					history,
				} = data.resource;
				setTitle(title);
				setDesc(abstract);
				setSubjects(generalSubjects);
				setCollections(collections_titles);
				setLevels(levels);
				setAuthors(authors);
				setHistory(history);
				setRate(rating);
				setLicense(license_title);
				setLicenseImage(license_image);
				setMaterials(materialTypes);
				setLanguages(languages);
				setFormats(mediaFormats);
				setKeywords(keywords);
				setThumbnail(thumbnail);
				setThumbnail(thumbnail);
				setVisits(visits || 0);
				setSaves(saves_count || 0);
				setDownloads(downloads_count || 0);
				setUrl(micrositeResourceURL);
				setUpdate(updateDate.replace(/^(\d+)-(\d+)-.*/, '$2/$1'));
				setCreate(new Date(createDate).toDateString().slice(4));
			});
	}, []);

	const navigate = useNavigate();
	const modal = useRef();

	const handleRateChange = ({ target }) => {
		setRate(target.value);
	};

	function save() {
		//   axios.post('/my/save-widget/save/', {
		//     target_title=test+folder&parent=&item_ids%5B%5D=81.3889
		//   });
	}

	return (
		<div className={cls.Asset}>
			<Modal ref={modal} header="Version History">
				{history.map((item) => (
					<div style={{ marginBottom: '8px' }}>
						{item.change_type === 'remixed_from' && (
							<>
								<span>Remixed from </span>
								<a href={item.related_object_url}>{item.related_object_name}</a>
							</>
						)}
						{item.change_type === 'remix_published' && (
							<span>Remix published </span>
						)}
						<span>{`on ${new Date(item.date)
							.toDateString()
							.substring(4)}`}</span>
						{item.author_name && (
							<a href={item.author_url}>{` by ${item.author_name}`}</a>
						)}
						{item.change_type === 'remix_published' && (
							<>
								<span>: </span>
								<a href={item.related_object_url}>{item.related_object_name}</a>
							</>
						)}
					</div>
				))}
			</Modal>
			<a href="#" onClick={() => navigate(-1)}>
				⬅ Back to collection
			</a>
			<section className={`${cls.description} ${cls.split}`}>
				<div>
					<div className={cls.cover}>
						<img
							src={thumbnail}
							alt={title}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>
					</div>
					<div className={cls.info}>
						<div>{`${visits} Views`}</div>
						<div>{`${saves} Saves`}</div>
						<div>{`${downloads} Downloads`}</div>
					</div>
				</div>
				<div className={cls.desc}>
					<h1>{title}</h1>
					<div>
						<div>
							{Array.from({ length: Number(rate) || 0 }, (_, index) => (
								<StarIcon className={cls.star_icon} key={index} />
							))}
							{Array.from({ length: 5 - (Number(rate) || 0) }, (_, index) => (
								<StarIcon className={cls.star_icon_disable} key={index} />
							))}
							{/* <div className={cls.ratingControl}> */}
							{/*   <input id="score100" className={cls.ratingControl__radio} type="radio" name="rating" value="100" checked={rate === '100'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score100" className={cls.ratingControl__star} title="Five Stars" /> */}
							{/*   <input id="score90" className={cls.ratingControl__radio} type="radio" name="rating" value="90" checked={rate === '90'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score90" className={cls.ratingControl__star} title="Four & Half Stars" /> */}
							{/*   <input id="score80" className={cls.ratingControl__radio} type="radio" name="rating" value="80" checked={rate === '80'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score80" className={cls.ratingControl__star} title="Four Stars" /> */}
							{/*   <input id="score70" className={cls.ratingControl__radio} type="radio" name="rating" value="70" checked={rate === '70'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score70" className={cls.ratingControl__star} title="Three & Half Stars" /> */}
							{/*   <input id="score60" className={cls.ratingControl__radio} type="radio" name="rating" value="60" checked={rate === '60'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score60" className={cls.ratingControl__star} title="Three Stars" /> */}
							{/*   <input id="score50" className={cls.ratingControl__radio} type="radio" name="rating" value="50" checked={rate === '50'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score50" className={cls.ratingControl__star} title="Two & Half Stars" /> */}
							{/*   <input id="score40" className={cls.ratingControl__radio} type="radio" name="rating" value="40" checked={rate === '40'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score40" className={cls.ratingControl__star} title="Two Stars" /> */}
							{/*   <input id="score30" className={cls.ratingControl__radio} type="radio" name="rating" value="30" checked={rate === '30'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score30" className={cls.ratingControl__star} title="One & Half Star" /> */}
							{/*   <input id="score20" className={cls.ratingControl__radio} type="radio" name="rating" value="20" checked={rate === '20'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score20" className={cls.ratingControl__star} title="One Star" /> */}
							{/*   <input id="score10" className={cls.ratingControl__radio} type="radio" name="rating" value="10" checked={rate === '10'} onChange={handleRateChange} /> */}
							{/*   <label htmlFor="score10" className={cls.ratingControl__star} title="Half Star" /> */}
							{/* </div> */}
						</div>
						<div />
					</div>
					<span className={cls.date}>Updated {update}</span>
					<div>
						<button
							onClick={() => {
								window.location.href = url;
							}}>
							View Resource
						</button>{' '}
						<button onClick={save}>Save</button>
					</div>
				</div>
			</section>
			<section>
				<div className={cls.f}>
					<div>
						<img src={historyImage} alt="history" width="24" />3 Updates/Edits
						since first published {create}
					</div>
					{history && history.length ? (
						<div>
							<img src={remix} alt="history" width="24" />
							{history.length} Remixes
						</div>
					) : (
						''
					)}
					{history && history.length ? (
						<a
							href="#"
							onClick={() => {
								if (modal && modal.current && modal.current?.open) {
									modal.current?.open();
								}
							}}>
							Show full history
						</a>
					) : (
						''
					)}
				</div>
			</section>
			<div className={cls.split}>
				<section className={cls.big}>
					<div>
						<div>
							<h2>Description</h2>
							<p className={cls['para-space']}>
								<b>Overview: </b>
								{desc}
							</p>
							<p className={cls['para-space']}>
								<b>Subject: </b>
								{subjects.join(', ')}
								<br />
								<b>Level: </b>
								{levels.join(' / ')}
								<br />
								<b>Material Type: </b>
								{materials.join(', ')}
								<br />
								<b>Author: </b>
								{authors?.join(', ')}
								<br />
								<b>Collection: </b>
								{collections?.join(', ')}
								<br />
								<b>Language: </b>
								{languages.join(', ')}
								<br />
								<b>Media Format: </b>
								{formats.join('/')}
								<br />
								<br />
								{license && <b>License: </b>}
								{license}
								{licenseImage && (
									<img
										src={licenseImage}
										alt="CC"
										style={{ marginLeft: '8px' }}
									/>
								)}
							</p>
						</div>
						<div>
							<b>Tags: </b>
							<button className={cls.second}>Add New Tag</button>
						</div>
						<br />
						<div className={cls.BN}>
							{keywords.map((item) => (
								<a href="#">{item}</a>
							))}
						</div>
					</div>
				</section>
				{/* <section> */}
				{/*   <div> */}
				{/*     <h1>Content Outline</h1> */}
				{/*     <ul className={cls.nostyle}> */}
				{/*       <li>Art&100 Mod 01.1</li> */}
				{/*       <li>Art&100 Mod 02.1</li> */}
				{/*       <li>Art&100 Mod 02.2</li> */}
				{/*       <li>Art&100 Mod 02.3</li> */}
				{/*       <li>Art&100 Mod 03.1</li> */}
				{/*       <li>Art&100 Mod 03.1.2</li> */}
				{/*       <li>Art&100 Mod 03.2-Exam</li> */}
				{/*       <li>Art&100 Mod 04.1-Exam</li> */}
				{/*       <li>Art&100 Mod 04.2-Image File</li> */}
				{/*       <li>Art&100 Mod 04.3 Virtual Museum</li> */}
				{/*       <li>Art&100 Mod 05.1-MEANING</li> */}
				{/*       <li>Art&100 Mod 05.1-Worksheet</li> */}
				{/*       <li>Art&100 Mod 06.2-Exam</li> */}
				{/*       <li>Art&100 Mod 07.1-Painting</li> */}
				{/*       <li>Art&100 Mod 07.2-Quiz</li> */}
				{/*       <li>Art&100 Mod 08.2-Quiz</li> */}
				{/*       <li>Art&100 Mod 09.1-ARCHT</li> */}
				{/*       <li>Art&100 Mod 09.2-Quiz</li> */}
				{/*       <li>Art&100 Mod 10.1-World</li> */}
				{/*     </ul> */}
				{/*   </div> */}
				{/* </section> */}
			</div>
			{/* <section> */}
			{/*   <div> */}
			{/*     <h1>Accessibility Summary</h1> */}
			{/*     <p> */}
			{/*       This resource has been reported as */}
			{/*       <b className={cls.b2}>Partially Accessible</b> */}
			{/*       <img src="info.png" width="16" alt="" className={cls['img-info']} /> */}
			{/*       <br /> */}
			{/*       Below is a list of the accessibility features that are present or missing: */}
			{/*     </p> */}
			{/*   </div> */}
			{/*   <div className={cls.fm}> */}
			{/*     <div> */}
			{/*       <b className={cls.b2}>Features</b> */}
			{/*       <ul className={cls.dash}> */}
			{/*         <li>Keyboard Accessible</li> */}
			{/*         <li>Images have Alt Text</li> */}
			{/*         <li>Videos have play back controls</li> */}
			{/*       </ul> */}
			{/*     </div> */}
			{/*     <div> */}
			{/*       <b className={cls.b2}>Missing</b> */}
			{/*       <ul className={cls.dash}> */}
			{/*         <li>Videos do not have transcripts</li> */}
			{/*         <li>Does not provide raw data sets</li> */}
			{/*       </ul> */}
			{/*     </div> */}
			{/*   </div> */}
			{/*   <a href="#" className={cls.center}>Show full summary</a> */}
			{/* </section> */}
			{/* <section> */}
			{/*   <h1>Supporting Materials List</h1> */}
			{/*   <div className={cls.sn}> */}
			{/*     <div> */}
			{/*       <img src={book} alt="book" /> */}
			{/*       <span style={{ padding: '4px 0', fontWeight: 'bold'}}>Textbooks</span> */}
			{/*       <b className={cls.b2}>5</b> */}
			{/*     </div> */}
			{/*     <div> */}
			{/*       <img src={check} alt="check" /> */}
			{/*       <span style={{ padding: '4px 0', fontWeight: 'bold'}}>Assessments</span> */}
			{/*       <b className={cls.b2}>6</b> */}
			{/*     </div> */}
			{/*     <div> */}
			{/*       <img src={note} alt="note" /> */}
			{/*       <span style={{ padding: '4px 0', fontWeight: 'bold'}}>Assignments</span> */}
			{/*       <b className={cls.b2}>1</b> */}
			{/*     </div> */}
			{/*   </div> */}
			{/* </section> */}
			<Fab />
		</div>
	);
}

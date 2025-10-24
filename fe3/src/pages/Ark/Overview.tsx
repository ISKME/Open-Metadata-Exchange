/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import api from './api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Tabs,
  Tab,
  Pagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Menu,
  Link as MuiLink,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import OpenInNew from '@mui/icons-material/OpenInNew';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NoteIcon from '@mui/icons-material/Note';
import RemixIcon from '@mui/icons-material/Autorenew'; // Substitute for remix
import CCIcon from '@mui/icons-material/Copyright'; // Substitute for cc
import Loader from './icons/Loader';
import cls from './styles.module.scss'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MovieIcon from '@mui/icons-material/Movie';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadIcon from '@mui/icons-material/Download';
import Arrow from './icons/Arrow';
import { matomoTag } from "pages/Case/ui/helper";

import { makeVideoContent } from './widgets/VideoPlayer';

const THUMBNAIL_URL_PATTERN = 'images/materials/default-thumbnail-index.png'
const trackDownload = (s?: string) => {
  const v = (s || '').toLowerCase();
  let action: 'html' | 'pdf' | 'docx' | 'pptx' | 'attached resources' = 'attached resources';
  if (v.endsWith('.pdf') || v === 'pdf') action = 'pdf';
  else if (v.endsWith('.docx') || v === 'docx') action = 'docx';
  else if (v.endsWith('.pptx') || v === 'pptx') action = 'pptx';
  else if (v.endsWith('.html') || v.endsWith('.htm') || v === 'html') action = 'html';
  matomoTag({ category: 'Downloads', action });
};

const styles = {
  accordion: {
    boxShadow: 'none',
    bgcolor: 'ark.innerCardsBackgroundColor',
    color: 'ark.innerCardsTextColor',
    borderRadius: 2,
    marginBottom: 2,
    '&:before': { display: 'none' },
  },
  summary: {
    borderRadius: 2,
    '& .MuiAccordionSummary-content': { alignItems: 'center', m: 0 },
    '& .Mui-expanded': { margin: '8px 0 !important' }
  }
}

const fileFormats = ['pdf', 'epub', 'thincc', 'scorm']
async function hardDownload(url, interval = 5) {
  function browserDownload(url) { // ToDo: optional: open new window
    const link = document.createElement('a')
    link.href = url
    link.download = ''
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  try {
    // POST to start the download task
    const { data } = await api.post(url)
    if (data.created && data.download_url) {
      browserDownload(data.download_url)
      return
    }
    // If not created, poll the task_url
    const pollTask = async () => {
      const taskRes = await api.get(data.task_url) // Ask: should we use axios.get?
      if (taskRes.data.task?.status === 'SUCCESS') {
        browserDownload(data.download_url)
      } else if (['FAILURE', 'REVOKED'].includes(taskRes.data.task?.status)) {
        console.error('Download failed or was cancelled.')
      } else {
        setTimeout(pollTask, interval * 1000)
      }
    }
    pollTask()
  } catch (err) {
    console.error(err)
  }
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ width: '100%' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Details({ sections, standards, subjects, materials, levels, grades, keywords, license, languages, media, small }) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  const downloads = sections?.map(({ attachments }) => attachments)?.flat()

  return <Box sx={{ flex: !small && 4, display: 'flex', flexDirection: 'column', gap: '32px', height: 'fit-content' }}>
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'ark.innerCardsBackgroundColor', color: 'ark.innerCardsTextColor', padding: '16px', borderRadius: '16px' }}>
      <Tabs
        value={tab}
        onChange={(_e, t) => setTab(t)}
        sx={{
          '.MuiTabs-indicator': { display: 'none' },
          '.Mui-selected': { background: 'white', borderRadius: '16px' },
        }}
      >
        <Tab label="Details" />
        <Tab label="Standards" sx={{ display: !standards?.length ? 'none' : '' }} />
        <Tab label="Resource Library" sx={{ display: !downloads?.length ? 'none' : '' }} />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <Box className={cls.details}>
          <div>
            <h6>Subject:</h6>
            <p>{subjects?.map(({ name }) => name).join(', ')}</p>
          </div>
          <div>
            <h6>Material type:</h6>
            <p>{materials?.map(({ name }) => name).join(', ')}</p>
          </div>
          <div>
            <h6>Level:</h6>
            <p>{levels?.map(({ name }) => name).join(', ')}</p>
          </div>
          <div>
            <h6>Grade:</h6>
            <p>{grades?.map(({ name }) => name).join(', ')}</p>
          </div>
          <div>
            <h6>Tags:</h6>
            <p>{keywords?.map((item) => <span className={cls.chip}>{item}</span>)}</p>
          </div>
          <div>
            <h6>License:</h6>
            <p>{license}</p>
          </div>
          <div>
            <h6>Language:</h6>
            <p>{languages?.join(', ')}</p>
          </div>
          <div>
            <h6>Media Formats:</h6>
            <p>{media?.join(', ')}</p>
          </div>
        </Box>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        {/* {!!tags?.length && <Box className={cls.standards}>
          <Pagination count={tags.length} siblingCount={0} boundaryCount={0} onChange={(_e, p) => setPage(p)} sx={{ '& ul': { justifyContent: 'center' } }} />
          <div style={{ padding: '16px' }}>
            <h5>{tags[page - 1]?.name}</h5>
            <h4>{tags[page - 1]?.standard?.name}</h4>
            <div dangerouslySetInnerHTML={{ __html: tags[page - 1]?.description }} className={cls.standardsDescription} />
          </div>
        </Box>} */}
        <div>
          {standards.map((standard, i) => <Accordion key={`panel${i}`} sx={styles.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.summary}>
              <Typography>{standard.name}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ padding: '8px 0 0' }}>
              {standard.children?.map((item, j) => <Accordion key={`panel${i}-${j}`}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{item.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.description}</Typography>
                </AccordionDetails>
              </Accordion>)}
            </AccordionDetails>
          </Accordion>)}
        </div>
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Box className={cls.resourceLibrary}>
          {sections.map((section, idx) => section.attachments.map((item, i) => (
            <AttachmentButton key={i} url={item.url} title={item.title} />
          )))}
        </Box>
      </TabPanel>
    </Box>
  </Box>
}

function AttachmentButton({ title, url = '' }) {
  const ext = url.split('.').pop()?.toLowerCase();
  let FileIcon = InsertDriveFileIcon;
  if (ext === 'pdf') FileIcon = PictureAsPdfIcon;
  else if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) FileIcon = MovieIcon;
  return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
    {/* Open in new tab */}
    <IconButton
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open in new tab"
      size="small"
      onClick={() => trackDownload(url)}
    >
      <FileIcon color="primary" />
    </IconButton>
    {/* Download */}
    <IconButton
      component="a"
      href={url}
      download
      aria-label="Download file"
      size="small"
      onClick={() => trackDownload(url)}
    >
      <DownloadIcon color="action" />
    </IconButton>
    <Typography variant="body2" sx={{ ml: 1 }}>
      {title}
    </Typography>
  </Box>
}

function DownloadList({ data, editURL, canEdit }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const [downloadList, setDownloadList] = useState(data);

  useEffect(() => {
    setDownloadList(data.map((item) => ({
      ...item,
      open: false,
      children: item.children || [],
    })));
  }, [data]);

  return <Stack direction="row" spacing={2}>
    {canEdit && <Button variant="contained" color="primary" href={editURL}>Edit</Button>}
    <Button
      id="basic-button"
      aria-controls={open ? 'basic-menu' : undefined}
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      variant="contained"
      onClick={handleClick}
      sx={{ fontWeight: 'bold' }}
    >
      Download
    </Button>
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
    >
      {downloadList.map((item, i) => 
        <MenuItem key={item} onClick={() => {
          if (!!item.children?.length) {
            if (!item.open) setDownloadList([
              ...downloadList.slice(0, i),
              { ... item, open: true },
              ...item.children.map((child) => ({ parent: i + 1, ...child })),
              ...downloadList.slice(i + 1)
            ]);
            else  setDownloadList([
              ...downloadList.slice(0, i),
              { ... item, open: false },
              ...downloadList.slice(item.children?.length + i + 1)
            ]);
          } else if (item.parent && fileFormats.includes(item.title)) {
            hardDownload(item.url);
            trackDownload(item.title);
          } else {
            window.open(item.url, '_blank');
            trackDownload(item.url);
          }
        }} sx={{ bgcolor: item.parent ? 'ark.innerCardsBackgroundColor' : '', color: item.parent ? 'ark.innerCardsTextColor' : '', justifyContent: 'space-between' }}>
          {item.title}
          {!!item.children?.length && <div style={{
            display: 'flex',
            marginLeft: '16px',
            transform: item.open ? 'rotate(180deg)' : '',
            transition: 'transform 0.3s ease',
          }}><Arrow /></div>}
        </MenuItem>
      )}
    </Menu>
  </Stack>
}

export default function ArkOverview() {
  const params = useParams();
  let details = params['*'];
  if (details.endsWith('/')) details = details.substring(0, details.length - 1);

  const [page, setPage] = useState(1);
  const [title, setTitle] = useState('');
  const [more, setMore] = useState(false);
  const [desc, setDesc] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [grades, setGrades] = useState([]);
  const [license, setLicense] = useState('');
  const [languages, setLanguages] = useState([]);
  const [media, setMedia] = useState([]);
  const [tags, setTags] = useState([]);
  const [standards, setStandards] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [thumbnail, setThumbnail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [small, setSmall] = useState(typeof window !== 'undefined' ? window.innerWidth < 1200 : false);
  const overviewRef = useRef(null);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [editURL, setEditURL] = useState('');

  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/courseware/v1/lessons/${details}`).then(({ data }) => {
      const {
        abstract,
        general_subjects,
        levels,
        grades,
        sections,
        material_types,
        title,
        thumbnail,
        alignment_tags,
        update_date,
        can_edit,
        edit_url,
      } = data;
      setTitle(title);
      setDesc(abstract);
      setThumbnail(thumbnail);
      setSections(sections);
      setSubjects(general_subjects);
      setLevels(levels);
      setGrades(grades)
      setMaterials(material_types);
      setCanEdit(can_edit);
      setEditURL(edit_url);
      const tags = []
      for (const tag of alignment_tags) {
        let index = tags.findIndex((item) => item.name === tag.standard.name)
        if (index < 0) {
          tags.push({ ...tag.standard, children: [] })
          index = tags.length - 1
        }
        const indexChild = tags[index].children.findIndex((item) => item.name === tag.name)
        if (indexChild < 0) {
          tags[index].children.push(tag)
        }
      }
      setStandards(tags)
      setTags(alignment_tags)
      setLoading(false);
    });
    api.get(`/api/imls/v2/resources/ark_project/courseware/lesson-${details}`).then(({ data }) => {
      const {
        license_title,
        languages,
        mediaFormats,
        keywords_names,
      } = data.resource;
      setLicense(license_title)
      setLanguages(languages)
      setMedia(mediaFormats)
      setKeywords(keywords_names)

      document.title = data?.resource?.title && data?.clientInfo?.name
        ? `${data?.resource?.title} | ${data.clientInfo.name}`
        : 'Digital Public Goods Library';
    });
    const handleResize = () => setSmall(window.innerWidth < 1200);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = `header>div>div{max-width:unset !important}header+div>div{max-width:unset !important}header+div .page-wrapper>div{max-width:unset !important}`;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, [])

  useLayoutEffect(() => {
    if (overviewRef.current) {
      setShowSeeMore(overviewRef.current.scrollHeight > 300);
    }
  }, [desc, more]);
  
  function jump(i) {
    document.getElementById('section-' + i).scrollIntoView()
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', margin: '36px auto' }}>
      <Loader />
    </Box>
  );

  const children = (id, student = true) => fileFormats.map((item) => ({ title: item, url: `/courseware/lesson/${id}${student ? '/student' : ''}/download/${item}` }))
  const downloads = sections?.map(({ attachments }) => attachments)?.flat()
  downloads.push({ title: 'Materials', children: children(details, false) })
  downloads.push({ title: 'Student Materials', children: children(details) })

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1100, mx: 'auto', fontFamily: 'ark.fontFamilyMain' }}>
      <Box sx={{ display: 'flex', mb: 4, mt: 4, gap: '32px' }}>
        <Box sx={{ flex: 8, display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <Box sx={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>⬅ Back</Button>
            <Typography variant="h4" gutterBottom sx={{ flex: 1 }} color="ark.mainFontColor">{title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: small ? 'column' : 'row', width: '100%', gap: '32px' }}>
            {!thumbnail.includes(THUMBNAIL_URL_PATTERN) && <Box sx={{ maxWidth: small ? '100%' : 400, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', mb: 2 }}>
              <Box
                component="img"
                src={thumbnail}
                alt={title}
                sx={{ width: 'auto', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
              />
            </Box>}
            <div style={{ flex: 1, overflow: 'hidden', fontFamily: 'Inter', maxHeight: more ? 'unset' : '400px' }}>
              <b style={{ display: 'block', marginBottom: '16px' }}>Overview: </b>
              <div ref={overviewRef} className={cls.overview} dangerouslySetInnerHTML={{ __html: desc }} style={{ maxHeight: more ? 'unset' : '300px' }} />
              {showSeeMore && (
                <Button variant="text" onClick={() => setMore(!more)}>
                  {more ? '- See Less' : '+ See More'}
                </Button>
              )}
            </div>
            {small && <Details
              sections={sections}
              standards={standards}
              subjects={subjects}
              materials={materials}
              levels={levels}
              grades={grades}
              keywords={keywords}
              license={license}
              languages={languages}
              media={media}
              small={small}
            />}
          </Box>
          <Box>
            {!!downloads?.length && <DownloadList data={downloads} canEdit={canEdit} editURL={editURL} />}
            <Typography sx={{ mb: 2, fontSize: '24px', fontWeight: 600, textAlign: 'center' }} color="ark.mainFontColor">Table of contents</Typography>
            <ul style={{ fontFamily: 'Inter', color: '#646464', cursor: 'pointer', marginLeft: '20%' }}>
              {sections.map((section, idx) => <li onClick={() => jump(idx)} className={cls.browseAll} style={{ textDecoration: 'underline' }}>{section.name}</li>)}
            </ul>
          </Box>
          <Box sx={{ fontFamily: 'Inter', lineHeight: '26px' }} className={cls.sections}>
            {sections.map((section, idx) => (
              <Card key={idx} id={'section-' + idx} sx={{ p: 2, mt: 2, bgcolor: 'ark.innerCardsBackgroundColor', color: 'ark.innerCardsTextColor' }}>
                <Typography variant="h6" sx={{ textAlign: 'center' }}>{section.name}</Typography>
                <div dangerouslySetInnerHTML={{ __html: section.teacher_description }} />
                <div className={cls.content}>
                  <Typography variant="h6" sx={{ textAlign: 'center' }}>{section.routine_name}</Typography>
                  <div>{ makeVideoContent(section.content) }</div>
                  {!!section.attachments?.length && (
                    <div className={cls.attachments}>
                      {section.attachments.map((item, i) => {
                        return <AttachmentButton key={i} url={item.url} title={item.title} />
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </Box>
        </Box>
        {!small && <Details
          sections={sections}
          standards={standards}
          subjects={subjects}
          materials={materials}
          levels={levels}
          grades={grades}
          keywords={keywords}
          license={license}
          languages={languages}
          media={media}
          small={small}
        />}
      </Box>
    </Box>
  );
}

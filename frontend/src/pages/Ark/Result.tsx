/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import api from './api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
  Modal as MuiModal,
  Link as MuiLink,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NoteIcon from '@mui/icons-material/Note';
import RemixIcon from '@mui/icons-material/Autorenew'; // Substitute for remix
import CCIcon from '@mui/icons-material/Copyright'; // Substitute for cc
import Loader from './icons/Loader';
import { matomoTag } from "pages/Case/ui/helper";

const ITEMS_PER_ROW = 5;

function StarRating({ rate }) {
  const full = Math.floor(Number(rate) || 0);
  const empty = 5 - full;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {[...Array(full)].map((_, i) => (
        <StarIcon color="success" key={i} />
      ))}
      {[...Array(empty)].map((_, i) => (
        <StarBorderIcon color="disabled" key={i} />
      ))}
    </Box>
  );
}

function HistoryModal({ open, onClose, history }) {
  return (
    <MuiModal open={open} onClose={onClose}>
      <Box sx={{
        bgcolor: '#fff',
        p: 3,
        borderRadius: 2,
        maxWidth: 400,
        mx: 'auto',
        my: 8,
        outline: 'none',
      }}>
        <Typography variant="h6" gutterBottom>Version History</Typography>
        {history.map((item, idx) => (
          <Box key={idx} mb={2}>
            {item.change_type === 'remixed_from' && (
              <>
                <span>Remixed from </span>
                <MuiLink href={item.related_object_url}>{item.related_object_name}</MuiLink>
              </>
            )}
            {item.change_type === 'remix_published' && (
              <span>Remix published </span>
            )}
            <span>{`on ${new Date(item.date).toDateString().substring(4)}`}</span>
            {item.author_name && (
              <MuiLink href={item.author_url}>{` by ${item.author_name}`}</MuiLink>
            )}
            {item.change_type === 'remix_published' && (
              <>
                <span>: </span>
                <MuiLink href={item.related_object_url}>{item.related_object_name}</MuiLink>
              </>
            )}
          </Box>
        ))}
        <Button onClick={onClose} variant="contained" fullWidth>Close</Button>
      </Box>
    </MuiModal>
  );
}

export default function ArkResult() {
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
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/imls/v2/resources/ark_project/courseware/lesson-${details}`).then(({ data }) => {
      const {
        authors,
        createDate,
        abstract,
        generalSubjects,
        keywords_names,
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

      document.title = title && data?.clientInfo?.name
      ? `${title} | ${data.clientInfo.name}`
      : 'Digital Public Goods Library';

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
      setKeywords(keywords_names);
      setThumbnail(thumbnail);
      setVisits(visits || 0);
      setSaves(saves_count || 0);
      setDownloads(downloads_count || 0);
      setUrl(micrositeResourceURL);
      setUpdate(updateDate.replace(/^(\d+)-(\d+)-.*/, '$2/$1'));
      setCreate(new Date(createDate).toDateString().slice(4));
      setLoading(false);
    });
  }, []);

  function save() {
    // api.post('/my/save-widget/save/', { ... });
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', margin: '36px auto' }}>
      <Loader />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <HistoryModal open={modalOpen} onClose={() => setModalOpen(false)} history={history} />
      <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ⬅ Back
      </Button>
      <Card sx={{
        display: 'flex',
        mb: 3,
        p: 2,
        bgcolor: 'ark.innerCardsBackgroundColor',
        color: 'ark.innerCardsTextColor'
      }}>
        <CardMedia
          component="img"
          image={thumbnail}
          alt={title}
          sx={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 2, mr: 3 }}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>{title}</Typography>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <StarRating rate={rate} />
            <Typography variant="body2" color="text.secondary">
              ({rate || 0})
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Updated {update}
          </Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <Typography variant="body2">{visits} Views</Typography>
            <Typography variant="body2">{saves} Saves</Typography>
            <Typography variant="body2">{downloads} Downloads</Typography>
          </Stack>
          <Stack direction="row" spacing={2} mb={2}>
            <Button
              variant="contained"
              color="primary"
              href={'/ark/overview/' + details}
              onClick={() => {
                matomoTag({
                  category: 'Resource Interaction',
                  action: 'Overview Courseware',
                  name: details,
                });
              }}
            >
              View Resource
            </Button>
            {/* <Button variant="outlined" onClick={save}>
              Save
            </Button> */}
          </Stack>
        </CardContent>
      </Card>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <Box flex={1}>
          <Typography variant="h6" color="ark.mainFontColor" gutterBottom>Description</Typography>
          <Typography variant="body1" color="ark.mainFontColor" paragraph>
            <b>Overview: </b>{desc}
          </Typography>
          <Typography variant="body2" color="ark.mainFontColor" paragraph>
            <b>Subject:</b> {subjects?.join(', ')}<br />
            <b>Level:</b> {levels?.join(' / ')}<br />
            <b>Material Type:</b> {materials?.join(', ')}<br />
            <b>Author:</b> {authors?.join(', ')}<br />
            <b>Collection:</b> {collections?.join(', ')}<br />
            <b>Language:</b> {languages?.join(', ')}<br />
            <b>Media Format:</b> {formats?.join('/')}<br />
            {license && (<><b>License:</b> {license}</>)}
            {licenseImage && <img src={licenseImage} alt="CC" style={{ marginLeft: 8, verticalAlign: 'middle', height: 24 }} />}
          </Typography>
          <Box mt={2}>
            <b>Tags: </b>
            <Button variant="outlined" size="small" sx={{ ml: 1 }}>Add New Tag</Button>
          </Box>
          <Box mt={1} color="ark.mainFontColor" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {keywords.map((item, idx) => (
              <Chip key={idx} label={item} variant="outlined" sx={{ bgcolor: 'ark.innerCardsBackgroundColor', color: 'ark.innerCardsTextColor' }} />
            ))}
          </Box>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
        <Box minWidth={220}>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <HistoryIcon color="action" />
              <Typography variant="body2" color="ark.mainFontColor">
                {history.length} Updates/Edits since first published {create}
              </Typography>
            </Box>
            {history.length > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <RemixIcon color="action" />
                <Typography variant="body2" color="ark.mainFontColor">{history.length} Remixes</Typography>
              </Box>
            )}
            {history.length > 0 && (
              <MuiLink
                component="button"
                onClick={() => setModalOpen(true)}
                sx={{ color: 'primary.main', fontWeight: 500, mt: 1 }}
              >
                Show full history
              </MuiLink>
            )}
          </Stack>
        </Box>
      </Stack>
      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          bgcolor: 'primary.main',
          color: '#fff',
          boxShadow: 3,
          '&:hover': { bgcolor: 'primary.dark' },
        }}
        size="large"
      >
        <EditIcon />
      </IconButton>
    </Box>
  );
}

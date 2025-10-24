// @ts-nocheck
import { useState, useEffect } from 'react';
import { Typography, Box, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from './api/axios';
import cls from './styles.module.scss';
import SearchBar from './components/Input';
import Dropdown from './components/Dropdown';
import { matomoTag } from "pages/Case/ui/helper";

export default function ArkHome() {
  const [search, setSearch] = useState('');
  const [levels, setLevels] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [levelsList, setLevelsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [materialsList, setMaterialsList] = useState([]);
  const [collections, setCollections] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    api.get('/api/search/v2/browse/').then(({ data }) => {
      const filtering = (keyword) => data.resources.filters.find((filter) => filter.keyword === keyword)?.items || [];
      setSubjectsList(filtering('f.general_subject'));
      setMaterialsList(filtering('f.material_types'));
      setLevelsList(filtering('f.sublevel'));

      document.title = data?.clientInfo?.name
        ? `Home | ${data.clientInfo.name}`
        : 'Home | Digital Public Goods Library';
    });
    api.get('/api/curatedcollections/v2/curatedcollections?sortby=timestamp&per_page=3').then(({ data }) => {
      setCollections(data.collections.items);
      // setName(data.userInfo.name || data.userInfo.email);
    })
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (search) params.set('f.search', search);
    if (levels.length) params.set('f.sublevel', levels.map((item) => levelsList.find(({ name }) => name === item)?.slug).filter(Boolean));
    if (subjects.length) params.set('f.general_subject', subjects.map((item) => subjectsList.find(({ name }) => name === item)?.slug).filter(Boolean).join('+'));
    if (materials.length) params.set('f.material_types', materials.map((item) => materialsList.find(({ name }) => name === item)?.slug).filter(Boolean).join('+'));
    window.location.href = `/ark/search?${params.toString().replace(/%2C/g, '+')}`;
    matomoTag({ category: 'Search', action: 'site search', name: (search || '').trim() });
  }

  const fontStyle = { fontFamily: theme.typography.fontFamily } // , fontSize: theme.typography.fontSize };

  return (
    <>
      {/* color="ark.mainFontColor"
      sx={{ fontFamily: 'ark.fontFamilyMain' }} */}
      <Typography variant="h4" gutterBottom className={cls.header} color="ark.mainFontColor">
        The Digital
        Public Goods Library
      </Typography>
      <Typography className={cls.subHeader} color="ark.mainFontColor">
        Open for Education
      </Typography>
      <Link href="/ark/about" className={cls.learn} color="ark.mainFontColor" style={fontStyle}>
        Learn More
      </Link>
      <Box className={cls.browseSamples}>
        <Typography sx={{ color: 'ark.mainFontColor' }}>
          Browse Sources:
        </Typography>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/ark/collection/${collection.id}`}
            color="ark.mainFontColor"
            style={fontStyle}
          >
            {collection.name}
          </Link>
        ))}
        <Link href="/ark/browse" className={cls.browseAll} color="ark.cardLinkTextColor" style={fontStyle}>
          See More
        </Link>
      </Box>
      <Box className={cls.search}>
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </Box>
      <Box className={cls.dropdowns}>
        <Dropdown id="edu" label="Educational level" options={levelsList} value={levels} onChange={e => setLevels(e.target.value)} />
        <Dropdown id="mat" label="Material type" options={materialsList} value={materials} onChange={e => setMaterials(e.target.value)} />
        <Dropdown id="sub" label="Subject area" options={subjectsList} value={subjects} onChange={e => setSubjects(e.target.value)} />
      </Box>
    </>
  );
}
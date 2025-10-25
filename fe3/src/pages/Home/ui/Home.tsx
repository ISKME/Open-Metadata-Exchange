// import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import { classNames } from 'shared/lib/classNames/classNames';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import cls from './Home.module.scss';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Link,
  colors,
  SvgIcon,
} from '@mui/material';
import { BellIcon, ExploreSyncIcon, LightIcon, ManageIcon, MangnifyIcon, SetPreferencesIcon, ShareIcon, StayUpdatedIcon } from './icons';
import Dropdown from 'components/OERX/Dropdown';
import { sxStyles } from 'shared/theme/styles';
import { CollectionCard } from 'widgets/CollectionCard';
import Select from 'components/OERX/Select';

interface HomeProps {
  className?: string;
}

function FeatureCard({ title, text, icon, links = [] }) {
  return <Box sx={sxStyles.featureCard}>
    <div style={{ marginBottom: '30px', marginTop: '60px' }}>
      {icon}
    </div>
    <Typography variant="h4" component="h3" sx={sxStyles.featureTitle}>
      {title}
    </Typography>
    <Typography variant="body2" sx={sxStyles.featureDescription}>
      {text}
    </Typography>
    {links.map((item) => <Link href={item.href} sx={sxStyles.featureLink}>
      {item.icon}
      <span style={{ marginLeft: '16px' }}>{item.label}</span>
    </Link>)}
  </Box>
}

const openFreshdesk = () => {
  (window as any)?.FreshWidget?.show();
};

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export function Home({ className }: HomeProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const [data, setData] = useState<any>();
  const [date, setDate] = useState<Value>(null); // ([new Date('2000'), new Date()]);
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedTenants, setSelectedTenants] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [name, setName] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const updateFilters = () => {
    axios.get('/api/imls/v2/resources' + window.location.search.toString()).then(({ data }) => {
      const subjectItems = data.resources.filters.find((filter) => filter.keyword === 'f.general_subject')?.items;
      setSubjects(subjectItems);
      const levelItems = data.resources.filters.find((filter) => filter.keyword === 'f.sublevel')?.items;
      setLevels(levelItems);
      const tenantsItems = data.resources.filters.find((filter) => filter.keyword === 'tenant')?.items;
      setTenants(tenantsItems);
    });
  };

  useEffect(() => {
    axios.get('/api/imls/v2/collections/browse/?sortby=timestamp&per_page=3').then(({ data }) => {
      setData(data.collections.items);
      setName(data.clientInfo.name);
      // setName(data.userInfo.name || data.userInfo.email);
    })
    updateFilters();
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const params = {
      'f.general_subject': selectedSubjects.map(({ slug }) => slug),
      'f.sublevel': selectedLevels.map(({ slug }) => slug),
      'tenant': selectedTenants.map(({ slug }) => slug),
      'f.search': inputValue,
    }
    if (date && date[0]) {
      params['f.date_gte'] = date[0].toISOString().substring(0, 10);
      params['f.date_lte'] = date[1].toISOString().substring(0, 10);
    }
    setSearchParams(params);
  }, [inputValue, JSON.stringify(selectedTenants), JSON.stringify(selectedLevels), JSON.stringify(selectedSubjects), date])

  function onPress({ key }) {
    if (key === 'Enter') {
      navigate(`/imls/browse/${window.location.search.toString()}`);
    }
  }

  return <div className={classNames(cls.Home, {}, [className])}>
    <Box sx={sxStyles.searchBar}>
      <TextField
        value={inputValue}
        onChange={({ target }) => setInputValue(target.value)}
        onKeyDown={onPress}
        variant="outlined"
        placeholder="Search individual learning materials"
        sx={sxStyles.searchInput}
        size="small"
      />
      <Button variant="contained" sx={sxStyles.searchButton} onClick={() => navigate(`/imls/browse/${window.location.search.toString()}`)}>
        Search
      </Button>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
      <Select label="Collection publisher" value={selectedTenants} options={tenants} onChange={setSelectedTenants} />
      <Select label="Subject area" value={selectedSubjects} options={subjects} onChange={setSelectedSubjects} />
      <Select label="Educational level" value={selectedLevels} options={levels} onChange={setSelectedLevels} />
      {/* <DateRangePicker onChange={setDate} value={date} /> */}
    </Box>

    <Typography variant="h2" sx={sxStyles.sectionTitle}>
      What's new in the OER Exchange
    </Typography>
    <Typography variant="h6" sx={sxStyles.sectionSubtitle}>
      Add collections and resources to your microsite from nationwide digital libraries sharing on the OER Exchange.
    </Typography>
    {data && <Grid container spacing={4} justifyContent="center">
      {data.map((item) => <Grid item xs={12} sm={6} md={4}>
        <CollectionCard item={item} />
      </Grid>)}
    </Grid>}
    <Box display="flex" justifyContent="center">
      <Button variant="outlined" sx={sxStyles.viewAllButton} onClick={() => navigate('/imls/browse')}>
        View all the collections in OER Exchange
      </Button>
    </Box>
    <Typography variant="h2" sx={sxStyles.sectionTitle} style={{ marginTop: '64px' }}>
      Learn About The OER Exchange
    </Typography>
    <Grid container spacing={4}>
      <Grid item xs={12} sm={6} md={3}>
        <FeatureCard
          title="Share"
          text="Share your institution's OER content with other libraries."
          icon={<ShareIcon />}
          links={[{
            label: 'Manage shared OER',
            href: '/imls/site-collections/shared-collections',
            icon: <ManageIcon />
          }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FeatureCard
          title="Explore & Sync"
          text="Explore and sync subscribed OER content to your institution’s library."
          icon={<ExploreSyncIcon />}
          links={[{
            label: 'Search for OER',
            href: '/imls/search',
            icon: <MangnifyIcon />
          }, {
            label: 'Discover OER collections',
            href: '/imls/browse',
            icon: <LightIcon />
          }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FeatureCard
          title="Stay Updated"
          text="Get notified of the newest changes in OER when you subscribe to collections."
          icon={<StayUpdatedIcon />}
          links={[{
            label: 'Subscribed OER',
            href: '/imls/site-collections/subscribed-updates',
            icon: <BellIcon />
          }, {
            label: 'Shared OER',
            href: '/imls/site-collections/shared-updates',
            icon: <ManageIcon />
          }]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <FeatureCard
          title="Set Preferences"
          text="Get recommended content delivered when you set your content preferences."
          icon={<SetPreferencesIcon />}
          links={[{
            label: 'Subscribed OER',
            href: '/imls/site-collections/subscribed-preferences',
            icon: <BellIcon />
          }, {
            label: 'Shared OER',
            href: '/imls/site-collections/shared-preferences',
            icon: <ManageIcon />
          }]}
        />
      </Grid>
    </Grid>
    <Box sx={sxStyles.footerSection}>
      <Typography variant="h2" component="h2" sx={sxStyles.footerText}>
        Let us help you out
      </Typography>
      {(window as any).FreshWidget && (<Button variant="outlined" sx={sxStyles.footerButton} onClick={openFreshdesk}>
        Send us a note
      </Button>)}
    </Box>
  </div>
}

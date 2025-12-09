/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import { useParams, useSearchParams } from 'react-router-dom';
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
  '.MuiDataGrid-columnHeaderTitle': {
    textWrap: 'wrap !important',
    fontSize: '12px',
    fontWeight: 700,
  },
  '.MuiDataGrid-cell': {
    fontSize: '12px !important',
    paddingTop: '5px !important',
    paddingBottom: '5px !important',
  },
  '.MuiDataGrid-checkboxInput': {
    padding: '0 !important',
  },
  '.MuiDataGrid-cellCheckbox': {
    padding: '0 !important',
  },
  '.MuiTableCell-head': {
    fontSize: '12px !important',
  },
  '.MuiTableCell-body': {
    fontSize: '12px !important',
  },
  '.MuiAutocomplete-input': {
    fontSize: '14px !important',
    padding: '4px 12px !important',
  },
  '.MuiAutocomplete-popper *': {
    fontSize: '14px !important',
  },
  '.MuiInputBase-inputSizeSmall': {
    fontSize: '14px !important',
  },
  '.MuiMenuItem-gutters': {
    fontSize: '14px !important',
  },
};

function CustomTabPanel(props: TabPanelProps) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
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

const customUrl = 'https://semantic-ui.com/images/wireframe/image.png';

export function Group() {
  const [searchParams] = useSearchParams();
  const [value, setValue] = React.useState(searchParams.get("settings") === "true" ? 2 : 0);
  const [title, setTitle] = React.useState('');
  const [cover, setCover] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [membersCount, setMembersCount] = React.useState(0);
  const [casesCount, setCasesCount] = React.useState(0);
  const [leaders, setLeaders] = React.useState([]);
  const [content, setContent] = React.useState('');

  const { id } = useParams();

  React.useEffect(() => {
    axios.get(`/api/groups/v1/groups/${id}.json`).then(({ data }) => {
      const { title, cover, description, members_count, cases_count, folders, members, leaders, content_type_id } = data;
      setTitle(title);
      setCover(cover || customUrl);
      setDescription(description);
      setMembersCount(members_count || 0);
      setCasesCount(cases_count || 0);
      setLeaders(Array.isArray(leaders) ? leaders : []);
      setContent(content_type_id)
    });
  }, []);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const auth = (window as any)?.__AUTH__ || {};
  const canAdmin = React.useMemo(() => {
    const isStaff = !!auth?.is_staff;
    const isSuperuser = !!auth?.is_superuser;

    const isLeader =
      Array.isArray(leaders) &&
      leaders.some((l: any) => String(l?.id) === String(auth?.id));

    return isStaff || isSuperuser || isLeader;
  }, [leaders]);

  React.useEffect(() => {
    if (!canAdmin && value !== 0) setValue(0);
  }, [canAdmin, value]);

  const validLeaders = leaders.filter(l => (l?.full_name ?? "").trim() !== "");
  const leaderNames = validLeaders.map(leader => leader.full_name).join(', ');
  const leaderTitle = validLeaders.length > 1 ? 'Group Leaders' : 'Group Leader';
  const leaderText = validLeaders.length > 0 ? `${leaderTitle}: ${leaderNames}` : 'no leaders';

  return (
    <Box sx={{ width: '100%', padding: '64px 0' }}>
      <GlobalStyles styles={globalStyles} />
      <section className={cls['group-info']}>
        <div className={cls['group-info-container']}>
          <div className={cls['group-info-cover']}>
            <img src={cover} width="150" height="150" alt={title} onError={({ target }) => { target.src = customUrl }} />
          </div>
          <div className={cls['group-info-text']}>
            <h1>{title}</h1>
            <p className={cls['group-info-administrators-list']}>
              {leaderText}
            </p>
            <br />
            <p dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />').replace(/\r\n/g, '<br />') }} ></p>
            <br />
            <div className={cls['group-info-counters']}>
              <div className={cls['group-info-counters-item']}>
                <i className={cls['fa fa-user']} aria-hidden="true" />
                <span className={cls.text}>
                  Members:
                  <span className={cls['text-counter']} style={{ marginLeft: '6px' }}>{membersCount}</span>
                </span>
              </div>
              <div className={cls['group-info-counters-item']}>
                <i className={cls['fa fa-file-video-o']} aria-hidden="true" />
                <span className={cls.text}>
                  Cases:
                  <span className={cls['text-counter']} style={{ marginLeft: '6px' }}>{casesCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Box>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Folders" {...a11yProps(0)} />
          {canAdmin && <Tab label="Members" {...a11yProps(1)} />}
          {canAdmin && <Tab label="Settings" {...a11yProps(2)} />}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0} key="folders">
        <GroupsFolders content={content} />
      </CustomTabPanel>
      {canAdmin && (
        <CustomTabPanel value={value} index={1} key="members">
          <GroupsMembers />
        </CustomTabPanel>
      )}
      {canAdmin && (
        <CustomTabPanel value={value} index={2} key="settings">
          <GroupsSettings id={id} title={title} cover={cover} description={description} />
        </CustomTabPanel>
      )}
    </Box>
  );
}

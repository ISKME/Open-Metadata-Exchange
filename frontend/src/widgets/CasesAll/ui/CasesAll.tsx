/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as qs from 'query-string';
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
import { fetchStaticCasesData } from 'pages/Cases/model/services/ActionCreators';
import { getSelectedItems } from 'widgets/Filters/lib'
import { AlignWidget } from './Align';
import { extractUrlParams } from 'shared/lib/global';

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
      <Accordion
        sx={styles.sub}
        key={`panel${name}-${index}`}
      >
        <AccordionSummary
          expandIcon={(item.children && item.children.length) ? <ExpandMoreIcon /> : ''}
          sx={styles.inner}
        >
          <Typography>{item.name} ({item.numResources})</Typography>
        </AccordionSummary>
        {item.children && item.children.length && (
          <AccordionDetails>
            {item.children && item.children.map((child, j) => (
              <Typography sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer' }} key={`panel${name}-${index}-${j}`}>
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
  const [expanded, setExpanded] = useState<string | false>(false);
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
          key={`panel${index}`}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.summary}
          >
            <Typography>{item.title}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 0 0' }}>
            {item.children && <FilterInnerItems name={index} items={item.children} />}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
};

const makeArray = (arg) => arg !== undefined ? Array.isArray(arg) ? arg : [arg] : []

const Subject = ({ data = {}, onSelect = () => {}, tempTopics = [] }) => {
  const [expanded, setExpanded] = useState(false);

  const isSelected = tempTopics.some(item => item.slug === data.slug);
  const childrenWithSelection = data.children?.map(child => ({
    ...child,
    parent: data.slug,
    isSelected: tempTopics.some(item => item.slug === child.slug)
  })) || [];
  const hasSelectedChild = childrenWithSelection.some(child => child.isSelected);

  useEffect(() => {
    setExpanded(isSelected || hasSelectedChild)
  }, [isSelected, hasSelectedChild]);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_event, isExpanded) => {
        const index = tempTopics.findIndex((item) => item.parent === data.slug)
        if (index < 0) setExpanded(isExpanded)
        onSelect(data)
      }}
      sx={styles.sub}
    >
      <AccordionSummary
        expandIcon={(data.children && data.children.length) ? <ExpandMoreIcon /> : ''}
        sx={styles.inner}
      >
        <Typography>{data.name} ({data.numResources})</Typography>
      </AccordionSummary>
      {data.children && data.children.length ? (
        <AccordionDetails>
          {childrenWithSelection.map((item, j) => (
            <Typography
              sx={{
                color: '#56788f',
                padding: '4px 0',
                cursor: 'pointer',
                backgroundColor: item.isSelected ? '#ececec' : '',
              }}
              key={`panel${data.slug}-${data.name}-${j}`}
              onClick={() => onSelect(item)}
            >
              {item.name} ({item.numResources})
            </Typography>
          ))}
        </AccordionDetails>
      ) : ''}
    </Accordion>
  )
};

export function CasesAll({ titles = '', URL = '/api/search/v2/browse/', exportUrl = '' }) {
  const dispatch = useAppDispatch();
  const { cases, count, pages, sorts, order, topics, grades, standards, staticTopics, staticGrades } = useAppSelector((state) => state.CasesSlice);
  const urlParams = extractUrlParams();
  let [searchParams, setSearchParams] = useSearchParams();
  const [defaultPage, setDefaultPage] = useState(() => {
    const page = parseInt(urlParams.page, 10);
    return isNaN(page) ? 1 : page;
  });
  const [expandTopic, setExpandTopic] = useState(!!urlParams['f.general_subject']);
  const [expandGrade, setExpandGrade] = useState(!!urlParams['f.grade_codes']);
  const [expandFrame, setExpandFrame] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [tempTopics, setTempTopics] = useState([]);
  const [tempGrades, setTempGrades] = useState([]);
  const [displayGrades, setDisplayGrades] = useState([]);
  const [check, setCheck] = useState([]);
  const [clearCommand, setClearCommand] = useState('')
  const [staticDataLoaded, setStaticDataLoaded] = useState(false);

  const selectedStandards = getSelectedItems(standards)
  const deduplicateBySlug = useCallback((items) => {
    const seen = new Set();
    return items.filter(item => {
      if (seen.has(item.slug)) return false;
      seen.add(item.slug);
      return true;
    });
  }, []);

  useEffect(() => {
    if (!staticDataLoaded) {
      dispatch(fetchStaticCasesData(URL));
      setStaticDataLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (staticGrades.length > 0) {
      const updatedGrades = staticGrades.map(grade => {
        const gradeFromAPI = grades.find(g => g.slug === grade.slug);
        return {
          ...grade,
          numResources: gradeFromAPI ? gradeFromAPI.numResources : 0,
          isSelected: tempGrades.some(selected => selected.slug === grade.slug)
        };
      });
      setDisplayGrades(updatedGrades);
    }
  }, [staticGrades, tempGrades, grades]);

  const setParams = (key, value) => {
    const params = extractUrlParams()
    // params[key] = value
    if (value === '' || value === undefined || value === null) {
      delete params[key]
    } else {
      params[key] = value
    }
    setSearchParams(params)
  }

  const applyFilter = (topic) => {
    setDefaultPage(1)
    const index = tempTopics.findIndex((item) => item.slug === topic.slug)
    let newTempTopics = [...tempTopics];
    if (index < 0) { // add topic
      newTempTopics = newTempTopics.filter((item) => item.slug !== topic.parent) // rem parent if child
      newTempTopics.push(topic)
    } else { // rem topic
      const more = newTempTopics.filter((item) => item.parent == topic.parent).length === 1
      newTempTopics.splice(index, 1)
      if (topic.parent && more) {
        const parentItem = staticTopics.find((item) => item.slug === topic.parent)
        if (parentItem) newTempTopics.push(parentItem)
      }
    }
    newTempTopics = newTempTopics.filter((item) => item.parent !== topic.slug) // rem children
    newTempTopics = deduplicateBySlug(newTempTopics);
    setTempTopics(newTempTopics)
    setFilteredTopics(newTempTopics)
    setParams('f.general_subject', newTempTopics.map((item) => item.slug))
    setParams('page', 1)
  }

  useEffect(() => {
    if (staticTopics.length > 0 && tempTopics.length === 0 && urlParams['f.general_subject']) {
      let newTempTopics = [];
      for (const filter of makeArray(urlParams['f.general_subject'])) {
        const subject = staticTopics.find((item) => item.slug === filter)
        if (subject) {
          setExpandTopic(true);
          newTempTopics.push(subject)
        }
        const parent = staticTopics.find((item) => item.children.findIndex((child) => child.slug == filter) >= 0)
        if (parent) {
          setExpandTopic(true);
          let temp = parent.children.find((item) => item.slug === filter)
          temp = { ...temp, parent: parent.slug }
          newTempTopics.push(temp)
        }
      }
      newTempTopics = deduplicateBySlug(newTempTopics);
      setTempTopics(newTempTopics)
      setFilteredTopics(newTempTopics)
    }

    if (staticGrades.length > 0 && tempGrades.length === 0 && urlParams['f.grade_codes']) {
      const filteredGradesLoc = staticGrades.filter((item) => makeArray(urlParams['f.grade_codes']).includes(item.slug))
      let newTempGrades = [...filteredGradesLoc];
      newTempGrades = deduplicateBySlug(newTempGrades);
      setTempGrades(newTempGrades)
      setFilteredGrades(newTempGrades)
      setExpandGrade(true)
    }
  }, [staticTopics, staticGrades, deduplicateBySlug])

  const applyGradeFilter = (grade) => {
    setDefaultPage(1)
    const index = tempGrades.findIndex((item) => item.slug === grade.slug)
    let newTempGrades = [...tempGrades];
    if (index < 0) { // add grade
      newTempGrades.push(grade)
    } else { // remove grade
      newTempGrades.splice(index, 1)
    }
    newTempGrades = deduplicateBySlug(newTempGrades);
    setTempGrades(newTempGrades)
    setFilteredGrades(newTempGrades)
    setParams('f.grade_codes', newTempGrades.map((item) => item.slug))
    setParams('page', 1)
  }

  const applyStdFilter = (value) => {
    setDefaultPage(1)
    setParams('page', 1)
    setParams('f.std', value)
    setExpandFrame(true)
  }

  const clearFilter = (param, value) => {
    const val = value.split('-').slice(0, -1).join('-')

    setDefaultPage(1)
    setParams('page', 1)
    setParams(param, val)
  }

  return (
    <Grid container spacing={2} sx={{ padding: '24px 10%' }} className={cls.cases}>
      <Grid item xs={4} sx={{ paddingRight: '32px' }}>
        {titles && <Typography className={cls['page-subtitle']}>
          Filter Cases
        </Typography>}
        <Accordion
          expanded={expandTopic}
          onChange={(_event, isExpanded) => setExpandTopic(isExpanded)}
          sx={styles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.summary}
          >
            <Typography>Subject & Topic</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 0 0' }}>
            {staticTopics.map((topic, j) => (
              <Subject key={topic.slug} data={topic} onSelect={(item) => applyFilter(item)} tempTopics={tempTopics} />
            ))}
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expandGrade}
          onChange={(_event, isExpanded) => setExpandGrade(isExpanded)}
          sx={styles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.summary}
          >
            <Typography>Grade Level</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <ul className={cls.grades}>
              {displayGrades.map((grade) => (
                <li
                  key={grade.slug}
                  className={cls.grade}
                  style={{
                    backgroundColor: grade.isSelected ? '#56788f' : '',
                    borderColor: grade.isSelected ? '#56788f' : '',
                    color: grade.isSelected ? 'white' : '',
                  }}
                  onClick={() => applyGradeFilter(grade)}
                >
                  <span>{grade.name}</span>
                  <br />
                  <span className="facet-count"> ({grade.numResources})</span>
                </li>
              ))}
            </ul>
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expandFrame}
          onChange={(_event, isExpanded) => setExpandFrame(isExpanded)}
          sx={styles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.summary}
          >
            <Typography>Framework</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ paddingLeft: 0, paddingRight: 0 }}>
            {/* selected */}
            <AlignWidget onSelect={applyStdFilter} standards={standards} selected={selectedStandards} />
          </AccordionDetails>
        </Accordion>
        <Typography sx={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
          <Search />
          <a href='/react/advanced-search'>Advanced Search</a>
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
          selectedStandards={selectedStandards}
          unselectTopic={applyFilter}
          unselectGrade={applyGradeFilter}
          onUnselectFilter={clearFilter}
          onClear={() => {
            setTempTopics([])
            setTempGrades([])

            setFilteredTopics([])
            setFilteredGrades([])
            setClearCommand('framework')
            setSearchParams({})
            setExpandFrame(false)
            setExpandGrade(false)
            setExpandTopic(false)
          }}
          defaultPage={defaultPage}
          setDefaultPage={setDefaultPage}
          setCheck={setCheck}
          check={check}
          titles={titles}
          URL={URL}
          exportUrl={exportUrl}
        />
      </Grid>
    </Grid>
  );
}

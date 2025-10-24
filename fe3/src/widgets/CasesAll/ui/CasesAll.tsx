/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
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

let tempTopics = [];
let tempGrades = [];
const makeArray = (arg) => arg !== undefined ? Array.isArray(arg) ? arg : [arg] : []

const Subject = ({ data = {}, onSelect = () => {} }) => {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const child = data.children.findIndex((item) => item.isSelected) >= 0
    setExpanded(data.isSelected || child)
  }, [data]);
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
          {data.children.map((item, j) => (
            <Typography
              sx={{
                color: '#56788f',
                padding: '4px 0',
                cursor: 'pointer',
                backgroundColor: item.isSelected ? '#ececec' : '',
              }}
              key={`panel${name}-${data.name}-${j}`}
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

const urlParams = extractUrlParams()

export function CasesAll({ titles = '', URL = '/api/search/v2/browse/' }) {
  const { cases, count, pages, sorts, order, topics, grades, standards } = useAppSelector((state) => state.CasesSlice);
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
  const [check, setCheck] = useState([]);
  const [clearCommand, setClearCommand] = useState('')

  const selectedStandards = getSelectedItems(standards)

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
    if (index < 0) { // add topic
      tempTopics = tempTopics.filter((item) => item.slug !== topic.parent) // rem parent if child
      tempTopics.push(topic)
    } else { // rem topic
      const more = tempTopics.filter((item) => item.parent == topic.parent).length === 1
      tempTopics.splice(index, 1)
      if (topic.parent && more) tempTopics.push(topics.find((item) => item.slug === topic.parent))
    }
    tempTopics = tempTopics.filter((item) => item.parent !== topic.slug) // rem children
    setFilteredTopics(tempTopics)
    setParams('f.general_subject', tempTopics.map((item) => item.slug))
    setParams('page', 1)
  }

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current && grades.length) {
      firstRender.current = false;
    } else return;
    const filteredGradesLoc = grades.filter((item) => makeArray(urlParams['f.grade_codes']).includes(item.slug))
    setFilteredGrades(filteredGradesLoc)
    tempGrades = filteredGrades
    if (urlParams['f.general_subject']) {
      let first = []
      setExpandTopic(true);
      for (const filter of makeArray(urlParams['f.general_subject'])) {
        const subject = topics.find((item) => item.slug === filter)
        if (subject) {
          setExpandTopic(true);
          tempTopics.push(subject)
          first.push(subject.slug)
        }
        const parent = topics.find((item) => item.children.findIndex((child) => child.slug == filter) >= 0)
        if (parent) {
          if (!first.includes(parent.slug)) {
            first.push(parent.slug)
          }
          setExpandTopic(true);
          let temp = parent.children.find((item) => item.slug === filter)
          temp = { ...temp, parent: parent.slug }
          tempTopics.push(temp)
        }
      }
      setFilteredTopics(tempTopics)
    }
  }, [grades])

  const applyGradeFilter = (grade) => {
    setDefaultPage(1)
    const index = tempGrades.findIndex((item) => item.slug === grade.slug)
    if (index < 0) { // add topic
      tempGrades.push(grade)
    } else { // rem topic
      tempGrades.splice(index, 1)
    }
    setFilteredGrades(tempGrades)
    setParams('f.grade_codes', tempGrades.map((item) => item.slug))
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
            {topics.map((topic, j) => (
              <Subject key={topic.slug} data={topic} onSelect={(item) => applyFilter(item)} />
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
              {grades.map((grade) => (
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
        />
      </Grid>
    </Grid>
  );
}

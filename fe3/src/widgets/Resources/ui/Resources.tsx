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
import { ResourcesAll } from 'widgets/ResourcesAll';
import cls from './Resources.module.scss';
import axios from 'axios';
import { AlignWidget } from 'widgets/CasesAll/ui/Align';
import { getSelectedItems } from 'widgets/Filters/lib';
import { extractUrlParams } from 'shared/lib/global';
import styles from './Resources.styles'

const urlParams = extractUrlParams()

let tempMaterials = []
const makeArray = (arg) => arg !== undefined ? Array.isArray(arg) ? arg : [arg] : []

const Subject = ({ data = {}, onSelect = () => {} }) => {
  const [expanded, setExpanded] = useState(false)
  useEffect(() => {
    const index = tempMaterials.findIndex((item) => item.slug === data.slug)
    setExpanded(index >= 0)
  }, [data]);
  return (
    <Accordion
      expanded={expanded}
      onChange={(_event, isExpanded) => {
        setExpanded(isExpanded)
        onSelect(data)
      }}
      sx={styles.sub}
    >
      <AccordionSummary
        sx={styles.inner}
      >
        <Typography>{data.name}</Typography>
      </AccordionSummary>
    </Accordion>
  )
};

export function Resources({ titles = '', URL = '/api/materials/v1/courses' }) {
  let { cases, count, pages, materials, standards } = useAppSelector((state) => state.CasesSlice);
  materials = materials.length ? materials : [{ "name": "Case Analysis Prompt", "slug": "case-analysis-prompt" }]
  let [searchParams, setSearchParams] = useSearchParams();
  const [defaultPage, setDefaultPage] = useState(() => {
    const page = parseInt(urlParams.page, 10);
    return isNaN(page) ? 1 : page;
  });
  const [expandFrame, setExpandFrame] = useState(false);
  const [check, setCheck] = useState([]);
  const [expand, setExpand] = useState(false)
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const selectedStandards = getSelectedItems(standards)

  const setParams = (key, value) => {
    const params = extractUrlParams()
    if (value === '' || value === undefined || value === null) {
      delete params[key]
    } else params[key] = value
    setSearchParams(params)
  }

  const applyFilter = (material) => {
    setDefaultPage(1)
    const index = tempMaterials.findIndex((item) => item.slug === material.slug)
    if (index < 0) {
      tempMaterials.push(material)
    } else {
      tempMaterials.splice(index, 1)
    }
    setFilteredMaterials(tempMaterials)
    setParams('f.material_types', tempMaterials.map((item) => item.slug))
    setParams('page', 1)
  }

  useEffect(() => {
    tempMaterials = materials.filter((item) => makeArray(urlParams['f.material_types']).includes(item.slug))
    if (tempMaterials.length) setExpand(true)
    setFilteredMaterials(tempMaterials)
  }, [])

  const applyFrameworkFilter = (value) => {
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
          expanded={expand}
          onChange={(_event, isExpanded) => setExpand(isExpanded)}
          sx={styles.accordion}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.summary}
          >
            <Typography>Material Types</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 0 0' }}>
            {materials.map((material, j) => (
              <Subject key={material.slug} data={material} onSelect={applyFilter} />
            ))}
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
            <AlignWidget onSelect={applyFrameworkFilter} standards={standards} selected={selectedStandards} />
          </AccordionDetails>
        </Accordion>
        <Typography sx={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
          <Search />
          <a href='/react/advanced-search'>Advanced Search</a>
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <ResourcesAll
          data={cases}
          pages={pages}
          count={count}
          materials={filteredMaterials}
          selectedStandards={selectedStandards}
          unselectMaterial={applyFilter}
          unselectFramework={applyFrameworkFilter}
          onUnselectFilter={clearFilter}
          onClear={() => {
            setFilteredMaterials([])
            setSearchParams({})
            setExpandFrame(false)
          }}
          defaultPage={defaultPage}
          setDefaultPage={setDefaultPage}
          titles={titles}
          URL={URL}
        />
      </Grid>
    </Grid>
  );
}

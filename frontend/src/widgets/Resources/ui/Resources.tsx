/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppSelector } from 'hooks/redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Search from '@mui/icons-material/Search';
import { ResourcesAll } from 'widgets/ResourcesAll';
import cls from './Resources.module.scss';
import { AlignWidget } from 'widgets/CasesAll/ui/Align';
import { getSelectedItems } from 'widgets/Filters/lib';
import { extractUrlParams } from 'shared/lib/global';
import styles from './Resources.styles'

let tempMaterials = []
const makeArray = (arg) => arg !== undefined ? Array.isArray(arg) ? arg : [arg] : []

const Subject = ({ data = {}, isSelected = false, onSelect = () => {} }) => {
  const [expanded, setExpanded] = useState(isSelected)

  useEffect(() => {
    setExpanded(isSelected)
  }, [isSelected]);
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
        <Typography>
          {data.name + ' '}
          {data?.numResources ? `(${data?.numResources})` : ''}
        </Typography>
      </AccordionSummary>
    </Accordion>
  )
};

let allMaterials = []
export function Resources({ titles = '', URL = '/api/materials/v1/courses' }) {
  let { cases, count, pages, materials, standards } = useAppSelector((state) => state.CasesSlice);
  materials = materials.length ? materials : [{ "name": "Case Analysis Prompt", "slug": "case-analysis-prompt" }]

  if (materials?.length && allMaterials.length <= materials.length) {
    allMaterials = materials
  }
  let [searchParams, setSearchParams] = useSearchParams();

  const urlParams = extractUrlParams()
  const frameworkParam = makeArray(urlParams['f.std'])[0] || ''

  const [defaultPage, setDefaultPage] = useState(() => {
    const page = parseInt(urlParams.page, 10);
    return isNaN(page) ? 1 : page;
  });
  const [expandFrame, setExpandFrame] = useState(!!frameworkParam);
  const [expand, setExpand] = useState(false)
  const [filteredMaterials, setFilteredMaterials] = useState([])
  const visibleStandardsRef = useRef(standards)

  useEffect(() => {
    if (standards.length > 0) {
      visibleStandardsRef.current = standards
    }
  }, [standards])

  const visibleStandards =
    standards.length > 0 ? standards : visibleStandardsRef.current

  const selectedStandards =
    frameworkParam ? getSelectedItems(visibleStandards) : []

  const setParamsBulk = (updates) => {
    const params = extractUrlParams()
    Object.entries(updates).forEach(([key, value]) => {
      if (
        value === '' ||
        value === undefined ||
        value === null ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete params[key]
      } else {
        params[key] = value
      }
    })
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
    setParamsBulk({
      'f.material_types': tempMaterials.map((item) => item.slug),
      page: 1,
    })
  }

  const searchParamsKey = searchParams.toString()

  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current && materials.length) {
      firstRender.current = false;
    } else return;

    const currentUrlParams = extractUrlParams()
    tempMaterials = materials.filter((item) =>
      makeArray(currentUrlParams['f.material_types']).includes(item.slug)
    )

    setFilteredMaterials(tempMaterials)
    setExpand(tempMaterials.length > 0)
  }, [materials, searchParamsKey])

  const applyFrameworkFilter = (value) => {
    setDefaultPage(1)
    setParamsBulk({
      page: 1,
      'f.std': value,
    })
    setExpandFrame(true)
  }

  const clearFilter = (param) => {
    setDefaultPage(1)
    setParamsBulk({
      page: 1,
      [param]: undefined,
    })
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
          {allMaterials.map((material) => (
            <Subject
              key={material.slug}
              data={material}
              isSelected={filteredMaterials.some((item) => item.slug === material.slug)}
              onSelect={applyFilter}
            />
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
            <AlignWidget onSelect={applyFrameworkFilter} standards={visibleStandards} selected={selectedStandards} />
          </AccordionDetails>
        </Accordion>
        <Typography sx={{ display: 'flex', gap: '8px', cursor: 'pointer' }}>
          <Search />
          <a href='/react/advanced-search'>Advanced Search</a>
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <ResourcesAll
          key={`resources-all-${frameworkParam || 'none'}`}
          data={cases}
          pages={pages}
          count={count}
          materials={filteredMaterials}
          selectedStandards={selectedStandards}
          unselectMaterial={applyFilter}
          onUnselectFilter={clearFilter}
          onClear={() => {
            tempMaterials = []
            setFilteredMaterials([])
            setSearchParams({})
            setExpand(false)
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

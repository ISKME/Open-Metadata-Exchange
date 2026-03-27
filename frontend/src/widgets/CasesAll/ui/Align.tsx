// @ts-nocheck
import { useState, useEffect } from 'react'
import axios from 'axios'
import { MenuItem, FormControl, InputLabel, Select, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { accordionStyles } from 'pages/Case/ui/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { extractUrlParams } from 'shared/lib/global'
import { StdWidget } from 'widgets/Filters'

function Widget({ items, parent, onChange }) {
  const label = items?.length > 0 ? items[0].section.name : ''
  const selected = items?.find((item) => item.isSelected)

  return (
    <FormControl>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={selected?.slug || ''}
        onChange={({ target }) => onChange(target.value)}
      >
        <MenuItem value={parent?.slug || ''}>
          <em>None</em>
        </MenuItem>
        {items?.map((option) => (
          <MenuItem key={option.slug} value={option.slug}>
            {option.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export function AlignWidget({ standards, selected = [], onSelect = (tag) => {} }) {
  const params = extractUrlParams()
  const selectedTag = selected.find((item) => item.section.slug === 'tag')

  useEffect(() => {
    if (params['f.std']) onSelect(params['f.std'])
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '16px', margin: '16px' }}>
      <StdWidget section={Widget} items={standards} onChange={onSelect} />
      {selectedTag && (
        <Accordion defaultExpanded sx={accordionStyles.sub}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={accordionStyles.inner}
          >
            <Typography>
              {selectedTag.name}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography sx={{ color: '#56788f', padding: '4px 0', cursor: 'pointer' }}>
              {selectedTag.description}
            </Typography>
            </AccordionDetails>
        </Accordion>
      )}
    </div>
  );
}

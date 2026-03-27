/* eslint-disable no-unused-vars */
// @ts-nocheck
import React, { memo, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Typography,
  Box,
  Button,
  List,
  ListItem,
} from '@mui/material';
import { Checkbox } from 'components/OERX/Checkbox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ITEMS_PER_PAGE = 5;

export const Filter = memo(({
  checkMarks,
  filter,
  onFilterChange,
  className,
}) => {
  const options = filter.items || [];
  const [expanded, setExpanded] = useState(true);
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);

  const handleSeeMoreClick = () => setVisibleItems((v) => v + ITEMS_PER_PAGE);

  const handleAccordionChange = () => setExpanded((prev) => !prev);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionChange}
      sx={{
        boxShadow: 'none',
        // bgcolor: '#f7f7f7',
        // bgcolor: 'ark.innerCardsBackgroundColor',
        // color: 'ark.innerCardsTextColor',
        borderRadius: 2,
        marginBottom: 0,
        '&:before': { display: 'none' },
      }}
      className={className}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          // bgcolor: '#ececec',
          borderRadius: 2,
          '& .MuiAccordionSummary-content': { alignItems: 'center', m: 0 },
          '& .Mui-expanded': { margin: '8px 0 !important' }
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {filter.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List dense disablePadding sx={{ pt: 1 }}>
          {options.slice(0, visibleItems).map((el) => (
            <ListItem key={el.name} disableGutters sx={{ py: 0 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    filter={filter}
                    element={el}
                    onFilterChange={onFilterChange}
                    checkMarks={checkMarks}
                  />
                }
                label={<Typography variant="body2">{el.name}</Typography>}
                sx={{ ml: 0.5 }}
              />
            </ListItem>
          ))}
        </List>
        {visibleItems < options.length && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              size="small"
              onClick={handleSeeMoreClick}
              sx={{ fontWeight: 500, color: 'primary.main' }}
            >
              + See More
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
});

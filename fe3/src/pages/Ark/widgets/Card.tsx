/* eslint-disable max-len */
// @ts-nocheck
import React, { useState, memo } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  Typography,
  Box,
  Link as MuiLink,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AccessibleIcon from 'shared/assets/icons/accessible.svg';
import FullCourseIcon from 'shared/assets/icons/full-course.svg';
import RightsIcon from 'shared/assets/icons/rights.svg';
import InfoIcon from 'shared/assets/icons/info.svg';

const join = (arr) =>
  arr && arr.length
    ? arr.reduce((a, b, i, array) => a + (i < array.length - 1 ? ', ' : ' and ') + b)
    : '';

function StarRating({ rating = 0 }) {
  const full = Math.floor(rating);
  const partial = rating % 1 !== 0;
  const empty = 5 - Math.ceil(rating);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {[...Array(full)].map((_, i) => (
        <svg viewBox="0 0 24 24" width="24" height="24" key={`full-${i}`} style={{ fill: '#6f983d' }}>
          <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
        </svg>
      ))}
      {partial && (
        <Box sx={{ position: 'relative', width: 18, height: 18, display: 'inline-block' }}>
          <svg viewBox="0 0 24 24" width="24" height="24" style={{ fill: '#ccc', position: 'absolute', top: 0, left: 0 }}>
            <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            style={{
              fill: '#6f983d',
              position: 'absolute',
              top: 0,
              left: 0,
              clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)`,
            }}
          >
            <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
          </svg>
        </Box>
      )}
      {[...Array(empty)].map((_, i) => (
        <svg viewBox="0 0 24 24" width="24" height="24" key={`empty-${i}`} style={{ fill: '#ccc' }}>
          <path d="M12 .587l3.668 7.571L24 9.423l-6 5.847 1.416 8.256L12 18.902 4.584 23.526 6 15.27 0 9.423l8.332-1.265L12 .587z" />
        </svg>
      ))}
    </Box>
  );
}

function MetaData({ metadata }) {
  if (!metadata) return null;
  return (
    <Box sx={{ mt: 1 }}>
      {metadata.map((item, idx) =>
        item.label ? (
          <Typography key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            <strong>{item.label}:</strong>{' '}
            <span>{join(item.items?.map((el) => el.name))}</span>
          </Typography>
        ) : null
      )}
    </Box>
  );
}

export const ArkResourceCard = memo(function ArkResourceCard({ resource }) {
  const [see, setSee] = useState(false);
  const [checked, setChecked] = useState(false);

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        mb: 2,
        bgcolor: 'ark.innerCardsBackgroundColor',
        borderColor: 'divider',
        color: 'ark.innerCardsTextColor',
        // bgcolor: checked ? '#fff' : '#f7f7f7',
        // borderColor: checked ? 'rgb(125, 154, 203)' : 'divider',
        boxShadow: checked ? 2 : 0,
        transition: 'box-shadow 0.2s, border-color 0.2s, background 0.2s',
      }}
    >
      <CardContent
        sx={{
          width: 210,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // bgcolor: '#f5f5f5',
          borderLeft: { sm: '1px solid #eee' },
        }}
      >
        <img
          src={resource.thumbnail}
          alt={resource.title || resource.name}
          style={{
            borderRadius: '8px',
            boxShadow: '1px 2px 5px rgba(0, 0, 0, .2)',
          }}
        />
      </CardContent>
      <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
      <CardContent sx={{ flex: 1, minWidth: 0 }}>
        {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>
            {resource.micrositeName || resource.site}
          </Typography>
          <Checkbox
            checked={checked}
            onChange={e => setChecked(e.target.checked)}
            sx={{ p: 0, mr: 1 }}
          />
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MuiLink
            component={Link}
            to={`/ark/result/${resource.id?.split('.')?.pop()}`}
            underline="hover"
            color="primary"
            sx={{ fontFamily: 'Inter !important', fontWeight: 600, fontSize: 18, mr: 1 }}
            aria-label="Go to Resource page"
          >
            {resource.title || resource.name}
          </MuiLink>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
          Updated {new Date(resource.updateDate).toDateString()}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <StarRating rating={Number(resource.rating) || 0} />
          <Typography sx={{ color: '#428bca', fontWeight: 'bold', fontSize: 15, ml: 1 }}>
            ({resource.ratings_number || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Views:
          </Typography>
          <Typography sx={{ color: '#428bca', fontWeight: 'bold', fontSize: 15, ml: 1 }}>
            {resource.visits || 0}
          </Typography>
        </Box>
        <MetaData metadata={resource.metadata} />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
            <AccessibleIcon style={{ width: 20, marginRight: 4 }} />
            <Typography variant="body2" color="text.secondary">
              {resource.accessibility?.join(', ')}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Overview:</strong>{' '}
          <span>
            {see
              ? resource.abstract
              : `${resource.abstract?.split(' ')?.slice(0, 20)?.join(' ')}...`}
          </span>
          {!see && (
            <MuiLink
              component="button"
              sx={{ ml: 1, color: 'primary.main', cursor: 'pointer', fontWeight: 500 }}
              onClick={() => setSee(true)}
            >
              Read More
            </MuiLink>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
});

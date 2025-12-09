// @ts-nocheck
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { Box, Card, CardActionArea, CardMedia, Typography } from '@mui/material';

export const CollectionItemCard = memo(({ collection, className, isNew = false }) => {
  const level: string[] = [];
  let { educationLevels } = collection;
  if (educationLevels && educationLevels.length) {
    educationLevels = educationLevels.map((item: string) => item?.toLowerCase()?.replace(' / ', '/'));
    if (
      educationLevels.includes('preschool')
      || educationLevels.includes('lower primary')
      || educationLevels.includes('upper primary')
      || educationLevels.includes('middle school')
      || educationLevels.includes('high school')
    ) level.push('PreK-12');
    if (
      educationLevels.includes('community college/lower division')
      || educationLevels.includes('academic lower division')
      || educationLevels.includes('college/upper division')
      || educationLevels.includes('academic upper division')
    ) level.push('HigherEd');
    if (
      educationLevels.includes('career/technical')
      || educationLevels.includes('workforce education (technical)')
      || educationLevels.includes('graduate/professional')
      || educationLevels.includes('adult education')
    ) level.push('ContinuingEd');
  }
  const handleImageError = (e) => { e.target.onerror = null; e.target.src = '/static/newdesign/images/materials/default-thumbnail-index.png'; };

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        listStyle: 'none',
        m: 0,
        p: 0,
      }}
    >
      {/* New Collection Banner */}
      {isNew && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#3B3B3B',
            color: '#FCFCFC',
            borderRadius: 2,
            px: 1.5,
            py: 0.5,
            fontSize: 14,
            fontWeight: 500,
            gap: 1,
            boxShadow: 2,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 25 24" fill="none">
            <path d="M12.5 2.24951C7.1239 2.24951 2.75 6.62342 2.75 11.9995C2.75 17.3756 7.1239 21.7495 12.5 21.7495C17.8761 21.7495 22.25 17.3756 22.25 11.9995C22.25 6.62342 17.8761 2.24951 12.5 2.24951ZM17.5742 8.73185L11.2742 16.2319C11.2051 16.3142 11.1191 16.3807 11.0221 16.4268C10.925 16.473 10.8192 16.4978 10.7117 16.4995H10.6991C10.5939 16.4995 10.49 16.4773 10.394 16.4345C10.298 16.3917 10.212 16.3292 10.1417 16.2511L7.44172 13.2511C7.37315 13.1783 7.31981 13.0926 7.28483 12.999C7.24985 12.9054 7.23395 12.8057 7.23805 12.7058C7.24215 12.6059 7.26617 12.5079 7.3087 12.4174C7.35123 12.327 7.41142 12.2459 7.48572 12.1791C7.56002 12.1122 7.64694 12.0609 7.74136 12.0281C7.83578 11.9953 7.93581 11.9817 8.03556 11.9881C8.13531 11.9945 8.23277 12.0208 8.32222 12.0654C8.41166 12.1101 8.49128 12.1721 8.5564 12.2479L10.6794 14.6067L16.4258 7.76717C16.5547 7.61814 16.737 7.52582 16.9335 7.51017C17.1299 7.49452 17.3246 7.55679 17.4754 7.68352C17.6263 7.81026 17.7212 7.99127 17.7397 8.18744C17.7582 8.3836 17.6988 8.57917 17.5742 8.73185Z" fill="#FCFCFC"/>
          </svg>
          <span>Collection added</span>
        </Box>
      )}

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: 2,
          overflow: 'hidden',
          minWidth: 225,
          maxWidth: 340,
          height: '100%',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: 6,
          },
        }}
        component="li"
      >
        <CardActionArea
          component={Link}
          to={`/imls/collection-details/${collection.micrositeSlug || collection.microsite || ''}/${collection.id}/resources`}
          aria-label="Go to Collection page"
          sx={{ display: 'block', textAlign: 'left', height: '100%' }}
        >
          <CardMedia
            component="img"
            image={collection.thumbnail}
            alt={collection.name}
            sx={{
              width: '100%',
              height: 150,
              objectFit: 'cover',
              borderBottom: '1px solid #eee',
            }}
            onError={handleImageError}
          />
          <Box sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: 18,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              className="item_name"
            >
              {collection.name}
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: '#888',
                fontSize: 15,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              className="site_name"
            >
              {collection.micrositeName}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#444',
                mb: 0.5,
                fontSize: 14,
              }}
            >
              {level.join(', ')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#444',
                fontSize: 14,
              }}
            >
              {collection.numResources} resources
            </Typography>
          </Box>
        </CardActionArea>
      </Card>
    </Box>
  );
});

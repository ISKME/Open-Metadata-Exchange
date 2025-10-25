/* eslint-disable react/jsx-no-bind */
/* eslint-disable max-len */
/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { fetchLibrary } from 'widgets/CollectionList/model/services/ActionCreators';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
// import Divider from '@mui/material/Divider';
import SearchBar from 'components/OERX/Input';

interface ExploreProps {
  className?: string;
}
export function Explore({ className }: ExploreProps) {
  const [sections, setSections] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const CARDS_PER_PAGE = 3;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { library } = useAppSelector((state) => state.collectionReducer);

  useEffect(() => {
    dispatch(fetchLibrary());
  }, [dispatch]);

  useEffect(() => {
    setSections(library.sections);
  }, [library]);

  const handleSearch = () => {
    navigate(`/imls/search/?f.search=${inputValue}`);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePrev = (collectionsLength: number) => {
    setCarouselIndex((prev) => Math.max(prev - 1, 0));
  };
  const handleNext = (collectionsLength: number) => {
    setCarouselIndex((prev) => Math.min(prev + 1, Math.ceil(collectionsLength / CARDS_PER_PAGE) - 1));
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/static/newdesign/images/materials/default-thumbnail-index.png'
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={700} textAlign="center">
        Explore Learning Materials
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <SearchBar
            value={inputValue}
            onChange={({ target }) => setInputValue(target.value)}
            onSearch={handleSearch}
            placeholder="Search Individual Learning Materials"
          />
        </Box>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/imls/advanced-resource-search')} sx={{ minWidth: 220, height: 40 }}>
          Advanced search
        </Button>
      </Stack>
      {/* <Divider sx={{ mb: 4 }} /> */}
      {sections.map((section, index) => (
        <Box key={index} sx={{ mb: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight={600}>{section.name}</Typography>
            {section.type === 'Collections' && (
              <Button variant="text" color="primary" onClick={() => navigate('/imls/browse')}>View All Collections</Button>
            )}
          </Stack>
          {section.type === 'Collections' ? (
            <Box sx={{ position: 'relative', width: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => handlePrev(section.data.length)}
                  disabled={carouselIndex === 0}
                >
                  Prev
                </Button>
                <Box sx={{ display: 'flex', overflow: 'hidden', width: '100%', p: 1 }}>
                  {section.data
                    .slice(carouselIndex * CARDS_PER_PAGE, carouselIndex * CARDS_PER_PAGE + CARDS_PER_PAGE)
                    .map((collection) => (
                      <Card key={collection.name} sx={{ minWidth: 260, maxWidth: 320, mx: 1, flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
                        <CardMedia
                          component="img"
                          height="160"
                          image={collection.thumbnail}
                          alt={collection.name}
                          onError={handleImageError}
                        />
                        <CardContent sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} fontSize={'1.2rem'}>{collection.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{collection.micrositeName}</Typography>
                          <Typography variant="body2" color="text.secondary">{collection.numResources} resources</Typography>
                          <Typography variant="body2" color="text.secondary">{collection.educationLevels?.slice(0, 3)?.join(', ')}</Typography>
                          <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate(`/imls/collection-details/${collection.micrositeSlug}/${collection.id}/resources`)}>
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </Box>
                <Button
                  variant="outlined"
                  onClick={() => handleNext(section.data.length)}
                  disabled={carouselIndex >= Math.ceil(section.data.length / CARDS_PER_PAGE) - 1}
                >
                  Next
                </Button>
              </Stack>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {section.data.map((microsite) => (
                <Grid item xs={12} sm={6} md={4} key={microsite.name}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                    <Avatar src={microsite.logo} alt={microsite.name} sx={{ width: 80, height: 80, mb: 2, '& img': { objectFit: 'contain' } }} />
                    <CardContent sx={{ flex: 1, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={600}>{microsite.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{microsite.numCollections} Collections</Typography>
                      <Typography variant="body2" color="text.secondary">{microsite.educationalLevels?.slice(0, 3)?.join(', ')}</Typography>
                      <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => navigate(`/imls/search/?tenant=${microsite.slug}`)}>
                        Explore Microsite
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ))}
    </Box>
  );
}

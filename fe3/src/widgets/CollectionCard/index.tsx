import { Card, CardMedia, CardContent, Typography } from "@mui/material";
import { sxStyles } from "shared/theme/styles";
import { Link } from 'react-router-dom';

export function CollectionCard({ item }) {
  const level = [];
  let { educationLevels } = item;
  if (educationLevels && educationLevels.length) {
    educationLevels = educationLevels.map((item) => item?.toLowerCase()?.replace(' / ', '/'));
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
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/static/newdesign/images/materials/default-thumbnail-index.png'
  }
  return <Link to={item.id !== '' && `/imls/collection-details/${item.micrositeSlug}/${item.id}/resources`} aria-label="Go to Collection page">
    <Card sx={sxStyles.card}>
      <CardMedia
        component="img"
        sx={sxStyles.cardMedia}
        image={item.thumbnail}
        title={item.name}
        onError={handleImageError}
      />
      <CardContent sx={sxStyles.cardContent}>
        <Typography variant="h4" component="h3" sx={sxStyles.cardTitle}>
          {item.name}
        </Typography>
        <Typography variant="subtitle1" sx={sxStyles.cardSubtitle}>
          {level.join(', ')}
        </Typography>
        <Typography variant="body2" sx={sxStyles.cardResources}>
          {item.numResources} resources
        </Typography>
      </CardContent>
    </Card>
  </Link>
}

/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import cls from './CardCase.module.scss';
import { Button } from '@mui/material';

const CardBlog = styled(Card)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  // color: theme.palette.text.secondary,
  // ...theme.typography.body2,
  margin: 'auto',
  borderRadius: '0', // theme.spacing(2),
  // 16px
  transition: '0.3s',
  boxShadow: 'none', // '0px 14px 80px rgba(34, 35, 58, 0.2)',
  position: 'relative',
  width: '100%',
  marginLeft: 'auto',
  overflow: 'initial',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingBottom: theme.spacing(2),
  borderBottom: '1px solid #efeff0',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    paddingTop: theme.spacing(2),
  },
}));

const CardBlogMedia = styled(CardMedia)(({ theme }) => ({
  marginLeft: 'auto',
  marginRight: 'auto',
  // marginTop: theme.spacing(-3),
  width: '200px !important',
  height: '130px',
  borderRadius: '0', // theme.spacing(2),
  backgroundColor: '#fff',
  position: 'relative',
  // '&:after': {
  //   content: '" "',
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   width: '100%',
  //   height: '100%',
  //   backgroundImage: 'linear-gradient(147deg, #fe8a39 0%, #fd3838 74%)',
  //   borderRadius: theme.spacing(2),
  //   opacity: 0.5,
  // },
}));

export function CardCase({ id, title, picture, description, items = [], checked = false, onCheck = (event) => {}, col = false }) {
  const [more, setMore] = React.useState(false);
  return (
    <CardBlog sx={{ display: 'flex' }}>
      <Checkbox checked={checked} onChange={onCheck} inputProps={{ 'aria-label': 'Checkbox demo' }} />
      <a href={'/courseware/new/' + id.split('.')?.pop()}>
        <CardBlogMedia
          component="img"
          image={picture}
        />
      </a>
      <CardContent sx={{ flex: '1', paddingTop: '0' }}>
        <a href={'/courseware/new/' + id.split('.')?.pop()}>
          <Typography component="div" variant="h5" sx={{ color: '#56788f', font: '700 19px / 25px "DINPro", sans-serif', marginBottom: '5px' }}>
            {title}
          </Typography>
        </a>
        <div style={{ display: 'flex' }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            sx={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: more ? '' : '1',
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-all',
              font: 'normal 14px / 21px "Roboto", sans-serif',
            }}
          >
            {description}
          </Typography>
          {!more && <Button sx={{ height: '20px' }} onClick={() => setMore(true)}>more</Button>}
        </div>
        <Divider sx={{ margin: '12px 0' }} />
        <div className={cls[`case-fields${col ? '-col' : ''}`]}>
          {items.map((item, index) => (
            <ul className={cls[`case-field${col ? '-col' : ''}`]} key={index}>
              {col && item.map((inner) => (
                <li><span>{inner}</span></li>
              ))}
              {!col && <li><span>{item.join(', ')}</span></li>}
            </ul>
          ))}
        </div>
      </CardContent>
    </CardBlog>
  );
}

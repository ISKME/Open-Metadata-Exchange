/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import cls from './CardResource.module.scss';
import { Button } from '@mui/material';

const CardBlog = styled(Card)(({ theme }) => ({
  margin: 'auto',
  borderRadius: '0',
  transition: '0.3s',
  boxShadow: 'none',
  position: 'relative',
  width: '100%',
  marginLeft: 'auto',
  overflow: 'initial',
  background: '#ffffff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  borderBottom: '1px solid #efeff0',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    paddingTop: theme.spacing(2),
  },
}));

export function CardResource({ id, title, description, url, items = [] }) {
  return (
    <CardBlog sx={{ display: 'flex' }}>
      <CardContent sx={{ flex: '1', paddingTop: '0', width: '100%' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <a href={url} target="_blank" style={{ cursor: 'pointer', flex: 1 }} target="_blank" title={`Download resource ${title}`}>
            <Typography component="div" variant="h5" sx={{ color: '#56788f', font: '700 19px / 25px "DINPro", sans-serif', marginBottom: '5px' }}>
              {title}
            </Typography>
          </a>
          <a href={url} className={cls.downloadButton} target="_blank" title={`Download resource ${title}`}>
            Download
            <i class="fa fa-file-word-o" aria-hidden="true"></i>
          </a>
        </div>
        <div style={{ display: 'flex' }}>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            sx={{
              flex: 1,
              font: 'normal 14px / 21px "Roboto", sans-serif',
              color: 'rgb(51, 51, 51)',
              display: 'box',
              lineClamp: 3,
              boxOrient: 'vertical',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        <div className={cls['case-fields']}>
          {items.map((item, index) => (
            <ul className={cls['case-field']} key={index}>
              <span>{item.label}</span>
              {item.items.map((innerItem, itemIndex) => <li key={itemIndex}>
                <span>{innerItem.name}</span>
              </li>)}
            </ul>
          ))}
        </div>
      </CardContent>
    </CardBlog>
  );
}

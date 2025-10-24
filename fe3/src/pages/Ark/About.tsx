// @ts-nocheck
import { useEffect } from 'react';
import { Typography } from '@mui/material';
import cls from './styles.module.scss';

export default function ArkAbout() {
  useEffect(() => {
    document.title = 'About | Digital Public Goods Library';
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom className={cls.header} color="ark.mainFontColor">
        The Digital Public Goods Library
      </Typography>
      <Typography variant="h5" gutterBottom className={cls.title} color="ark.mainFontColor">
        Open for Education
      </Typography>
      <Typography className={cls.text} color="ark.mainFontColor">
        This library of digital public goods contains public domain and openly licensed educational materials that have either lost their digital home, or are at risk. Over time, shifting priorities and budgetary constraints of digital libraries containing educational resources in the U.S. and around the world have resulted in the disappearance of a huge amount of high-quality public domain and openly licensed educational materials. Working with other collection partners and archives, the goal of this library is to ensure that these resources are in circulation for educators, researchers, and librarians in K-12 and higher education.
      </Typography>
      <Typography variant="h5" gutterBottom className={cls.title} color="ark.mainFontColor">
        Our Mission
      </Typography>
      <Typography className={cls.text} color="ark.mainFontColor">
        The Digital Public Goods Library is committed to serve as an exemplary steward of public domain and openly licensed educational content to ensure that resource collections are preserved, regenerated, and available to all educators who wish to adopt and adapt them.
      </Typography>
      <Typography variant="h5" gutterBottom className={cls.title} color="ark.mainFontColor">
        Take Action
      </Typography>
      <Typography paragraph className={cls.text} color="ark.mainFontColor">
        Do you know of orphaned resources or collections who are looking for a good home? Please drop us a line at
        {' '}
        <a href="#">openforeducation@gmail.com</a>
      </Typography>
      <Typography paragraph className={cls.text} color="ark.mainFontColor">
        Are you a metadata librarian, archivist, or developer interested in contributing to the Digital Public Goods Library, please email
        {' '}
        <a href="#">openforeducation@gmail.com</a>
      </Typography>
    </>
  );
}
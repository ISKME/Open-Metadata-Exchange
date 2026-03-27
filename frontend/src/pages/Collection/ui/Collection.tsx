/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { GlobalStyles, Grid, Box, Typography, Button } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import { CasesAll } from 'widgets/CasesAll'
import styles from './Collection.styles'
import cls from './Collection.module.scss'

export function Collection() {
  const { id } = useParams()
  const [name, setName] = useState('')
  const [abstract, setAbstract] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [numResources, setNumResources] = useState(0)
  const [microsite, setMicrosite] = useState('')
  const [loading, setLoading] = useState(false)
  const [admin, setAdmin] = useState(false)
  useEffect(() => {
    axios.get(`/api/curatedcollections/v2/curatedcollections/${id}`).then(({ data }) => {
      const { collection } = data
      setName(collection.name)
      setAbstract(collection.abstract)
      setThumbnail(collection.thumbnail)
      setNumResources(collection.numResources)
      setMicrosite(collection.micrositeSlug)
      setLoading(true)
    })
    axios.get('/api/users/v1/profile').then(({ data }) => {
      setAdmin(data?.user?.is_superuser)
    })
  }, [])
  if (!loading) return <div />
  return (
    <>
      <Grid container spacing={2} sx={styles.container}>
        <Grid item xs={4} sx={styles.thumbnail}>
          <img src={thumbnail} width="100%" alt="Collection Thumbnail" />
          {admin && <Button
            startIcon={<SettingsIcon />}
            sx={styles.button}
            href={`/admin/curatedcollections/collection/${id}/change/`}
          >
            Edit Collection
          </Button>}
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h4">{name}</Typography>
          <div className={cls['formatted-text']} dangerouslySetInnerHTML={{ __html: abstract }} />
          {numResources ? <Typography variant="subtitle1" sx={styles.subtitle}>
            <VideoFileIcon />
            {`${numResources} affiliated cases`}
          </Typography> : ''}
        </Grid>
      </Grid>
      <Box sx={styles.box}>
        <GlobalStyles styles={styles.global} />
        <CasesAll
          titles={name}
          URL={`/api/search/v2/browse/?f.collection=${id}`}
        />
      </Box>
    </>
  )
}

// @ts-nocheck
import { useState, useEffect } from 'react'
import { Box, Grid, GlobalStyles, TextField, Button } from '@mui/material'
import styles from './Ticket.styles'

(function() {
  const originalLog = console.info
  console.info = function(message) {
    originalLog.apply(console, arguments)
    if (message === '[webpack-dev-server] App hot update...') window.location.reload()
  }
})()

export function Ticket() {
  const [page, setPage] = useState(0)
  useEffect(() => {
    const head = document.querySelector('head')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.cdnfonts.com/css/inter'
    head.appendChild(link)
    return () => {
      head.removeChild(link)
    }
  }, [])
  return (
    <Box sx={styles.box}>
      <GlobalStyles styles={styles.global} />
      <h1>Submit a Ticket</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '28px', marginTop: '56px' }}>
        <span>Your Email * </span>
        <TextField label="Tell us your email here..." variant="outlined" size="small" sx={{ height: '32px' }} />
        <span>Subject * </span>
        <TextField label="Feature Request for Future Iteration" variant="outlined" size="small" />
        <span>Description with URL * </span>
        <TextField
          label="Tell us why this custom report is needed..."
          multiline
          rows={4}
          defaultValue=""
          variant="outlined"
          size="small"
        />
        <span>Select an Issue * </span>
        <TextField label="Services Question" variant="outlined" size="small" />
        <Button sx={{ background: 'black', color: 'white' }}>Submit</Button>
        <Button sx={{ maxWidth: '200px', background: '#E3E3E3' }}>Cancel</Button>
      </div>
    </Box>
  );
}

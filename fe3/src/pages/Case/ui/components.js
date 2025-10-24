import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'

export const CButton = styled(Button)(({ theme }) => ({
  padding: '6px 12px',
  borderColor: '#303e48',
  backgroundColor: '#303e48',
  color: '#fad000',
  fontFamily: '"DINPro", sans-serif',
  boxShadow: '0 3px 0 #202c34',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  display: 'block',
  maxWidth: '100%',
  '&:hover': {
    borderColor: '#8f9bae',
    backgroundColor: '#8f9bae',
    color: '#ffffff',
    boxShadow: '0 3px 0 #7c8ba2',
  },
  '&.Mui-disabled': {
    color: '#bebebe',
  },
}))

export const GButton = styled(Button)(({ theme }) => ({
  padding: '4px 12px',
  borderColor: '#56798f',
  backgroundColor: '#56798f',
  color: '#ffffff',
  fontFamily: '"DINPro", sans-serif',
  boxShadow: '0 3px 0 #202c34',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  maxWidth: '100%',
  '&:hover': {
    borderColor: '#8f9bae',
    backgroundColor: '#8f9bae',
    color: '#ffffff',
    boxShadow: '0 3px 0 #7c8ba2',
  },
}))


const primaryColor = '#303e48';
// ToDo: make common vars global
export default {
  global: {
    '.MuiFilledInput-underline': {
      padding: '0 !important',
      '&::before': {
        borderBottom: 'none !important',
      },
      '& em': {
        fontStyle: 'normal',
      },
    },
    '.MuiSelect-filled': {
      paddingTop: '8px !important',
      paddingBottom: '8px !important',
    },
    '.MuiInputBase-inputSizeSmall': {
      minHeight: '32px',
      background: 'white !important',
    },
    '.MuiInputBase-inputMultiline': {
      boxShadow: 'none !important',
    },
  },
  box: { fontFamily: 'Inter', width: '100%', padding: '32px' },
}

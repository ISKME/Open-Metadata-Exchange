
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
    '.react-daterange-picker__wrapper': {
      border: 'none'
    },
  },
  box: { fontFamily: 'Inter', width: '100%', padding: '32px', background: '#f6f6f6' },
}

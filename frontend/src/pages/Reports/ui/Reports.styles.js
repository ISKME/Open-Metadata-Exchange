
const primaryColor = '#303e48';
// ToDo: make common vars global
export default {
  global: {
    '.MuiTabs-root': {
      background: 'rgb(48, 62, 72)',
      paddingLeft: '10%',
    },
    '.MuiTabs-flexContainer': {
      paddingTop: '3px',
    },
    '.MuiButtonBase-root.MuiTab-root.Mui-selected': {
      color: primaryColor,
      background: 'white',
    },
    '.MuiButtonBase-root.MuiTab-root': {
      color: 'white',
    },
    '.MuiTabs-indicator': {
      display: 'none',
    },
    '.MuiDataGrid-columnHeaderTitle': {
      textWrap: 'wrap !important',
      fontSize: '12px',
      fontWeight: 700,
    },
    '.MuiFormLabel-root': {
      fontSize: '14px !important',
      lineHeight: '22px !important',
    },
    '.MuiInputLabel-root': {
      fontSize: '14px !important',
      lineHeight: '22px !important',
    },
    '.MuiDataGrid-cell': {
      fontSize: '12px !important',
      paddingTop: '5px !important',
      paddingBottom: '5px !important',
    },
    '.MuiIconButton-sizeSmall': {
      padding: '0 !important',
    },
    '.MuiDataGrid-checkboxInput': {
      padding: '0 !important',
    },
    '.MuiDataGrid-cellCheckbox': {
      padding: '0 !important',
    },
    '.MuiTableCell-head': {
      fontSize: '12px !important',
    },
    '.MuiTableCell-body': {
      fontSize: '12px !important',
    },
    '.MuiAutocomplete-input': {
      fontSize: '14px !important',
      padding: '4px 12px !important',
    },
    '.MuiAutocomplete-popper *': {
      fontSize: '14px !important',
    },
    '.MuiInputBase-inputSizeSmall': {
      fontSize: '14px !important',
    },
    '.MuiMenuItem-gutters': {
      fontSize: '14px !important',
    },
  },
  box: { width: '100%', padding: '32px 0' },
  container: { padding: '0 32px', '@media (max-width: 1168px)': { padding: '0 16px' } },
  paper: { width: 320, maxWidth: '100%' },
  menu: (index, selected) => ({
    backgroundColor: index === selected ? 'rgba(0, 0, 0, 0.1)' : '',
    borderBottom: '1px solid #e8e8e8'
  }),
  item: (index, selected) => ({
    '>span': { fontWeight: index === selected ? 'bold' : 400, display: 'inline' },
    '&:before': { content: index === selected ? '"› "' : '""' },
  })
}

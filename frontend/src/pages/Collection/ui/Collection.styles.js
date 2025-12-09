export default {
  global: {
    '.MuiButtonBase-root.MuiTab-root.Mui-selected': {
      backgroundColor: '#303e48',
      borderColor: '#303e48',
      boxShadow: 'none',
      color: '#ffffff',
      textTransform: 'capitalize',
    },
    '.MuiButtonBase-root.MuiTab-root': {
      borderColor: '#efeff0',
      backgroundColor: '#ffffff',
      boxShadow: 'none',
      color: '#56788f',
      borderRadius: '4px 4px 0 0',
      border: '1px solid rgb(239, 239, 240)',
      borderBottom: 'none',
      textTransform: 'capitalize',
    },
  },
  container: { padding: '24px 10%', border: '1px solid rgb(239, 239, 240)' },
  button: { marginTop: '16px', width: '100%', color: 'rgb(45, 66, 80)' },
  subtitle: { marginTop: '16px', display: 'flex', gap: '8px' },
  box: { width: '100%', paddingBottom: '64px' },
  thumbnail: { paddingRight: '32px' },
}

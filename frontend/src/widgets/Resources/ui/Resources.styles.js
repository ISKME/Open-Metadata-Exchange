export default {
  accordion: {
    boxShadow: 'none',
    marginBottom: '16px',
  },
  sub: {
    marginBottom: '16px',
    border: '1px solid #d6d8da',
    boxShadow: 'none',
    borderRadius: '4px',
    '&::before': {
      opacity: '0',
    },
  },
  summary: {
    backgroundColor: '#303e48',
    stroke: '#fad000',
    color: '#fad000',
    borderRadius: '4px',
    boxShadow: 'none',
  },
  inner: {
    borderRadius: '4px',
    boxShadow: 'none',
    '&.Mui-expanded': {
      backgroundColor: '#56788f',
      border: 'none',
      stroke: 'white',
      color: 'white',
    },
  },
};

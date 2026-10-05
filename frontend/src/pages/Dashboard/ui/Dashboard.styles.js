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

    '.dashboard-date-range-picker': {
      display: 'inline-flex',
      alignItems: 'center',
      borderLeft: '1px solid rgba(0, 0, 0, 0.23)',
      minHeight: '44px',
    },

    '.dashboard-date-range-picker .react-daterange-picker': {
      maxWidth: '100%',
      minWidth: '250px',
    },

    '.dashboard-date-range-picker .react-daterange-picker__wrapper': {
      border: 'none',
      minHeight: '44px',
      height: '44px',
      alignItems: 'center',
      overflow: 'visible',
      whiteSpace: 'nowrap',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup': {
      minHeight: '44px',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      padding: '0 8px',
      overflow: 'visible',
      whiteSpace: 'nowrap',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup__input': {
      minHeight: '24px',
      lineHeight: 1.5,
      padding: 0,
      margin: 0,
      boxSizing: 'content-box',
      textAlign: 'center',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup__day': {
      minWidth: '30px',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup__month': {
      minWidth: '30px',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup__year': {
      minWidth: '52px',
    },

    '.dashboard-date-range-picker .react-daterange-picker__inputGroup__divider': {
      padding: '0 4px',
      whiteSpace: 'nowrap',
    },

    '.dashboard-date-range-picker .react-daterange-picker__range-divider': {
      padding: '0 8px',
      whiteSpace: 'nowrap',
    },

    '.dashboard-date-range-picker .react-daterange-picker__button': {
      minWidth: '44px',
      minHeight: '44px',
      padding: '10px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
    },

    '.react-calendar__navigation button': {
      minWidth: '44px',
      minHeight: '44px',
      boxSizing: 'border-box',
    },

    '@media (max-width: 320px)': {
      '.dashboard-date-range-picker': {
        width: '100%',
        borderLeft: 0,
        borderTop: '1px solid rgba(0, 0, 0, 0.23)',
      },

      '.dashboard-date-range-picker .react-daterange-picker': {
        width: '100%',
        minWidth: 0,
      },

      '.dashboard-date-range-picker .react-daterange-picker__wrapper': {
        width: '100%',
      },
    },
    '.MuiButtonBase-root.Mui-focusVisible, .MuiButton-root.Mui-focusVisible, .MuiIconButton-root.Mui-focusVisible': {
      outline: '2px solid #005fcc',
      outlineOffset: '2px',
    },

    '.MuiLink-root:focus-visible, a:focus-visible': {
      outline: '2px solid #005fcc',
      outlineOffset: '3px',
      borderRadius: '2px',
    },

    '.MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused': {
      outline: '2px solid #005fcc',
      outlineOffset: '2px',
    },

    '.MuiAutocomplete-root .MuiOutlinedInput-root.Mui-focused fieldset': {
      borderColor: '#005fcc !important',
    },

    '.MuiSelect-select:focus-visible': {
      outline: '2px solid #005fcc',
      outlineOffset: '2px',
    },
  },

  box: {
    fontFamily: 'Inter',
    width: '100%',
    padding: '32px',
    background: '#f6f6f6',
  },
};

export const globalStyles = {
  'input.MuiOutlinedInput-input': {
    border: 'none !important',
    outline: 'none !important',
    boxShadow: 'none !important',
    background: 'transparent !important',
  },
  'fieldset.MuiOutlinedInput-notchedOutline': {
    border: 'none !important',
  },
  '.MuiCardMedia-media.MuiCardMedia-img': {
    // objectFit: 'contain !important',
    borderRadius: '8px',
  },
  '.MuiTab-labelIcon': {
    flexDirection: 'row !important',
    gap: '16px'
  },
  '.MuiTabs-flexContainer': {
    justifyContent: 'center !important',
  }
}
export const classes = {
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '16px 0'
  },
  tabButton: {
    textTransform: 'none',
    padding: '10px 24px',
    fontSize: '1rem',
    fontWeight: 400,
    minWidth: 'auto',
    lineHeight: 1.5,
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
  inactiveTab: {
    // backgroundColor: '#D5D5D5',
    borderRadius: '8px 0 0 8px',
    border: '1px solid transparent',
  },
  activeTab: {
    // backgroundColor: 'white',
    // color: '#388E3C',
    // border: '1px solid #388E3C',
    borderRadius: '0 8px 8px 0',
    opacity: .7,
    '&:hover': {
      opacity: 1,
      backgroundColor: '#F5F5F5',
      // border: '1px solid #388E3C',
    },
  }
}

export const sxStyles = {
  root: {
    flexGrow: 1,
    backgroundColor: 'background.default',
  },
  container: (theme) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  }),
  searchBar: (theme) => ({
    backgroundColor: '#ffffff',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(4),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  }),
  searchInput: (theme) => ({
    flexGrow: 1,
    marginRight: theme.spacing(2),
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      marginBottom: 0,
    },
  }),
  searchButton: (theme) => ({
    backgroundColor: theme.palette.primary.main,
    color: '#ffffff',
    textTransform: 'none',
    padding: theme.spacing(1, 3),
    fontSize: '1rem',
    '&:hover': {
      // backgroundColor: '#218838',
    },
    marginBottom: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
      marginBottom: 0,
    },
  }),
  filterSection: (theme) => ({
    backgroundColor: '#ffffff',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(6),
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  }),
  filterControl: (theme) => ({
    minWidth: 180,
    flexGrow: 1,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: 4,
    },
    '& .MuiInputLabel-outlined': {
      color: '#6e7072',
    },
  }),
  dateRange: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: 4,
    padding: theme.spacing(0.5, 1.5),
    backgroundColor: '#ffffff',
    color: 'text.secondary',
    minHeight: 40,
    fontSize: '0.9rem',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      justifyContent: 'center',
    },
  }),
  sectionTitle: (theme) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(1),
    fontWeight: 600,
    fontSize: '2rem',
    color: 'text.primary',
  }),
  sectionSubtitle: (theme) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(6),
    color: 'text.secondary',
    fontSize: '1.1rem',
  }),
  card: {
    maxWidth: 345,
    // borderRadius: 8,
    boxShadow: 'none', // '0px 4px 10px rgba(0, 0, 0, 0.05)',
    height: '100%',
    margin: 'auto',
  },
  cardMedia: {
    borderRadius: '8px !important',
    height: 200,
    objectFit: 'contain',
  },
  cardContent: (theme) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
  }),
  cardTitle: (theme) => ({
    fontSize: '1.15rem',
    fontWeight: 600,
    marginBottom: theme.spacing(0.5),
  }),
  cardSubtitle: (theme) => ({
    fontSize: '0.9rem',
    color: 'text.secondary',
    marginBottom: theme.spacing(0.5),
  }),
  cardResources: {
    fontSize: '0.8rem',
    color: 'text.secondary',
  },
  viewAllButton: (theme) => ({
    marginTop: theme.spacing(4),
    // marginBottom: theme.spacing(8),
    borderColor: theme.palette.primary.main, // ToDo: '#28a745',
    color: theme.palette.primary.main,
    textTransform: 'none',
    padding: theme.spacing(1, 4),
    borderRadius: 4,
    '&:hover': {
      backgroundColor: 'rgba(40, 167, 69, 0.04)',
    },
  }),
  featureCard: (theme) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(6),
    borderRadius: 8,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
    // height: '100%',
  }),
  featureIcon: (theme) => ({
    fontSize: '3rem',
    color: theme.palette.primary.main,
    marginBottom: '30px',
    marginTop: '60px',
  }),
  featureTitle: (theme) => ({
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  }),
  featureDescription: (theme) => ({
    fontSize: '0.9rem',
    color: 'text.secondary',
    marginBottom: theme.spacing(2),
    flexGrow: 1,
  }),
  featureLink: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    color: theme.palette.primary.main,
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
    },
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
  }),
  featureLinkIcon: (theme) => ({
    fontSize: '1rem',
    marginRight: theme.spacing(0.75),
  }),
  featureButton: (theme) => ({
    borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    textTransform: 'none',
    padding: theme.spacing(0.75, 2),
    borderRadius: 4,
    fontSize: '0.9rem',
    '&:hover': {
      backgroundColor: 'rgba(40, 167, 69, 0.04)',
    },
    marginBottom: theme.spacing(1),
  }),
  footerSection: (theme) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(8, 0),
    backgroundColor: theme.palette.primary.main,
    backgroundImage: `url("/static/0.png")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundBlendMode: 'multiply',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }),
  footerText: (theme) => ({
    fontSize: '2rem',
    fontWeight: 600,
    marginBottom: theme.spacing(3),
  }),
  footerButton: (theme) => ({
    borderColor: '#ffffff',
    color: '#ffffff',
    textTransform: 'none',
    padding: theme.spacing(1.2, 4),
    borderRadius: 4,
    fontSize: '1.1rem',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  }),
  toggleButtonGroup: {
    display: 'flex',
    // justifyContent: 'center',
    // marginBottom: theme.spacing(6),
  },
  toggleButton: {
    borderRadius: '4px',
    // padding: theme.spacing(1, 4),
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 400,
    border: '1px solid #E0E0E0',
    // color: theme.palette.text.primary,
    backgroundColor: '#E0E0E0', // Inactive background
    '&:hover': {
      backgroundColor: '#D5D5D5',
    },
  },
  toggleButtonLeft: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  toggleButtonRight: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    // marginLeft:, // Dark green text for active
    // borderColor: theme.palette.primary.main, // Dark green border for active
    zIndex: 1, // Bring active button to front to ensure border is visible
    '&:hover': {
      backgroundColor: '#DCECDC', // Slightly darker green on hover
      // borderColor: theme.palette.primary.main,
    },
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    // marginTop: theme.spacing(8),
  },
  paginationButton: {
    minWidth: '36px',
    height: '36px',
    borderRadius: '4px',
    // margin: theme.spacing(0, 0.5),
    textTransform: 'none',
    fontSize: '0.9rem',
    borderColor: '#E0E0E0',
    // color: theme.palette.text.primary,
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  paginationButtonActive: {
    backgroundColor: '#E8F5E9',
    // color: theme.palette.primary.main,
    // borderColor: theme.palette.primary.main,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#DCECDC',
    },
  },
}
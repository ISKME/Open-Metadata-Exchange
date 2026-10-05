// @ts-ignore
import cls from './SharedPreferences.module.scss';
import { classes } from 'pages/OERX/styles';
import { Box, FormControlLabel, Checkbox, Typography, Tooltip, SvgIcon, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const styles = {
  appContainer: (theme) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    // Background color handled by CssBaseline default
  }),
  sectionCard: (theme) => ({
    backgroundColor: theme.palette.background.paper, // White background
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)', // Subtle shadow
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
  }),
  sectionHeader: (theme) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  }),
  headerNumberCircle: (theme) => ({
    backgroundColor: theme.palette.primary.main,
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing(1.5),
  }),
  headerTitle: (theme) => ({
    fontWeight: 'bold',
    fontSize: '1.25rem', // Match screenshot font size
    color: theme.palette.text.primary,
  }),
  divider: (theme) => ({
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(3),
  }),
  sectionSubheading: (theme) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(8),
    color: theme.palette.text.primary,
  }),
  formControl: {
    width: '100%',
  },
  selectRoot: (theme) => ({
    // '& .MuiOutlinedInput-root': {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: '#f8f8f8', // Light grey input background
      '& fieldset': {
        borderColor: '#e0e0e0', // Light border
      },
      '&:hover fieldset': {
        borderColor: '#c0c0c0', // Slightly darker hover border
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main, // Primary color on focus
      },
    // },
    // '& .MuiSelect-select': {
      padding: '10px 14px', // Adjust padding inside select
      color: '#9e9e9e', // Grey text for the selected value
      fontSize: '0.95rem',
    // },
    // '& .MuiSelect-icon': {
    //     color: '#9e9e9e', // Grey arrow icon
    // }
  }),
  checkboxGrid: (theme) => ({
    marginTop: theme.spacing(2),
  }),
  checkboxSectionTitle: (theme) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
    fontSize: '1.05rem',
  }),
  formControlLabel: (theme) => ({
    marginBottom: theme.spacing(0.5),
    '& .MuiTypography-root': {
      fontSize: '0.9rem',
      color: theme.palette.text.primary,
    },
  }),
  helpIcon: (theme) => ({
    fontSize: '1rem',
    marginLeft: theme.spacing(0.5),
    color: theme.palette.text.secondary,
  }),
  checkedCheckbox: (theme) => ({
    color: theme.palette.success.main, // Green for checked checkboxes
    '&.Mui-checked': {
      color: theme.palette.success.main,
    },
  }),
}

interface SubscribedContentProps {
    className?: string;
}

// Helper component for Checkbox items with Help icon
function CheckboxItem({ label, checked }) {
  return (
    <Box display="flex" alignItems="center" marginBottom={1}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={() => {}} // Placeholder onChange
            name={label}
            size="small"
            sx={{ checked: classes.checkedCheckbox }}
          />
        }
        label={<Typography variant="body2" style={{ fontSize: '0.9rem', color: '#333' }}>{label}</Typography>}
        sx={styles.formControlLabel}
      />
      <Tooltip title="Help information for this item" placement="top" arrow>
        <HelpOutlineIcon sx={styles.helpIcon} />
      </Tooltip>
    </Box>
  );
}

// Define HelpOutlineIcon
function HelpOutlineIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.4-.4.63-.94.63-1.51 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.35 1.71-.93 2.36z" />
    </SvgIcon>
  );
}

function MetadataSection({ n, title, children }) {
  return <Accordion sx={{
    mb: 2,
    boxShadow: 'none',
    background: 'white',
    border: '1px solid rgba(0, 0, 0, .1)',
    borderRadius: '8px',
    height: 'fit-content',
    '&::before': { display: 'none' }
  }}>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel1-content"
      id="panel1-header"
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Typography variant="h6" sx={styles.headerTitle}>{title}</Typography>
        {Number(n) > 0 && (<>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clipPath="url(#clip0_454_2653)">
              <path d="M12.0002 1.5C12.6658 1.5 13.2799 1.85156 13.6174 2.42812L23.7424 19.6781C24.0846 20.2594 24.0846 20.9766 23.7518 21.5578C23.419 22.1391 22.7955 22.5 22.1252 22.5H1.87522C1.20491 22.5 0.581473 22.1391 0.24866 21.5578C-0.084152 20.9766 -0.0794645 20.2547 0.258035 19.6781L10.383 2.42812C10.7205 1.85156 11.3346 1.5 12.0002 1.5ZM12.0002 7.5C11.3768 7.5 10.8752 8.00156 10.8752 8.625V13.875C10.8752 14.4984 11.3768 15 12.0002 15C12.6237 15 13.1252 14.4984 13.1252 13.875V8.625C13.1252 8.00156 12.6237 7.5 12.0002 7.5ZM13.5002 18C13.5002 17.6022 13.3422 17.2206 13.0609 16.9393C12.7796 16.658 12.398 16.5 12.0002 16.5C11.6024 16.5 11.2209 16.658 10.9396 16.9393C10.6583 17.2206 10.5002 17.6022 10.5002 18C10.5002 18.3978 10.6583 18.7794 10.9396 19.0607C11.2209 19.342 11.6024 19.5 12.0002 19.5C12.398 19.5 12.7796 19.342 13.0609 19.0607C13.3422 18.7794 13.5002 18.3978 13.5002 18Z" fill="#EB4D39"/>
            </g>
            <defs>
              <clipPath id="clip0_454_2653">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span className={cls.number}>{n}</span>
          <Typography variant="subtitle1" sx={{ display: 'inline' }}>value unmapped</Typography>
        </>)}
        {Number(n) === -1 && (<>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2.24976C6.6239 2.24976 2.25 6.62366 2.25 11.9998C2.25 17.3758 6.6239 21.7497 12 21.7497C17.3761 21.7497 21.75 17.3758 21.75 11.9998C21.75 6.62366 17.3761 2.24976 12 2.24976ZM17.0742 8.7321L10.7742 16.2321C10.7051 16.3144 10.6191 16.3809 10.5221 16.4271C10.425 16.4733 10.3192 16.498 10.2117 16.4998H10.1991C10.0939 16.4997 9.99 16.4776 9.89398 16.4348C9.79796 16.392 9.71202 16.3295 9.64172 16.2513L6.94172 13.2513C6.87315 13.1786 6.81981 13.0929 6.78483 12.9992C6.74985 12.9056 6.73395 12.8059 6.73805 12.7061C6.74215 12.6062 6.76617 12.5081 6.8087 12.4177C6.85123 12.3272 6.91142 12.2462 6.98572 12.1793C7.06002 12.1125 7.14694 12.0611 7.24136 12.0283C7.33578 11.9955 7.43581 11.9819 7.53556 11.9884C7.63531 11.9948 7.73277 12.0211 7.82222 12.0657C7.91166 12.1103 7.99128 12.1724 8.0564 12.2482L10.1794 14.6069L15.9258 7.76741C16.0547 7.61838 16.237 7.52607 16.4335 7.51042C16.6299 7.49477 16.8246 7.55704 16.9754 7.68377C17.1263 7.8105 17.2212 7.99151 17.2397 8.18768C17.2582 8.38385 17.1988 8.57941 17.0742 8.7321Z" fill="#34B53A"/>
          </svg>
          <Typography variant="subtitle1" sx={{ display: 'inline' }}> All values mapped</Typography>
        </>)}
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      {children}
    </AccordionDetails>
  </Accordion>
}

export const SharedPreferences = ({ className }: SubscribedContentProps) => {
  return (
    <div className={cls.updatesData}>
      {/* <div className={cls.callout}>
        <div className={cls.frame}>
          <h1>
            Manage how auto push your
            <br />
            shared content changes
          </h1>
          <p>
            All preferences are initially accepted by default.
            <br />
            <b>Use the toggle to customize update acceptance</b>
          </p>
        </div>
      </div> */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <div>
        <MetadataSection n={0} title="Content Engagement updates">
          <CheckboxItem label="Comments added" checked={false} />
          <CheckboxItem label="Reviews added" checked={false} />
        </MetadataSection>
        </div>
        <div>
        <MetadataSection n={0} title="Deccessioned updates">
          <CheckboxItem label="Copyright" checked={false} />
          <CheckboxItem label="Out of Date" checked={false} />
          <CheckboxItem label="Inappropriate / Spam" checked={false} />
        </MetadataSection>
        </div>
        <div>
        <MetadataSection n={0} title="URL updates">
          <CheckboxItem label="Replacing Broken URLs" checked={false} />
          <CheckboxItem label="URL redirect updates" checked={false} />
          <CheckboxItem label="Replace Aggregator Links" checked={false} />
        </MetadataSection>
        </div>
        <div>
        <MetadataSection n={0} title="Metadata updates">
          <CheckboxItem label="License changes" checked={false} />
          <CheckboxItem label="Keyword updates" checked={false} />
          <CheckboxItem label="User generated tags added" checked={false} />
          <CheckboxItem label="Metadata cleanup" checked={false} />
          <CheckboxItem label="Accessibility update" checked={false} />
          <CheckboxItem label="Resource alignments update" checked={false} />
        </MetadataSection>
        </div>
      </div>
    </div>
  );
};

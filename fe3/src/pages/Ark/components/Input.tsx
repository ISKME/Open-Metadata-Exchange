// @ts-nocheck
import { IconButton, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Icon from '../icons/Magnify';
import { matomoTag } from "pages/Case/ui/helper";

export default function SearchBar({ value, onChange, onSearch, placeholder = "Search", matomoAction = 'site search' }) {
  const theme = useTheme();
  const handleKeyDown = ({ key }) => {
    if (key === 'Enter') {
      matomoTag({
        category: 'Search',
        action: matomoAction,
        name: (typeof value === 'string' ? value : '').trim() || '(empty)',
      });
      onSearch?.();
    }
  };

  return (
    <FormControl sx={{
      width: 730,
      borderRadius: '8px',
      fontFamily: 'Inter, sans-serif',
      bgcolor: 'ark.inputsBackgroundColor',
      color: 'ark.inputsTextColor',
      '& .MuiInputLabel-root': {
        bgcolor: 'ark.inputsBackgroundColor',
        color: 'ark.inputsTextColor',
        borderRadius: 2,
        paddingLeft: 2,
        paddingRight: 2,
      },
    }} variant="outlined">
      <InputLabel htmlFor="searchbar">{placeholder}</InputLabel>
      <OutlinedInput
        id="searchbar"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                matomoTag({
                  category: 'Search',
                  action: matomoAction,
                  name: (typeof value === 'string' ? value : '').trim() || '(empty)',
                });
                onSearch?.();
              }}
              edge="end"
            >
              <Icon color={theme.palette.ark.inputsTextColor} />
            </IconButton>
          </InputAdornment>
        }
        label={placeholder}
        sx={{
          padding: '0 24px',
          color: 'ark.inputsTextColor',
          '& .MuiInputLabel-root': {
            color: 'ark.inputsTextColor',
          },
        }}
      />
    </FormControl>
  );
}
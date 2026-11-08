// @ts-nocheck
import { IconButton, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Icon from './icons/Magnify';

export default function SearchBar({ value, onChange, onSearch, placeholder = "Search", label = placeholder, width = '700px' }) {
  const theme = useTheme();
  // Enter in the field and clicking the icon button both submit the form.
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.();
  };

  return (
    <form role="search" onSubmit={handleSubmit}>
      <OutlinedInput
        id="searchbar"
        value={value}
        onChange={onChange}
        inputProps={{ 'aria-label': label }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton type="submit" aria-label="Submit search" edge="end">
              {/* color={theme.palette.ark.inputsTextColor} */}
              <Icon />
            </IconButton>
          </InputAdornment>
        }
        placeholder={placeholder}
        sx={{
          width: { md: width, sm: '100%', xs: '100%' },
          padding: '0 24px',
          '& input': {
            height: '3.5em',
            background: 'transparent',
            border: 'none',
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
            },
          },
          // color: 'ark.inputsTextColor',
          // '& .MuiInputLabel-root': {
          //   color: 'ark.inputsTextColor',
          // },
        }}
      />
    </form>
  );
}

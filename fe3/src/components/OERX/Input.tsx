// @ts-nocheck
import { IconButton, FormControl, InputLabel, OutlinedInput, InputAdornment } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Icon from './icons/Magnify';

export default function SearchBar({ value, onChange, onSearch, placeholder = "Search", width = '700px' }) {
  const theme = useTheme();
  const handleKeyDown = ({ key }) => key === 'Enter' && onSearch?.();

  return (
    <OutlinedInput
      id="searchbar"
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            onClick={onSearch}
            edge="end"
          >
            {/* color={theme.palette.ark.inputsTextColor} */}
            <Icon />
          </IconButton>
        </InputAdornment>
      }
      placeholder={placeholder}
      sx={{
        width,
        padding: '0 24px',
        '& input': {
          height: '3.5em',
          background: 'transparent',
          border: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: 'none',
          }
        }
        // color: 'ark.inputsTextColor',
        // '& .MuiInputLabel-root': {
        //   color: 'ark.inputsTextColor',
        // },
      }}
    />
  );
}

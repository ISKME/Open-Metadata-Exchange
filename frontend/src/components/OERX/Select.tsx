import { Autocomplete, TextField } from '@mui/material';

export default function Dropdown({
  id = 'dropdown',
  label = '',
  options = [],
  value = [],
  onChange,
  multiple = true,
}) {
  return (
    <Autocomplete
      multiple={multiple}
      id={id}
      options={options}
      getOptionLabel={(option) => option.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
        />
      )}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      sx={{ minWidth: '250px' }}
    />
  );
}

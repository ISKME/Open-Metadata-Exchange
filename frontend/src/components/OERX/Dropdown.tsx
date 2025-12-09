import { FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';

export default function Dropdown({
  id = 'dropdown',
  label = '',
  options = [],
  value = [],
  onChange,
  multiple = true,
}) {
  return (
    <FormControl size="small" sx={{
      width: 200,
      bgcolor: 'ark.inputsBackgroundColor',
      borderRadius: 2,
      '& .MuiInputBase-root': {
        bgcolor: 'ark.inputsBackgroundColor',
        color: 'ark.inputsTextColor',
        borderRadius: 2,
        paddingLeft: 2,
        paddingRight: 2,
      },
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '& .MuiInputBase-inputSizeSmall': {
        padding: '0 0 8px',
        fontSize: '16px',
        paddingTop: '6px',
      },
      '& .MuiSvgIcon-root': {
        color: 'ark.inputsTextColor',
      },
      '& .MuiInputLabel-root': {
        color: 'ark.inputsTextColor',
        backgroundColor: 'ark.inputsBackgroundColor',
        padding: '4px 12px',
        borderRadius: 2,
        // transform: 'translate(14px, -18px) scale(0.75)',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: 'ark.inputsTextColor',
      },
    }}>
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        labelId={id}
        multiple={multiple}
        value={value}
        onChange={onChange}
        label={label}
        renderValue={
          multiple
            ? (selected) => selected.join(', ')
            : (selected) => selected
        }
        IconComponent={(props) => <span {...props} style={{ color: 'ark.inputsTextColor', right: 10, top: 'calc(50% - 1em)', fontSize: 16 }}>⮟</span>}
        sx={{
          bgcolor: 'ark.inputsBackgroundColor',
          color: 'ark.inputsTextColor',
          borderRadius: 2,
          fontSize: 24,
          fontWeight: 400,
          '& .MuiSelect-icon': {
            color: 'ark.inputsTextColor',
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: 'ark.inputsBackgroundColor',
              color: 'ark.inputsTextColor',
              '& .MuiMenuItem-gutters': {
                padding: multiple ? 0 : '',
              },
            },
          }
        }}
      >
        {options.map(({ name, slug }) => (
          <MenuItem key={slug} value={name}>
            {multiple ? (
              <>
                <Checkbox checked={value.indexOf(name) > -1} sx={{ color: 'ark.inputsTextColor', '&.Mui-checked': { color: 'ark.inputsTextColor' } }} />
                <ListItemText primary={name} />
              </>
            ) : (
              <ListItemText primary={name} />
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

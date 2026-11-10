import { useId, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

export default function Dropdown({
  id,
  label = '',
  options = [],
  value = [],
  onChange,
  multiple = true,
}) {
  // Every filter needs its own id: the label is tied to the input through `for`/`id`,
  // so a shared id would point all labels at the first field on the page.
  const generatedId = useId();
  const inputId = id || `dropdown-${generatedId}`;
  const [open, setOpen] = useState(false);

  return (
    <Autocomplete
      multiple={multiple}
      id={inputId}
      options={options}
      getOptionLabel={(option) => option.name}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
        />
      )}
      // Render the option list inside this component instead of at the end of <body>,
      // so it stays inside the page's <main> landmark (axe: "region").
      disablePortal
      slotProps={{
        // The input (role="combobox") already reports aria-expanded and aria-controls;
        // the arrow button that opens the list should report aria-expanded too.
        // No aria-controls here: with no matching options there is no listbox to point to.
        popupIndicator: {
          'aria-expanded': open,
        },
      }}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      sx={{ minWidth: '250px' }}
    />
  );
}

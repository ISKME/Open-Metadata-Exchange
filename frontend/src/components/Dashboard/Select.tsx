import { Autocomplete, TextField, CircularProgress } from '@mui/material'

export default function({
  id = '',
  label = '',
  options = [],
  value = null,
  loading = false,
  onChange = () => {},
  disableClearable = false,
  ...rest
}) {
  return (
    <Autocomplete
      id={id}
      options={options || []}
      loading={loading}
      value={value || null}
      onChange={onChange}
      disableClearable={Boolean(disableClearable)}
      {...rest}
      renderInput={(params) => (
        // variant="standard"
        <TextField
          {...params}
          label={label}
          size="small"
          sx={{
            minWidth: '200px',
            '& fieldset': {
              border: 'none !important',
            }
          }}
          InputProps={{
            ...params.InputProps,
            type: 'search',
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} aria-label="Loading options" /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

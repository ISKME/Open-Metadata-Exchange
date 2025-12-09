import { Autocomplete, TextField, CircularProgress } from '@mui/material'

export default function({
  id = '',
  label = '',
  options = [],
  value = null,
  loading = false,
  onChange = () => {}
}) {
  return (
    <Autocomplete
      id={id}
      options={options || []}
      loading={loading}
      value={value || null}
      onChange={onChange}
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
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

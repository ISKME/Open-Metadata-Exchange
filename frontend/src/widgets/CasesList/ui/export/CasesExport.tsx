import {
  useEffect, useId, useRef, useState,
} from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, FormControl, InputLabel, LinearProgress, MenuItem, Select,
} from '@mui/material';
import { downloadCaseExport, exportCases } from './exportCases';

type Props = {
  exportUrl: string;
  searchParams: string;
  selectedIds: string[];
  csrfToken: string;
  disabled?: boolean;
};

export function CasesExport({
  exportUrl, searchParams, selectedIds, csrfToken, disabled = false,
}: Props) {
  const id = useId();
  const request = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  useEffect(() => () => request.current?.abort(), []);

  const close = () => {
    request.current?.abort();
    request.current = null;
    setBusy(false);
  };

  const start = async () => {
    if (request.current || disabled || !csrfToken) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setProgress(null);
    setError('');
    try {
      const downloadUrl = await exportCases({
        exportUrl,
        searchParams,
        selectedIds,
        csrfToken,
        signal: controller.signal,
        onProgress: setProgress,
      });
      if (!controller.signal.aborted) downloadCaseExport(downloadUrl);
    } catch {
      if (!controller.signal.aborted) setError('Unable to export cases. Please try again.');
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setBusy(false);
      }
    }
  };

  return (
    <Box sx={{ minWidth: 190 }}>
      <FormControl fullWidth disabled={disabled || busy || !csrfToken}>
        <InputLabel id={`${id}-label`} shrink>Export</InputLabel>
        <Select
          labelId={`${id}-label`}
          label="Export"
          value=""
          displayEmpty
          notched
          onChange={start}
          sx={{ backgroundColor: '#fff' }}
        >
          <MenuItem value="" disabled>Select format</MenuItem>
          <MenuItem value="csv_lessons">CSV (Cases)</MenuItem>
        </Select>
      </FormControl>
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}
      <Dialog open={busy} onClose={close} aria-labelledby={`${id}-title`}>
        <DialogTitle id={`${id}-title`}>Exporting cases</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Preparing your CSV export. The download will start when it is ready.
          </DialogContentText>
          <LinearProgress
            aria-label="Case export progress"
            variant={progress === null ? 'indeterminate' : 'determinate'}
            value={progress ?? undefined}
          />
          <DialogContentText sx={{ mt: 2 }}>
            Closing this dialog stops waiting for the download. The export will continue on the server.
          </DialogContentText>
        </DialogContent>
        <DialogActions><Button onClick={close}>Close</Button></DialogActions>
      </Dialog>
    </Box>
  );
}

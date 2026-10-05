import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
  Alert, Box, Button, Checkbox, FormControlLabel, Popover,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import { buildExportCsv, getExportSections } from './exportReports';
import type { VideoExportTab } from './exportReports';
import { downloadReportBlob, fetchExportVideos } from './downloadReports';
import type { VideoAnalyticsReport } from './types';
import type { VideoAnalyticsParams } from './VideoAnalytics';

type Props = {
  tab: VideoExportTab;
  report: VideoAnalyticsReport;
  params: VideoAnalyticsParams;
  organizationName?: string;
};

export function VideoAnalyticsExport({
  tab, report, params, organizationName,
}: Props) {
  const sections = getExportSections(tab);
  const available = sections.map((section) => section.id);
  const [selected, setSelected] = useState<string[]>([]);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => { request.current?.abort(); }, []);

  const exportReport = async (format: 'csv' | 'pdf') => {
    const selectedIds = tab === 'geo-location' ? available : selected;
    if (request.current || (format === 'csv' && !selectedIds.length)) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      let blob: Blob;
      if (format === 'pdf') {
        const { data } = await axios.get<Blob>('/clickhouse/overall/video-analytics/', {
          params: { ...params, format: 'pdf' }, responseType: 'blob', signal: controller.signal,
        });
        if (!(data instanceof Blob) || data.type !== 'application/pdf' || !data.size) {
          throw new Error('Invalid PDF response');
        }
        blob = data;
      } else {
        const videos = tab === 'engagement' && selectedIds.includes('top-videos')
          ? await fetchExportVideos(params, controller.signal) : undefined;
        blob = new Blob(
          [
            buildExportCsv(
              tab,
              selectedIds,
              report,
              params,
              videos,
              organizationName,
            ),
          ],
          { type: 'text/csv;charset=utf-8' },
        );
      }
      if (!controller.signal.aborted) {
        const prefix = format === 'pdf' ? 'summary-engagement-report' : `video-analytics-${tab}`;
        downloadReportBlob(blob, `${prefix}_${params.date_range_start}_${params.date_range_end}.${format}`);
        setAnchor(null);
      }
    } catch {
      if (!controller.signal.aborted) setError('Unable to export the report. Please try again.');
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        {tab === 'engagement' ? (
          <Button variant="outlined" size="small" startIcon={<PictureAsPdfOutlinedIcon />} disabled={busy} onClick={() => exportReport('pdf')}>
            Download Report
          </Button>
        ) : null}
        <Button
          variant="outlined"
          size="small"
          endIcon={tab === 'geo-location' ? undefined : <KeyboardArrowDownIcon />}
          disabled={busy}
          aria-haspopup={tab === 'geo-location' ? undefined : 'dialog'}
          aria-expanded={Boolean(anchor)}
          onClick={(event) => (tab === 'geo-location' ? exportReport('csv') : setAnchor(event.currentTarget))}
        >
          {busy ? 'Preparing report…' : 'Export'}
        </Button>
      </Box>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => { if (!busy) setAnchor(null); }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box role="dialog" aria-label="Export reports" sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
          <FormControlLabel
            label="All"
            control={(
              <Checkbox
                checked={selected.length === available.length}
                indeterminate={selected.length > 0 && selected.length < available.length}
                disabled={busy}
                onChange={(_event, checked) => setSelected(checked ? available : [])}
              />
            )}
          />
          {sections.map((section) => (
            <FormControlLabel
              key={section.id}
              sx={{ ml: 1 }}
              label={section.label}
              control={(
                <Checkbox
                  disabled={busy}
                  checked={selected.includes(section.id)}
                  onChange={(_event, checked) => setSelected((current) => (
                    checked ? [...current, section.id] : current.filter((id) => id !== section.id)
                  ))}
                />
              )}
            />
          ))}
          <Button variant="contained" disabled={busy || !selected.length} onClick={() => exportReport('csv')}>
            {busy ? 'Preparing report…' : 'Export Reports'}
          </Button>
        </Box>
      </Popover>
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}
    </Box>
  );
}

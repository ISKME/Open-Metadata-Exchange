import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Fab,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowId,
  GridRowsProp,
  GridRowSelectionModel,
  useGridApiRef,
} from '@mui/x-data-grid';

interface Annotation {
  id: number;
  text: string;
  scope: string;
  ranges: { start: string; end: string } | null;
}

interface Props {
  videoUrl: string;
  videoVTT: string;
  inline?: boolean;
  editUrl?: string;
}

interface Row {
  id: number;
  start: string;
  end: string;
  text: string;
}

const getCsrfToken = () =>
  axios.get('/api/csrf-token/').then(({ data }) => data.token);

async function fetchAnnotations(videoUrl: string): Promise<Annotation[]> {
  const { data } = await axios.get(`/api/annotations/?uri=${encodeURIComponent(videoUrl)}`);
  const entity = (data || []).find((e: any) => e.uri === videoUrl);
  return (entity?.annotations || []).filter((a: any) => a.scope === 'annotation');
}

async function importFromVtt(videoVTT: string): Promise<void> {
  const token = await getCsrfToken();
  await axios.post(videoVTT, {}, {
    headers: { 'X-Csrftoken': token },
  });
}

async function uploadVttFile(videoVTT: string, file: File): Promise<number> {
  const token = await getCsrfToken();
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axios.post(videoVTT, formData, {
    headers: { 'X-Csrftoken': token },
  });
  return data.count ?? 0;
}

async function bulkUpdate(rows: Row[]): Promise<void> {
  const token = await getCsrfToken();
  await axios.patch('/api/annotations/bulk-update', {
    annotations: rows.map(({ id, text, start, end }) => ({
      id,
      text,
      ranges: { start, end },
    })),
  }, {
    headers: { 'X-Csrftoken': token },
  });
}

async function createAnnotation(videoUrl: string, start: string, end: string): Promise<Annotation> {
  const token = await getCsrfToken();
  const { data } = await axios.post<Annotation>('/api/annotations/annotate', {
    uri: videoUrl,
    scope: 'annotation',
    text: '',
    ranges: { start, end },
    start_position: Math.round(vttTimeToSeconds(start) * 1000),
    end_position: Math.round(vttTimeToSeconds(end) * 1000),
    private: false,
    workflow_state: 'published',
  }, {
    headers: { 'X-Csrftoken': token },
  });
  return data;
}

async function bulkDeleteAnnotations(ids: number[]): Promise<{ deleted: number[] }> {
  const token = await getCsrfToken();
  const { data } = await axios.delete('/api/annotations/bulk-delete', {
    headers: { 'X-Csrftoken': token },
    data: { ids },
  });
  return data;
}

function annotationsToRows(annotations: Annotation[]): Row[] {
  return annotations.map(a => ({
    id: a.id,
    start: a.ranges?.start ?? '',
    end: a.ranges?.end ?? '',
    text: a.text,
  }));
}

function vttTimeToSeconds(time: string): number {
  // WebVTT allows both MM:SS.mmm (under an hour) and HH:MM:SS.mmm.
  const match = /^(?:(\d+):)?(\d{2}):(\d{2})(?:\.(\d+))?$/.exec(time);
  if (!match) return 0;
  const [, hours, minutes, seconds, millis] = match;
  return (
    Number(hours ?? 0) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    (millis ? Number(millis.padEnd(3, '0').slice(0, 3)) / 1000 : 0)
  );
}

function secondsToVttTime(totalSeconds: number): string {
  const totalMs = Math.max(0, Math.round(totalSeconds * 1000));
  const ms = totalMs % 1000;
  const totalSecs = Math.floor(totalMs / 1000);
  const s = totalSecs % 60;
  const totalMinutes = Math.floor(totalSecs / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const mmm = String(ms).padStart(3, '0');
  return h > 0 ? `${h}:${mm}:${ss}.${mmm}` : `${mm}:${ss}.${mmm}`;
}

function findRowIndexForTime(rows: Row[], time: number): number {
  const activeIndex = rows.findIndex(
    r => vttTimeToSeconds(r.start) <= time && time < vttTimeToSeconds(r.end)
  );
  if (activeIndex !== -1) return activeIndex;

  let closestIndex = 0;
  for (let i = 0; i < rows.length; i++) {
    if (vttTimeToSeconds(rows[i].start) <= time) closestIndex = i;
    else break;
  }
  return closestIndex;
}

function getPlayerCurrentTime(): number {
  const player = (window as any).player;
  return player && typeof player.currentTime === 'function'
    ? player.currentTime() || 0
    : 0;
}

function pausePlayer(): void {
  const player = (window as any).player;
  if (player && typeof player.pause === 'function') player.pause();
}

function playPlayer(): void {
  const player = (window as any).player;
  if (player && typeof player.play === 'function') player.play();
}

function seekPlayerTo(seconds: number): void {
  const player = (window as any).player;
  if (player && typeof player.currentTime === 'function') player.currentTime(seconds);
}

function reloadCaptions(videoVTT: string): void {
  const trackEl = document.querySelector('video#player track[kind="captions"]') as HTMLTrackElement | null;
  if (!trackEl) return;
  const separator = videoVTT.includes('?') ? '&' : '?';
  trackEl.src = `${videoVTT}${separator}_=${Date.now()}`;
}

const PAGE_SIZE = 100;

export function VideoAnnotationEditor({ videoUrl, videoVTT, inline = false, editUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<GridRowsProp<Row>>([]);
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const apiRef = useGridApiRef();
  const scrollToTime = useRef<number | null>(null);
  const pendingScrollIndex = useRef<number | null>(null);
  const pendingFocusId = useRef<number | null>(null);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: PAGE_SIZE });
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([]);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [draftStart, setDraftStart] = useState('');
  const [draftEnd, setDraftEnd] = useState('');
  const [draftText, setDraftText] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [downloadingVtt, setDownloadingVtt] = useState(false);
  const [uploadingVtt, setUploadingVtt] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedVttFile, setSelectedVttFile] = useState<File | null>(null);
  const vttFileInputRef = useRef<HTMLInputElement>(null);

  const jumpToIndex = (index: number) => {
    pendingScrollIndex.current = index;
    setPaginationModel(prev => ({ ...prev, page: Math.floor(index / PAGE_SIZE) }));
  };

  const openEditor = async () => {
    scrollToTime.current = getPlayerCurrentTime();
    setOpen(true);
    setLoading(true);
    setError(null);
    setStatus(null);
    setDirtyIds(new Set());

    try {
      let anns = await fetchAnnotations(videoUrl);

      if (anns.length === 0) {
        setStatus('Loading captions…');
        await importFromVtt(videoVTT);
        anns = await fetchAnnotations(videoUrl);
        setStatus(null);
      }

      setRows(annotationsToRows(anns));
    } catch {
      setError('Failed to load captions.');
    } finally {
      setLoading(false);
    }
  };

  // Inline mode has no Fab trigger to open the editor, so load captions as soon as it mounts.
  useEffect(() => {
    if (inline) openEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Locate the caption for the video's playback position, then jump the grid
  // to the page that contains it before scrolling — DataGrid's scrollToIndexes
  // only scrolls within whichever page is currently active.
  useEffect(() => {
    if (scrollToTime.current === null || rows.length === 0) return;

    const typedRows = rows as Row[];
    const targetIndex = findRowIndexForTime(typedRows, scrollToTime.current);
    scrollToTime.current = null;
    setActiveRowId(typedRows[targetIndex]?.id ?? null);
    jumpToIndex(targetIndex);
  }, [rows]);

  // Jump to a freshly added caption once it lands in `rows`.
  useEffect(() => {
    if (pendingFocusId.current === null) return;

    const typedRows = rows as Row[];
    const index = typedRows.findIndex(r => r.id === pendingFocusId.current);
    pendingFocusId.current = null;
    if (index === -1) return;

    setActiveRowId(typedRows[index].id);
    jumpToIndex(index);
  }, [rows]);

  useEffect(() => {
    if (pendingScrollIndex.current === null) return;
    const targetIndex = pendingScrollIndex.current;
    pendingScrollIndex.current = null;

    requestAnimationFrame(() => {
      apiRef.current?.scrollToIndexes({ rowIndex: targetIndex });
    });
  }, [paginationModel, apiRef]);

  // Keep the highlighted caption in sync with playback while the editor is open.
  const rowsRef = useRef<Row[]>([]);
  rowsRef.current = rows as Row[];

  const activeRowIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeRowIdRef.current = activeRowId;
  }, [activeRowId]);

  const editingRowRef = useRef<Row | null>(null);
  useEffect(() => {
    editingRowRef.current = editingRow;
  }, [editingRow]);

  useEffect(() => {
    if (!inline && !open) return;

    const player = (window as any).player;
    if (!player || typeof player.on !== 'function') return;

    const handleTimeUpdate = () => {
      const currentRows = rowsRef.current;
      if (currentRows.length === 0) return;
      const index = findRowIndexForTime(currentRows, getPlayerCurrentTime());
      const rowId = currentRows[index]?.id ?? null;

      if (rowId !== activeRowIdRef.current) {
        activeRowIdRef.current = rowId;
        setActiveRowId(rowId);

        if (!editingRowRef.current) {
          jumpToIndex(index);
        }
      }
    };

    player.on('timeupdate', handleTimeUpdate);
    return () => player.off('timeupdate', handleTimeUpdate);
  }, [inline, open]);

  const handleClose = () => {
    if (!saving) setOpen(false);
  };

  const handleEditButtonClick = () => {
    if (editUrl) {
      window.open(editUrl, '_blank', 'noopener,noreferrer');
    } else {
      openEditor();
    }
  };

  const handleEditClick = (row: Row) => () => {
    pausePlayer();
    seekPlayerTo(vttTimeToSeconds(row.start));
    setEditingRow(row);
    setDraftStart(row.start);
    setDraftEnd(row.end);
    setDraftText(row.text);
    setEditError(null);
  };

  const handleEditDialogClose = () => {
    if (savingCaption) return;
    setEditingRow(null);
    playPlayer();
  };

  const handleEditDialogSave = async () => {
    if (!editingRow) return;
    const updated: Row = { ...editingRow, start: draftStart, end: draftEnd, text: draftText };

    setSavingCaption(true);
    setEditError(null);

    try {
      await bulkUpdate([updated]);
      setRows(prev => (prev as Row[]).map(r => (r.id === updated.id ? updated : r)));
      reloadCaptions(videoVTT);
      setEditingRow(null);
      playPlayer();
    } catch {
      setEditError('Failed to save caption.');
    } finally {
      setSavingCaption(false);
    }
  };

  const handleAddCaptionAfter = async (afterRow: Row | null) => {
    setAdding(true);
    setError(null);

    const currentRows = rows as Row[];
    const afterIndex = afterRow ? currentRows.findIndex(r => r.id === afterRow.id) : -1;
    const nextRow = afterIndex !== -1 ? currentRows[afterIndex + 1] : currentRows[0];

    const startSeconds = afterRow ? vttTimeToSeconds(afterRow.end) : getPlayerCurrentTime();
    const maxEnd = nextRow ? vttTimeToSeconds(nextRow.start) : startSeconds + 2;
    const endSeconds = Math.max(startSeconds, Math.min(startSeconds + 2, maxEnd));
    const start = secondsToVttTime(startSeconds);
    const end = secondsToVttTime(endSeconds);

    try {
      const created = await createAnnotation(videoUrl, start, end);
      pendingFocusId.current = created.id;
      setRows(prev => {
        const arr = [...(prev as Row[])];
        const insertAt = afterRow ? arr.findIndex(r => r.id === afterRow.id) + 1 : arr.length;
        arr.splice(insertAt, 0, { id: created.id, start, end, text: '' });
        return arr;
      });
    } catch {
      setError('Failed to add caption.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteSelected = async () => {
    const ids = rowSelectionModel as GridRowId[];
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} caption${ids.length > 1 ? 's' : ''}?`)) return;

    setDeleting(true);
    setError(null);

    try {
      const { deleted } = await bulkDeleteAnnotations(ids as number[]);
      const deletedIds = new Set(deleted);

      setRows(prev => (prev as Row[]).filter(r => !deletedIds.has(r.id)));
      setDirtyIds(prev => {
        const next = new Set(prev);
        deletedIds.forEach(id => next.delete(id));
        return next;
      });
      setActiveRowId(prev => (prev !== null && deletedIds.has(prev) ? null : prev));
      setRowSelectionModel(prev => (prev as GridRowId[]).filter(id => !deletedIds.has(id as number)));
    } catch {
      setError('Failed to delete captions.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'start', headerName: 'Start', width: 140 },
    { field: 'end', headerName: 'End', width: 140 },
    { field: 'text', headerName: 'Text', flex: 1 },
    {
      field: 'actions',
      type: 'actions',
      width: 92,
      getActions: params => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" />}
          label="Edit caption"
          onClick={handleEditClick(params.row as Row)}
        />,
        <GridActionsCellItem
          key="add-after"
          icon={<AddIcon fontSize="small" />}
          label="Add caption after this one"
          onClick={() => handleAddCaptionAfter(params.row as Row)}
          disabled={adding}
        />,
      ],
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const updatedRows = (rows as Row[]).filter(r => dirtyIds.has(r.id));

    try {
      await bulkUpdate(updatedRows);
      setStatus('Saved.');
      setTimeout(
        () => {
          setOpen(false);
          window.location.reload();
        },
        800
      );
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadVtt = async () => {
    setDownloadingVtt(true);
    setError(null);

    try {
      const response = await axios.get(videoVTT, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'captions.vtt';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError('Failed to download VTT.');
    } finally {
      setDownloadingVtt(false);
    }
  };

  const handleUploadVttClick = () => {
    setSelectedVttFile(null);
    setError(null);
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    if (uploadingVtt) return;
    setUploadDialogOpen(false);
    setSelectedVttFile(null);
    if (vttFileInputRef.current) vttFileInputRef.current.value = '';
  };

  const handleVttFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedVttFile(e.target.files?.[0] ?? null);
  };

  const handleUploadVttConfirm = async () => {
    if (!selectedVttFile) return;

    setUploadingVtt(true);
    setError(null);
    setStatus(null);

    try {
      await uploadVttFile(videoVTT, selectedVttFile);
      const anns = await fetchAnnotations(videoUrl);
      setRows(annotationsToRows(anns));
      setDirtyIds(new Set());
      reloadCaptions(videoVTT);
      setStatus('Captions uploaded.');
      setUploadDialogOpen(false);
      setSelectedVttFile(null);
      if (vttFileInputRef.current) vttFileInputRef.current.value = '';
    } catch {
      setError('Failed to upload VTT.');
    } finally {
      setUploadingVtt(false);
    }
  };

  const grid = (
    <DataGrid
      apiRef={apiRef}
      rows={rows}
      columns={columns}
      loading={loading}
      hideFooter={rows.length <= PAGE_SIZE}
      pageSizeOptions={[PAGE_SIZE]}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      density="compact"
      disableRowSelectionOnClick
      checkboxSelection
      rowSelectionModel={rowSelectionModel}
      onRowSelectionModelChange={setRowSelectionModel}
      getRowClassName={params =>
        params.id === activeRowId ? 'current-caption-row' : ''
      }
      sx={{
        border: 0,
        height: inline ? '100%' : '60vh',
        '& .current-caption-row': {
          bgcolor: 'action.selected',
        },
      }}
    />
  );

  const rowActions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {rows.length === 0 && (
        <Button
          onClick={() => handleAddCaptionAfter(null)}
          disabled={adding || saving || loading}
          startIcon={<AddIcon />}
        >
          {adding ? 'Adding…' : 'Add Caption'}
        </Button>
      )}
      {rowSelectionModel.length > 0 && (
        <Button
          onClick={handleDeleteSelected}
          disabled={deleting || saving}
          color="error"
          startIcon={<DeleteIcon />}
        >
          {deleting ? 'Deleting…' : `Delete Selected (${rowSelectionModel.length})`}
        </Button>
      )}
    </Box>
  );

  const editDialog = (
    <Dialog open={editingRow !== null} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Edit Caption
        <IconButton
          aria-label="close"
          onClick={handleEditDialogClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {editError && <Alert severity="error" sx={{ mb: 2 }}>{editError}</Alert>}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <TextField
            label="Start"
            value={draftStart}
            onChange={e => setDraftStart(e.target.value)}
            disabled={savingCaption}
            fullWidth
          />
          <TextField
            label="End"
            value={draftEnd}
            onChange={e => setDraftEnd(e.target.value)}
            disabled={savingCaption}
            fullWidth
          />
        </Box>
        <TextField
          label="Text"
          value={draftText}
          onChange={e => setDraftText(e.target.value)}
          disabled={savingCaption}
          fullWidth
          multiline
          minRows={3}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleEditDialogClose} disabled={savingCaption}>Cancel</Button>
        <Button onClick={handleEditDialogSave} variant="contained" disabled={savingCaption}>
          {savingCaption ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  const uploadVttDialog = (
    <Dialog open={uploadDialogOpen} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Upload VTT
        <IconButton
          aria-label="close"
          onClick={handleUploadDialogClose}
          disabled={uploadingVtt}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Uploading a VTT file will replace all existing captions for this video.
        </Alert>
        <Button component="label" variant="outlined" startIcon={<FileUploadIcon />} disabled={uploadingVtt}>
          {selectedVttFile ? selectedVttFile.name : 'Choose file'}
          <input
            ref={vttFileInputRef}
            type="file"
            accept=".vtt,text/vtt"
            style={{ display: 'none' }}
            onChange={handleVttFileSelected}
          />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleUploadDialogClose} disabled={uploadingVtt}>Close</Button>
        <Button
          onClick={handleUploadVttConfirm}
          variant="contained"
          disabled={!selectedVttFile || uploadingVtt}
        >
          {uploadingVtt ? 'Uploading…' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (inline) {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ flex: '1 1 auto', minHeight: 0 }}>
            {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
            {status && !error && <Alert severity="info" sx={{ m: 2 }}>{status}</Alert>}
            {grid}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderTop: '1px solid', borderColor: 'divider' }}>
            {rowActions}
            <Button
              onClick={handleDownloadVtt}
              disabled={downloadingVtt || loading}
              startIcon={<FileDownloadIcon />}
              sx={{ ml: 'auto' }}
            >
              {downloadingVtt ? 'Downloading…' : 'Download VTT'}
            </Button>
            <Button
              onClick={handleUploadVttClick}
              disabled={uploadingVtt || loading}
              startIcon={<FileUploadIcon />}
            >
              Upload VTT
            </Button>
          </Box>
        </Box>
        {editDialog}
        {uploadVttDialog}
      </>
    );
  }

  return (
    <>
      <Tooltip title="Edit Captions" placement="left">
        <Fab
          color="primary"
          onClick={handleEditButtonClick}
          sx={{ position: 'fixed', bottom: 48, right: 16, zIndex: 100 }}
          aria-label="Edit Captions"
        >
          <EditNoteIcon />
        </Fab>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth keepMounted>
        <DialogTitle sx={{ pr: 6 }}>
          Edit Captions
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'grey.500' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {error && <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>}
          {status && !error && <Alert severity="info" sx={{ m: 2 }}>{status}</Alert>}
          {grid}
        </DialogContent>

        <DialogActions>
          <Box sx={{ mr: 'auto' }}>{rowActions}</Box>
          <Button onClick={handleClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving || loading}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {editDialog}
    </>
  );
}

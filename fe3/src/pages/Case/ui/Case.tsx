/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'
import GlobalStyles from '@mui/material/GlobalStyles'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import DialogContentText from '@mui/material/DialogContentText'
import { red } from '@mui/material/colors'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ShareIcon from '@mui/icons-material/Share'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import AddIcon from '@mui/icons-material/Add'
import HelpIcon from '@mui/icons-material/Help'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import Popover from '@mui/material/Popover'
import Player, { loadKalturaScript, primeKalturaConnections } from 'components/kaltural';
import cls from './Case.module.scss'
import { Comment } from '@mui/icons-material'
import { AlignWidget } from 'widgets/Align'
import Delete from '@mui/icons-material/Delete'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import { styles, globalStyles, accordionStyles, notesStyle } from './styles'
import { CButton, GButton } from './components'
import {
  convertSeconds,
  categorizeByTimeRange,
  getTagPosition,
  insertMarkTag,
  findTextRange,
  timeToSeconds,
  matchTimeFormat,
  matchDigitFormat,
  getSelectionPosition,
  getTextInRange,
  paragraphNumber,
  filtering,
  matomoTag,
} from './helper'
import req from 'shared/lib/req'
import Alert from './Alert'
import { Folders } from 'widgets/Folders'

const FilterInnerItems = ({ name, items = [], onSelect = (item) => {}, onData = (item) => {} }) => {
  const [dialog, setDialog] = useState(-1)
  const handleDeleteRequest = (id) => {
    req.del('annotations/' + id).then(() => {
      window.location.reload()
    })
    setDialog(-1)
  }
  return <>
    {items.map((item, index) => (
      <Accordion
        sx={accordionStyles.sub}
        key={`panel${name}-${item.full_code}-${index}`}
      >
        <AccordionSummary
          expandIcon={item.children && item.children.length && <ExpandMoreIcon />}
          sx={accordionStyles.inner}
        >
          <Typography>{item.full_code} {item.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ 
            padding: '4px 0',
            fontStyle: 'italic',
            weight: 400,
            size: '14px',
            lineHeight: '20px',
          }}>
            {item.description}
          </Typography>
          {(item.list && item.list?.length) ? (
            <div style={{ padding: '4px 0' }}>
              <Typography sx={{ fontSize: '1rem' }}>
                Examples:
              </Typography>
              {item.list.map((list, index) => (
                <div key={item.full_code + name + 'list' + list.id}>
                  {list.workflow_state === 'draft' && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '.8rem' }}>
                      <Typography sx={{ color: '#56788f' }}>
                        Draft
                      </Typography>
                      <div style={{ flex: 1 }} />
                      <Button onClick={() => {
                        onData(list)
                        const element = document.querySelector('.toggle-part')
                        const position = element.getBoundingClientRect().top + document.documentElement.scrollTop - 50
                        scrollTo({
                          behavior: 'smooth',
                          top: position,
                        })
                      }}>Edit</Button>
                      <Button onClick={() => setDialog(list.id)}>Delete</Button>
                      <Alert
                        title="Are you sure?"
                        text="This item will be deleted permanently, are you sure you wish to delete it?"
                        show={dialog === list.id}
                        onOK={() => handleDeleteRequest(list.id)}
                        onCancel={() => setDialog(-1)}
                      />
                    </div>
                  )}
                  <Typography sx={{ padding: '4px 0', fontSize: '1rem' }}>
                    {list.rationale}
                  </Typography>
                  <ul style={{ listStyle: 'circle', listStylePosition: 'inside', cursor: 'pointer' }}>
                    {list.examples.filter((item) => ['video', 'pdf'].includes(item.scope) || (item?.ranges && Object.keys(item.ranges).length)).map((example) => <li key={example.id} onClick={() => onSelect(example)}>
                      {example.scope === 'video'
                        ? `Watch ${convertSeconds(example.start_position)} - ${convertSeconds(example.end_position)}`
                        : (example.scope === 'pdf' ? 'Review Pages' : 'Read Commentary')
                      }
                    </li>)}
                  </ul>
                </div>
              ))}
            </div>
          ) : ''}
        </AccordionDetails>
      </Accordion>
    ))}
  </>
}

const FilterItems = ({ items = [], onSelect = (item) => {}, onData = (item) => {} }) => {
  const [expanded, setExpanded] = useState<string | false>(false)
  const handleChange = (panel) => (_event, isExpanded) => setExpanded(isExpanded ? panel : false)
  return (
    <>
      {items.map((item, index) => (
        <Accordion
          expanded={expanded === `panel${index}`}
          onChange={handleChange(`panel${index}`)}
          sx={accordionStyles.accordion}
          key={`panel${index}`}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={accordionStyles.summary}
          >
            <Typography>{item.name}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: '8px 0 0' }}>
            {item.children && <FilterInnerItems name={index} items={item.children} onSelect={onSelect} onData={onData} />}
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

function Note({ id, name, text, date, framework, edit, video = false, comment = false, all = false, groups = [], onDelete = () => {}, time = null, onHover = { in: () => {}, out: () => {} }, setVideoTime = () => {} }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const [editing, setEditing] = useState(false)
  const [dialog, setDialog] = useState(false)
  const [content, setContent] = useState(text)
  const [checked, setChecked] = useState(false)
  const [start, setStart] = useState(time ? (video ? convertSeconds(time[0]) : time[0]) : '')
  const [end, setEnd] = useState(time ? (video ? convertSeconds(time[1]) : time[1]) : '')
  const [groupInfo, setGroupInfo] = useState({ id: -1, leader: false })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (editing) {
      axios.get('/api/annotations/' + id).then(({ data }) => {
        setChecked(data?.entire_entity)
        if (data?.view_permissions && data?.view_permissions.length) {
          const { group_id, instructor_only } = data.view_permissions[0]
          setGroupInfo({ id: group_id, leader: instructor_only })
        }
        setLoaded(true)
      })
    }
  }, [editing])

  const handleEdit = () => {
    setEditing(true)
    handleMenuClose()
  }
  const handleCancel = () => {
    setEditing(false)
    setContent(text)
  }
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleDelete = () => {
    setDialog(true)
    handleMenuClose()
  }
  const handleSave = () => {
    const data = {
      text: content || text,
      private: groupInfo.id == -1,
    }
    if (video && time) {
      data.start_position = checked ? 0 : timeToSeconds(duration, start || 0, 'Start')
      data.end_position = checked ? duration : timeToSeconds(duration, end || duration, 'End')
    } else if (time) {
      data.entire_entity = checked
      if (!checked) {
        data.start_position = start
        data.end_position = end
      }
    }
    if (groupInfo.id != -1) data.group_id = groupInfo.id
    if (groupInfo.leader) data.instructor_only = groupInfo.leader ? 'True' : 'False'
    req.put('annotations/' + id, data).then(() => {
      if (time) window.location.reload()
    })
    setEditing(false)
  }
  const handleDeleteRequest = () => {
    req.del('annotations/' + id).then(() => {
      window.location.reload()
    })
    onDelete()
    setDialog(false)
  }
  function jump() {
    tempTime = null
    setVideoTime(time[0])
    setTimeout(() => setVideoTime(null))
    const element = document.getElementById('playerContainer')                  
    const position = element.getBoundingClientRect().top + document.documentElement.scrollTop - 50
    scrollTo({
      behavior: 'smooth',
      top: position,
    })
  }
  return (
    <Card onMouseOver={onHover.in} onMouseLeave={onHover.out}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            {name?.charAt(0) || '?'}
          </Avatar>
        }
        action={
          edit && <IconButton aria-label="more" aria-controls="long-menu" aria-haspopup="true" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
        title={name}
        subheader={new Date(date).toLocaleString()}
      />
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted  
        open={Boolean(anchorEl)}  
        onClose={handleMenuClose}  
      >  
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <Alert
          title="Are you sure?"
          text="This note will be deleted permanently, are you sure you wish to delete it?"
          show={dialog}
          onOK={handleDeleteRequest}
        />
      </Menu>
      <CardContent>
        <Grid container>
          <Grid item xs={groups.length ? (comment ? 12 : 6) : 12}>
            {editing ? (
              <TextField
                label="Note Text"
                multiline
                rows={4}
                variant="outlined"
                size="small"
                style={{ width: '100%' }}
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            ) : (
              <Typography variant="p" sx={{ fontFamily: '"DINPro", sans-serif' }}>
                {content || text}
              </Typography>
            )}
            {editing && time && (
              <div>
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={({ target }) => setChecked(target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                    label={'Entire ' + (video ? 'Video' : 'Instructional Materials PDF')}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
                  <TextField
                    label={video ? 'Start Time' : 'From Page'}
                    variant="outlined"
                    size="small"
                    value={start}
                    onChange={({ target }) => setStart(target.value)}
                    disabled={checked}
                    error={video ? matchTimeFormat(start) : matchDigitFormat(start)}
                    helperText={video && 'Enter time (mm:ss)'}
                  />
                  <TextField
                    label={video ? 'End Time' : 'To Page'}
                    variant="outlined"
                    size="small"
                    value={end}
                    onChange={({ target }) => setEnd(target.value)}
                    disabled={checked}
                    error={video ? matchTimeFormat(end) : matchDigitFormat(end)}
                    helperText={video && 'Enter time (mm:ss)'}
                  />
                </div>
              </div>
            )}
            {framework ? <Typography variant="body2" color="text.secondary" sx={{ marginTop: '8px', display: 'block' }}>
              Framework: {framework.name}
            </Typography> : ''}
            {time && <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"DINPro", sans-serif', marginTop: '8px', display: 'block' }}>
              {video && <span style={{ cursor: 'pointer' }} onClick={jump}>{`Time: ${start} - ${end}`}</span>}
              {!video && (!all ? `${start} - ${end}` : 'Entire File')}
            </Typography>}
          </Grid>
          {(editing && groups.length && loaded) ? <Grid item xs={comment ? 12 : 6}>
            <Groups options={groups} init={groupInfo} onChange={(id, leader) => setGroupInfo({ id, leader })} />
          </Grid> : ''}
        </Grid>
      </CardContent>
      {editing && <CardActions>
        <CButton onClick={handleSave}>Publish</CButton>
        <CButton onClick={handleCancel}>Cancel</CButton>
      </CardActions>}
    </Card>
  )
}

function TagForm({ videos, edit = null, onClose = () => {} }) {
  const { id } = useParams();
  const videoTag = { check: false, start: '', end: '' }
  const [videoTags, setVideoTags] = useState([videoTag])
  const handleAdd = () => setVideoTags([...videoTags, videoTag])
  const handleDel = (i) => setVideoTags(videoTags.filter((_, j) => j != i))
  const handleMod = (i, k, v) => setVideoTags(videoTags.map((o, j) => j != i ? o : ({ ...o, [k]: v })))
  //
  const pdfTag = { check: false, start: '', end: '' }
  const [pdfTags, setPdfTags] = useState([pdfTag])
  const handleAddPdf = () => setPdfTags([...pdfTags, pdfTag])
  const handleDelPdf = (i) => setPdfTags(pdfTags.filter((_, j) => j != i))
  const handleModPdf = (i, k, v) => setPdfTags(pdfTags.map((o, j) => j != i ? o : ({ ...o, [k]: v })))
  //
  const [alignOpen, setAlignOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState({})
  //
  const text = { content: '' }
  const [texts, setTexts] = useState([text])
  const handleText = (i, v) => setTexts(texts.map((o, j) => i != j ? o : { content: v }))
  const handleAddText = () => setTexts([...texts, text])
  const handleDelText = (i) => setTexts(texts.filter((_, j) => j != i))
  //
  const [rationale, setRationale] = useState('')
  //
  const [selected, setSelected] = useState(videos.length ? videos[0].url : '')
  useEffect(() => setSelected(videos.length ? videos[0].url : ''), [videos])
  useEffect(() => {
    if (edit) {
      const { id, examples, rationale, alignment } = edit
      setRationale(rationale)
      const videosTags = examples?.filter(({ scope }) => scope === 'video')?.map(({ id, start_position, end_position, entire_entity }) => ({ id, start: convertSeconds(start_position), end: convertSeconds(end_position), check: entire_entity })) || []
      const pdfTags = examples?.filter(({ scope }) => scope === 'pdf')?.map(({ id, start_position, end_position, entire_entity }) => ({ id, start: start_position, end: end_position, check: entire_entity })) || []
      const texts = examples?.filter(({ scope }) => scope === 'text')?.map(({ id, quote }) => ({ id, content: quote })) || []
      if (!videosTags.length) videosTags.push(videoTag)
      if (!pdfTags.length) pdfTags.push(pdfTag)
      if (!texts.length) texts.push(text)
      setVideoTags(videosTags)
      setPdfTags(pdfTags)
      setTexts(texts)
      setSelectedTag(alignment)
    }
  }, [edit])
  const changeVideo = ({ target }) => setSelected(target.value)
  //
  const publish = (isPrivate = false) => {
    const annotations = []
    for (const item of videoTags) {
      if (!item.check && (item.start == '' || item.end == '')) continue
      const start_position = item.check ? 0 : timeToSeconds(duration, item.start || 0, 'Start')
      const end_position = item.check ? duration : timeToSeconds(duration, item.end || duration, 'End')
      const data = {
        scope: 'video',
        uri: selected,
        start_position,
        end_position,
      }
      if (item.id) data.id = item.id
      annotations.push(data)
    }
    for (const item of pdfTags) {
      if (!item.check && (item.start == '' || item.end == '')) continue
      const data = {
        scope: 'pdf',
        uri: annotationUri,
      }
      if (item.check) data.entire_entity = true
      else {
        data.start_position = item.start
        data.end_position = item.end
      }
      if (item.id) data.id = item.id
      annotations.push(data)
    }
    for (const { id, content } of texts) {
      if (!content) continue
      const ranges = findTextRange(fullHtml, content?.trim())
      if (!ranges) return alert('Entered text is not included in commentary')
      const data = {
        scope: 'text',
        uri: annotationUri,
        quote: content,
        start_position: ranges.start.position,
        end_position: ranges.end.position,
        ranges: {
          start: `/p[${ranges.start.paragraph + 1}]`,
          end: `/p[${ranges.end.paragraph + 1}]`,
        },
      }
      if (id) data.id = id
      annotations.push(data)
    }
    const url = edit ? `annotations/${edit.id}` : 'annotations/annotate/standards'
    req[edit ? 'put' : 'post'](url, {
      uri: annotationUri,
      rationale,
      scope: 'standards',
      alignment_tag: edit ? data?.alignment_tag?.full_code : selectedTag?.tag?.value,
      annotations,
      workflow_state: isPrivate ? 'draft' : 'published'
    }).then(() => {
      if (selectedTag?.framework) {
        matomoTag({
          category: 'Resource Interaction',
          action: 'Alignment',
          name: selectedTag.framework,
        })
      }
      window.location.reload()
    })
  }
  
  return (
    <Card sx={{ margin: '16px 0' }}>
      <CardContent>
        <Grid container sx={{ margin: '16px 0' }}>
          <Grid item xs={12}>
            <div>
              <FormControl>
                <FormLabel id="demo-controlled-radio-buttons-group">Video Selection:</FormLabel>
                <RadioGroup
                  row
                  aria-labelledby="demo-row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  value={selected}
                  onChange={changeVideo}
                >
                  {videos.map((item, index) => <FormControlLabel key={item.url} value={item.url} control={<Radio />} label={`Video ${index + 1}`} />)}
                </RadioGroup>
              </FormControl>
            </div>
            {videoTags.map((item, index) => (
              <>
                <div key={index}>
                  <FormControlLabel
                    label="Entire Video"
                    control={
                      <Checkbox
                        checked={item.check}
                        onChange={({ target }) => handleMod(index, 'check', target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                  />
                </div>
                <div key={index} style={{ display: 'flex', gap: '8px', margin: '8px 0', alignItems: 'flex-start' }}>
                  <TextField
                    label="Start time"
                    variant="outlined"
                    size="small"
                    value={item.start}
                    onChange={({ target }) => handleMod(index, 'start', target.value)}
                    disabled={item.check}
                    error={matchTimeFormat(item.start)}
                    helperText="Enter time (mm:ss)"
                  />
                  <TextField
                    label="End time"
                    variant="outlined"
                    size="small"
                    value={item.end}
                    onChange={({ target }) => handleMod(index, 'end', target.value)}
                    disabled={item.check}
                    error={matchTimeFormat(item.end)}
                    helperText="Enter time (mm:ss)"
                  />
                  {videoTags.length > 1 && <IconButton onClick={() => handleDel(index)}>
                    <Delete />
                  </IconButton>}
                </div>
              </>
            ))}
            <div>
              <Button onClick={handleAdd}>+ Add Video Tag</Button>
            </div>
            {pdfTags.map((item, index) => (
              <>
                <div key={index}>
                  <FormControlLabel
                    label="Entire Instructional Materials PDF"
                    control={
                      <Checkbox
                        checked={item.check}
                        onChange={({ target }) => handleModPdf(index, 'check', target.checked)}
                        inputProps={{ 'aria-label': 'controlled' }}
                      />
                    }
                  />
                </div>
                <div key={index} style={{ display: 'flex', gap: '8px', margin: '8px 0', alignItems: 'flex-start' }}>
                  <TextField
                    label="From Page"
                    variant="outlined"
                    size="small"
                    value={item.start}
                    onChange={({ target }) => handleModPdf(index, 'start', target.value)}
                    disabled={item.check}
                    error={matchDigitFormat(item.start) || (item.check && item.start == '')}
                  />
                  <TextField
                    label="To Page"
                    variant="outlined"
                    size="small"
                    value={item.end}
                    onChange={({ target }) => handleModPdf(index, 'end', target.value)}
                    disabled={item.check}
                    error={matchDigitFormat(item.end) || (item.check && item.end == '')}
                  />
                  {pdfTags.length > 1 && <IconButton onClick={() => handleDelPdf(index)}>
                    <Delete />
                  </IconButton>}
                </div>
              </>
            ))}
            <div>
              <Button onClick={handleAddPdf}>+ Add Pages</Button>
            </div>
            {texts.map((item, index) => <div key={index} style={{ display: 'flex', alignItems: 'flex-start' }}>
              <TextField
                multiline
                rows={4}
                variant="outlined"
                size="small"
                style={{ width: '100%', marginBottom: '8px' }}
                value={texts[index].content}
                onChange={({ target }) => handleText(index, target.value)}
              />
              {texts.length > 1 && <IconButton onClick={() => handleDelText(index)}>
                <Delete />
              </IconButton>}
            </div>)}
            <div>
              <Button onClick={handleAddText}>+ Add Selected Commentary</Button>
            </div>
            <TextField
              label="Write Your Rationale"
              multiline
              rows={4}
              variant="outlined"
              size="small"
              style={{ width: '100%', margin: '8px 0' }}
              value={rationale}
              onChange={({ target }) => setRationale(target.value)}
            />
          </Grid>
        </Grid>
        <CButton onClick={() => setAlignOpen(true)}>{selectedTag?.tag?.label || '+ Framework Tag'}</CButton>
        <AlignDialog
          open={alignOpen}
          onClose={() => setAlignOpen(false)}
          onSelect={setSelectedTag}
        />
      </CardContent>
      <CardActions>
        <CButton onClick={() => publish(false)}>Publish</CButton>
        <CButton onClick={() => publish(true)}>Draft</CButton>
        <CButton onClick={onClose}>Cancel</CButton>
      </CardActions>
    </Card>
  )
}

function AlignDialog({ onClose, open, onSelect = (tag) => {} }) {
  const [selected, setSelected] = useState({})
  const handleSelect = () => {
    onSelect(selected)
    onClose()
  }
  return (
    <Dialog onClose={() => onClose(/*selectedValue*/)} open={open}>
      <DialogTitle>Framework Select</DialogTitle>
      <DialogContent>
        <AlignWidget onSelect={setSelected} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSelect} autoFocus>Add Selected Tag</Button>
      </DialogActions>
    </Dialog>
  )
}

function Groups({ options, init = { id: -1, leader: false }, onChange = (item) => {} }) {
  const [selected, setSelected] = useState(!init ? -1 : (init.leader ? init.id + 'l' : init.id))
  const handleClick = (id, leaders = false) => {
    setSelected(leaders ? id + 'l' : id)
    onChange(id, leaders)
  };

  const boxStyles = { padding: '8px', border: '1px solid rgba(0, 0, 0, .2)', cursor: 'pointer' }
  
  return (  
   <div style={{ fontFamily: '"DINPro", sans-serif', padding: '0 8px' }}>
    <Typography style={{ margin: '4px 0' }}>Who Can See this Note</Typography>
    <div
      style={{ background: selected === -1 ? 'rgba(0, 0, 0, .1)' : '', ...boxStyles }}
      onClick={() => handleClick(-1)}  
    >
      Only Me
    </div>  
    <Typography style={{ margin: '4px 0' }}>Share With</Typography>
    {options.map((option, index) => (
      <div key={index} >
        <div 
          style={{ background: selected === option.id ? 'rgba(0, 0, 0, .1)' : '', ...boxStyles }}
          onClick={() => handleClick(option.id)}  
        >  
          {option.title}  
        </div>  
        <div
          style={{ background: selected === (option.id + 'l') ? 'rgba(0, 0, 0, .1)' : '', ...boxStyles, paddingLeft: '32px' }}
          onClick={() => handleClick(option.id, true)}  
        >  
          Group Leaders Only 
        </div>  
      </div>
    ))}  
   </div>  
  )
}

function NoteForm({ uri, video = false, groups = [], onClose = () => {}, type = '' }) {
  const { id } = useParams();
  const [checked, setChecked] = useState(false);
  const [formStart, setFormStart] = useState(video ? convertSeconds(~~loadedPlayer?.currentTime || 0, true) : '');
  const [formEnd, setFormEnd] = useState('');
  const [formText, setFormText] = useState('');
  const [alignOpen, setAlignOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState({});
  const [groupInfo, setGroupInfo] = useState({ id: -1, leader: false });

  const publish = () => {
    const data = {
      uri,
      text: formText,
      alignment_tag: selectedTag?.tag?.value,
      private: groupInfo.id == -1,
    };
    if (video) {
      const start_position = checked ? 0 : timeToSeconds(duration, formStart || 0, 'Start');
      const end_position = checked ? duration : timeToSeconds(duration, formEnd || duration, 'End');
      if (start_position === undefined || start_position === null || end_position === undefined || end_position === null) return;
      if (end_position < start_position) return alert('Start time cannot be greater than end time!');
      data.start_position = start_position;
      data.end_position = end_position;
      data.scope = 'video'
    } else {
      if (checked) data.entire_entity = true;
      else {
        data.start_position = formStart;
        data.end_position = formEnd;
      }
    }
    if (groupInfo.id != -1) data.group_id = groupInfo.id;
    if (groupInfo.leader) data.instructor_only = groupInfo.leader ? 'True' : 'False';

    req.post('annotations/annotate', data).then(() => {
      matomoTag({ category: 'Notes', action: type, name: id });
      if (selectedTag?.framework) {
        matomoTag({
          category: 'Resource Interaction',
          action: 'Alignment',
          name: selectedTag.framework,
        });
      }
      window.location.reload();
    });
  };

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Grid container sx={{ margin: '16px 0' }}>
          <Grid item xs={6}>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    onChange={({ target }) => setChecked(target.checked)}
                    inputProps={{ 'aria-label': 'controlled' }}
                  />
                }
                label={'Entire ' + (video ? 'Video' : 'Instructional Materials PDF')}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
              <TextField
                label={video ? 'Start Time' : 'From Page'}
                variant="outlined"
                size="small"
                value={formStart}
                onChange={({ target }) => setFormStart(target.value)}
                disabled={checked}
                error={video ? matchTimeFormat(formStart) : matchDigitFormat(formStart)}
                helperText={video && 'Enter time (mm:ss)'}
              />
              <TextField
                label={video ? 'End Time' : 'To Page'}
                variant="outlined"
                size="small"
                value={formEnd}
                onChange={({ target }) => setFormEnd(target.value)}
                disabled={checked}
                error={video ? matchTimeFormat(formEnd) : matchDigitFormat(formEnd)}
                helperText={video && 'Enter time (mm:ss)'}
              />
            </div>
            <div>
              <TextField
                label={video ? 'Video Note' : 'Instructional Materials Note'}
                multiline
                rows={4}
                variant="outlined"
                size="small"
                style={{ width: '100%' }}
                value={formText}
                onChange={({ target }) => setFormText(target.value)}
              />
            </div>
          </Grid>
          <Grid item xs={6}>
            <Groups options={groups} onChange={(id, leader) => setGroupInfo({ id, leader })} />
          </Grid>
        </Grid>
        <CButton onClick={() => setAlignOpen(true)}>{selectedTag?.tag?.label || '+ Framework Tag'}</CButton>
        <AlignDialog open={alignOpen} onClose={() => setAlignOpen(false)} onSelect={setSelectedTag} />
      </CardContent>
      <CardActions>
        <CButton
          disabled={!checked && (matchTimeFormat(formEnd) || matchTimeFormat(formStart))}
          onClick={publish}
        >
          {video ? 'Publish' : 'Submit'}
        </CButton>
        <CButton onClick={onClose}>Cancel</CButton>
      </CardActions>
    </Card>
  );
}

const notesByComments = []
let annotationUri
let fullHtml = ''
let quote
let duration = 1000
let tempTime
let isFirstPlay = true
let textRange = {}
let loadedPlayer

export function Case() {
  const { id } = useParams()
  const [value, setValue] = useState(0)
  const handleChange = (_event, newValue) => setValue(newValue)
  const [title, setTitle] = useState('')
  const [abstract, setAbstract] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [entryId, setEntryId] = useState('')
  const [generalSubjects, setGeneralSubjects] = useState([])
  const [grades, setGrades] = useState([])
  const [videos, setVideos] = useState([])
  const [video, setVideo] = useState()
  const [videoAnnotations, setVideoAnnotations] = useState({})
  const [form, setForm] = useState(false)
  const [instruct, setInstruct] = useState(false)
  const [videoTime, setVideoTime] = useState()
  const [groups, setGroups] = useState([])
  const [checkedTag, setCheckedTag] = useState(false)
  const [commentary, setCommentary] = useState('')
  const [commentaryFile, setCommentaryFile] = useState('')
  const [instruction, setInstruction] = useState('')
  const [material, setMaterial] = useState('')
  const [instructionNotes, setInstructionNotes] = useState([])
  const [frameworks, setFrameworks] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedNotes, setSelectedNotes] = useState([])
  const [annotations, setAnnotations] = useState([])
  const [resources, setResources] = useState([])
  const [tagForm, setTagForm] = useState(false)
  const [active, setActive] = useState(-1)
  const [alignOpen, setAlignOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState({})
  const [formStartTag, setFormStartTag] = useState('')
  const [formEndTag, setFormEndTag] = useState('')
  const [formText, setFormText] = useState('')
  const [formTextTag, setFormTextTag] = useState('')
  const [selectedComment, setSelectedComment] = useState(-1)
  const [groupInfo, setGroupInfo] = useState({ id: -1, leader: false })
  const [admin, setAdmin] = useState(false)
  const [canAlign, setCanAlign] = useState(false)
  const [draft, setDraft] = useState(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const openSave = Boolean(anchorEl)
  const [anchorPopover, setAnchorPopover] = useState(null)
  const openPopover = Boolean(anchorPopover)
  const navigate = useNavigate()
  const handleClick = ({ currentTarget }) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  useEffect(() => {
    primeKalturaConnections();
    loadKalturaScript();
  }, []);

  useEffect(() => {
    if (!video && videos?.length) setVideo(videos[0]);
  }, [videos]);
  
  useEffect(() => {
    const styleTag = document.createElement('style')
    styleTag.textContent = styles
    document.head.appendChild(styleTag)
    //
    axios.get('/api/users/v1/profile').then(({ data }) => {
      setAdmin(data?.user?.is_staff)
    })
    axios.get('/api/groups/v1/groups/my').then(({ data }) => {
      setGroups(data.results)
    })
    axios.get('/api/courseware/v1/lessons/' + id).then(({ data }) => {
      const { title, abstract, thumbnail, general_subjects, grades, sections, alignment_tags, annotation_uri, materials: resources } = data
      setTitle(title)
      annotationUri = annotation_uri
      setAbstract(abstract)
      setThumbnail(thumbnail)
      general_subjects && setGeneralSubjects(general_subjects)
      grades && setGrades(grades)
      setEntryId(thumbnail.match(/entry_id\/(.+?)\//)?.[1])
      if (sections && sections.length) {
        setVideos(sections[0].attachments)
        if (sections.length > 1) {
          const html = sections[1].content.replace(/\n/g, '').replace(/&#39;/g, "'")
          fullHtml = html
          setCommentary(html)
          setCommentaryFile(sections[1].attachments[0]?.url)
        }
        if (sections.length > 2) {
          setInstruction(sections[2].content)
          const material = sections[2].attachments[0]?.url
          setMaterial(material)
          if (material) {
            axios.get('/api/annotations?uri=' + material).then(({ data }) => {
              const annotations  = data?.pop()?.annotations || []
              setInstructionNotes(annotations?.filter(({ can_view }) => can_view))
            })
          }
        }
      }
      if (resources && resources.length) {
        setResources(resources)
      }
      //
      var control = document.querySelector('template').querySelector('span')
      const commentary = document.querySelector('.commentary')
      control.addEventListener('pointerdown', oncontroldown, true)
      commentary.onpointerup = (event) => {
        let selection = document.getSelection(), text = selection.toString()
        const { clientX, clientY } = event
        if (!!selection && !!text) {
          let range = selection.getRangeAt(0)
          let rect = range.getBoundingClientRect()
          const boundary = commentary.getBoundingClientRect()
          control.style.top = `calc(${clientY}px - 48px - ${boundary.top}px)`
          control.style.left = `calc(${clientX}px - 20px - ${boundary.left}px)`
          const rangePositions = getSelectionPosition()
          if (rangePositions.startPos.position !== rangePositions.endPos.position)
            textRange = rangePositions
          control['text'] = text
          commentary.appendChild(control)
        }
      }
      matomoTag({ category: 'Resource Interaction', action: 'Overview Courseware', name: id });
      function oncontroldown(event) {
        setActive(-1)
        quote = this.text
        setSelectedComment(paragraphNumber(fullHtml, textRange.startPos.paragraph))
        this.remove()
        document.getSelection().removeAllRanges()
        event.stopPropagation()
      }
      document.onpointerdown = () => {  
        let control = document.querySelector('#control')
        if (control !== null) {
          control.remove()
          document.getSelection().removeAllRanges()
        }
      }
      axios.get('/api/annotations?uri=' + annotationUri).then(({ data }) => {
        data = data?.pop()
        setCanAlign(data?.can_align)
        const annotations  = data?.annotations || []
        setAnnotations(annotations)
        const frameworks = []
        for (const note of annotations) {
          const { alignment_tag, annotations: examples, rationale, workflow_state, id } = note
          if (!alignment_tag) continue
          let index = frameworks.findIndex((item) => item.name === alignment_tag.standard.name)
          if (index < 0) {
            frameworks.push({ ...alignment_tag.standard, children: [] })
            index = frameworks.length - 1
          }
          const indexChild = frameworks[index].children.findIndex((item) => item.name === alignment_tag.name)
          const alignment = { tag: { value: alignment_tag.full_code, label: alignment_tag.name }, area: alignment_tag.name }
          if (indexChild < 0) {
            frameworks[index].children.push({ ...alignment_tag, list: [{ rationale, workflow_state, id, alignment, examples }] })
          } else {
            frameworks[index].children[indexChild].list.push({ rationale, workflow_state, id, alignment, examples })
          }
        }
        setFrameworks(frameworks)
        annotations?.filter((item) => !!item.quote)?.forEach((item) => {
          let paragraph = item.ranges?.start
          if (paragraph) {
            const match = paragraph.match(/\/p\[([1-9]\d*)\]/)
            paragraph = match ? parseInt(match[1], 10) - 1 : 0
          } else {
            paragraph = 0
          }
          paragraph = paragraphNumber(sections[1].content, paragraph)
          if (notesByComments[paragraph]) notesByComments[paragraph].push(item)
          else notesByComments[paragraph] = [item]
        })
        if (sections[0].attachments.length) {
          Promise.all(sections[0].attachments.map((attachment) => axios.get('/api/annotations', { params: { uri: attachment.url } }))).then((results) => {
            const result = {}
            results.forEach(({ data }) => {
              if (data.length) result[data[0].uri] = data[0].annotations
            })
            setVideoAnnotations(result)
            setVideo(sections[0].attachments[0])
          })
        }
      })
    })
  }, [])
  const create = () => {
    const { startPos, endPos } = textRange
    if (!startPos) alert('Unknown position!')
    const data = {
      uri: annotationUri,
      text: formText,
      start_position: startPos.position,
      end_position: endPos.position,
      quote,
      private: groupInfo.id == -1,
      ranges: {
        start: `/p[${startPos.paragraph + 1}]`,
        end: `/p[${endPos.paragraph + 1}]`,
      },
    }
    if (groupInfo.id != -1) data.group_id = groupInfo.id
    if (groupInfo.leader) data.instructor_only = groupInfo.leader ? 'True' : 'False'
    req.post('annotations/annotate', data)
      .then(() => {
        matomoTag({ category: 'Notes', action: 'Commentary Note', name: id })
        window.location.reload()
      })
      .catch(() => {
        textRange = {}
      })
  }
  const highlightText = (item) => {
    if (!item?.ranges?.end) {
      setCommentary(fullHtml)
      return
    }
    const startPara = item.ranges.start.match(/\/p\[([1-9]\d*)\]/)?.[1] || 1
    const endPara = item.ranges.end.match(/\/p\[([1-9]\d*)\]/)?.[1] || 1
    const start = getTagPosition(fullHtml, startPara).startPos
    const end = getTagPosition(fullHtml, endPara).startPos
    setCommentary(insertMarkTag(fullHtml, start + (item.ranges?.startOffset ?? item.start_position) + 5, end + (item.ranges?.endOffset ?? item.end_position) + 5))
  }
  function setVideoNotes() {
    console.log(1, duration, videoAnnotations)
    const range = duration / 100;
    console.log(2, range)
    let notes = filtering(videoAnnotations[(video ?? videos[0])?.url], duration);
    console.log(3, notes)
    notes = categorizeByTimeRange(notes, range);
    console.log(4, notes)
    notes = notes
      ?.filter((item) => item[0] && item[0].start_position != null)
      ?.map((item) => ({ data: item, position: (item[0].start_position / duration) * 100 + '%' }));
    console.log(5, notes)
    setNotes(notes);
  }
  useEffect(() => {
    console.log('changed', videoAnnotations)
    if (!notes.length) setVideoNotes()
  }, [videoAnnotations])

  const handleBack = () => {
    const referrer = document.referrer;
  
    if (referrer) {
      const isInternalReferrer = referrer.includes(window.location.origin);
  
      if (isInternalReferrer) {
        const referrerPath = new URL(referrer).pathname;
        if (referrerPath.includes("/courseware/new") || referrerPath.includes("/groups/new") || referrerPath.includes("/my/new") || referrerPath.includes("/curated-collections/new")) {
          navigate(-1);
          return;
        }
      }
    }
    navigate("/courseware/new");
  };

  return (
    <Box sx={{ width: '100%', padding: '64px 0' }}>
      <GlobalStyles styles={globalStyles} />
      <div style={{ display: 'flex', gap: '8px', height: '70px', backgroundColor: '#fefefe', padding: '0 10% 36px', '@media (maxWidth: 1168px)': { padding: '0 16px' } }}>
        <CButton onClick={handleBack}>
          Back
        </CButton>
        <div style={{ flex: 1 }}></div>
        <Folders ids={['courseware.lesson.' + id]} />
        {admin && <CButton href={`/admin/courseware/lesson/${id}/change/`}>Edit in Admin</CButton>}
      </div>
      <Grid container spacing={2} sx={{ padding: '0 10%', '@media (maxWidth: 1168px)': { padding: '0 16px' } }}>
        <Grid item xs={4}>
          <div className="sidebar">
            <p className="case-id">Case #{id}</p>
            <h1>{title}</h1>
            <div className="description" dangerouslySetInnerHTML={{__html: abstract}}></div>
            <div className="case-fields">
              <div className="case-subjects">
                <h2>TOPICS</h2>
                <dl className="case-field case-field-subjects">
                  {generalSubjects.map((item) => (
                    <dd className="case-field-subject" key={item.slug}>
                      <a href={`/courseware/new/?f.general_subject=${item.slug}`}>{item.name}</a>
                    </dd>
                  ))}
                </dl>
              </div>
              <div className="case-grades">
                <h2>GRADES</h2>
                <ul className="case-field case-field-grades">
                  {grades.map((item) => (
                    <li key={item.code}>
                      <a href={`/courseware/new/?f.grade_codes=${item.code}`}>{item.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <div className="toggle-part">
                <h2 className="toggle-collapse">Frameworks</h2>
                {canAlign && <GButton onClick={() => setTagForm(true)} startIcon={<AddIcon />}>
                  Add Tag
                </GButton>}
              </div>
              {(tagForm || draft) && <TagForm
                videos={videos}
                edit={draft}
                onClose={() => {
                  setDraft(null)
                  setTagForm(false)
                }}
              />}
              <div>
              <FilterItems
                items={frameworks}
                onSelect={(item) => {
                  const { scope, entire_entity, start_position, end_position, uri } = item
                  if (scope === 'video') {
                    if (video.url === uri) {
                      tempTime = null
                      setVideoTime(entire_entity ? 0 : start_position)
                      setTimeout(() => setVideoTime(null))
                    } else {
                      tempTime = entire_entity ? 0 : start_position
                      setVideo(videos.find((item) => item.url === uri))
                    }
                    const element = document.getElementById('playerContainer')                  
                    const position = element.getBoundingClientRect().top + document.documentElement.scrollTop - 50
                    scrollTo({
                      behavior: 'smooth',
                      top: position,
                    })
                  } else if (scope === 'pdf') {
                    open(material, '_blank')
                  } else {
                    highlightText(item)
                    setTimeout(() => {
                      const element = document.querySelector('.commentary mark')
                      const position = element.getBoundingClientRect().top + document.documentElement.scrollTop - 50
                      scrollTo({
                        behavior: 'smooth',
                        top: position,
                      })
                    })
                  }
                }}
                onData={setDraft}
              />
              </div>
            </div>
          </div>
        </Grid>
        <Grid item xs={8}>
          <div style={{ padding: '10px', backgroundColor: '#303e47' }}>
            <div style={{ marginBottom: '8px' }} id="playerContainer">
              {videos.map((item, index) => (
                <Button
                  key={index}
                  variant="contained"
                  sx={{ background: '#56798f', marginRight: '4px', '&.Mui-disabled': { background: '#989fa5' } }}
                  onClick={() => setVideo(videos[index])}
                  disabled={videos[index].title === video?.title}
                >
                  Video {index + 1}
                </Button>
              ))}
            </div>
            <Player
              entryId={(video ?? videos[0])?.url?.match(/entry_id=([^&]+)/)?.[1]}
              onLoad={(data, player) => {
                loadedPlayer = player;
                duration = data.sources.duration;
                setVideoNotes()
                if (tempTime != null) {
                  setVideoTime(tempTime);
                  setTimeout(() => setVideoTime(null));
                }
              }}
              onPlay={() => {
                if (isFirstPlay) {
                  isFirstPlay = false;
                  matomoTag({
                    category: 'Resource Interaction',
                    action: 'Video View',
                    name: (video ?? videos[0])?.title,
                  });
                }
              }}
              onFail={() => {}}
              time={videoTime}
            />
            <div className="hashmarks-ct js-hashmarks-ct">
              <span className="hashmarks-help-text">Click to see Video Notes</span>
              <ul className="list-unstyled hashmarks">
                <li className="hashmark-panel js-hashmark-panel active" data-kaltura-id="1_m64st8go">
                  {notes.map((item, index) => (
                    <div
                      key={index}
                      style={{ left: item.position }}
                      className="hashmark-link js-hashmark tooltip"
                      onClick={() => setSelectedNotes(item.data)}
                    >
                      <span className="tooltiptext">{item.data.length} Video Note{item.data.length > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </li>
              </ul>
              <GButton sx={{ margin: '4px 0' }} onClick={() => setForm(!form)} startIcon={<AddIcon />}>Video Note</GButton>
            </div>
          </div>
          {selectedNotes.length ? (
            <div style={{
              padding: '15px 20px 20px',
              backgroundColor: '#efeff1',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <h4>Video Notes ({selectedNotes.length})</h4>
                <Button onClick={() => setSelectedNotes([])} sx={{ padding: '0' }}>Hide Notes</Button>
              </div>
              {selectedNotes?.filter((item) => item.can_view)?.filter((item) => item.user)?.map((item) => (
                <Note
                  video
                  key={item.id}
                  id={item.id}
                  name={item.user?.first_name ? `${item.user?.first_name} ${item.user?.last_name}` : item.user?.email}
                  text={item.text}
                  date={item.created}
                  framework={item.alignment_tag}
                  edit={item.can_edit}
                  time={[item.start_position, item.end_position]}
                  groups={groups}
                  setVideoTime={setVideoTime}
                />
              ))}
            </div>
          ) : ''}
          {form && (
            <NoteForm
              video
              uri={video.url}
              groups={groups}
              type="Video Note"
              onClose={() => setForm(false)}
            />
          )}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: '4px' }}>
            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Commentary" />
              <Tab label="Instructional Materials" />
              <Tab label="Notes" />
              {!!resources?.length && <Tab label="Resources" />}
            </Tabs>
          </Box>
          <div hidden={value !== 0}>
            <div className="links" style={{ display: 'block' }}>
              <a href={commentaryFile} target="_blank">
                Open Commentary
              </a>
              <Button
                variant="text"
                className="case-link how-to-link"
                startIcon={<HelpIcon />}
                aria-owns={openPopover ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={(event) => setAnchorPopover(event.currentTarget)}
                onMouseLeave={() => setAnchorPopover(null)}
              >
                How to add notes on Commentary
              </Button>
              <Popover
                id="mouse-over-popover"
                sx={{ pointerEvents: 'none' }}
                open={openPopover}
                anchorEl={anchorPopover}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                onClose={() => setAnchorPopover(null)}
                disableRestoreFocus
              >
                <div style={{ padding: '8px' }}>
                  <Typography>1. Select text to annotate and click on note icon.</Typography>
                  <Typography>2. Write a note.</Typography>
                  <Typography>3. Add framework tag if needed.</Typography>
                  <Typography>4. Choose "Only Me" or select group(s) and/or group leader(s) with whom to share the note.</Typography>
                  <Typography>5. Select Publish. A speech bubble icon will appear on the right. Click on icon to open and close note.</Typography>
                </div>
              </Popover>
            </div>
            <div className="commentary">
              {commentary?.match(/<(.+)>.*?<\/\1>/g)?.map((item, index) => {
                if (item.startsWith('<p')) {
                  return (
                    <div key={'paragraph' + index}>
                      <div style={{ flex: 1 }} dangerouslySetInnerHTML={{ __html: item }}></div>
                      <div style={{ flex: (active === index) && notesByComments[active] ? 1 : '', userSelect: 'none' }}>
                        {active === index ? (
                          <div style={{ ...notesStyle, alignItems: 'stretch' }}>
                            {notesByComments[active]?.filter((item) => item.can_view)?.filter((item) => item.user)?.map((item) => (
                              <Note
                                comment
                                key={item.id}
                                id={item.id}
                                name={item.user?.first_name ? `${item.user?.first_name} ${item.user?.last_name}` : item.user?.email}
                                text={item.text} date={item.created}
                                framework={item.alignment_tag}
                                edit={item.can_edit}
                                groups={groups}
                                onHover={{
                                  in(_event) {
                                    highlightText(item)
                                  },
                                  out(_e) {
                                    highlightText()
                                  },
                                }}
                              />
                            ))}
                            {notesByComments[active] ? <Button onClick={() => setActive(-1)}>Hide</Button> : ''}
                            {!notesByComments[active] && <span>No notes yet.</span>}
                          </div>
                        ) : (
                          <div>
                            {(() => {
                              const filtered = notesByComments[index]?.filter((item) => item.can_view && item.user) || []
                              if (!filtered.length) return null

                              return (
                                <>
                                  <IconButton onClick={() => setActive(index)}>
                                    <Comment />
                                  </IconButton>
                                  <span>({filtered.length})</span>
                                </>
                              )
                            })()}
                            {selectedComment === index && (
                              <Card>
                                <CardHeader title="New Commentary Note" />
                                <CardContent>
                                  <TextField
                                    label="Leave a Comment"
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    size="small"
                                    style={{ width: '100%' }}
                                    value={formText}
                                    onChange={({ target }) => setFormText(target.value)}
                                  />
                                  <Groups
                                    options={groups}
                                    init={groupInfo}
                                    onChange={(id, leader) => setGroupInfo({ id, leader })}
                                  />
                                </CardContent>
                                <CardActions>
                                  <CButton onClick={create}>Publish</CButton>
                                  <CButton onClick={() => setSelectedComment(-1)}>Cancel</CButton>
                                </CardActions>
                              </Card>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                return <div key={'heading' + index} dangerouslySetInnerHTML={{__html: item}}></div>
              })}
              <template>
                <span id="control"></span>
              </template>
            </div>
          </div>
          <div hidden={value !== 1}>
            <div className="links">
              <a href={material} target="_blank" className="case-link">
                Open Instructional Materials
              </a>
              <button className="btn btn-link pull-right show-popup-form-button mod-material-note" title="Add a note about Instructional Materials" onClick={() => setInstruct(true)}>
                + Instructional Material Note
              </button>
            </div>
            <div style={{ marginBottom: '16px', fontFamily: '"Poppins", sans-serif' }}>
              {!instruction ? (
                <>
                  <h4>Description of Instructional Materials</h4>
                  <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p>Instructional Materials provide additional context for the case. Teachers submit Instructional Materials that are related to the lesson featured in the video.</p>
                    <p>Instructional Materials may include a range of documents including student work samples, bibliographies, lesson materials, quizzes, and classroom layout maps.</p>
                  </div>
                </>
              ) : <div dangerouslySetInnerHTML={{__html: instruction}} />}
            </div>
            {instruct && (
              <NoteForm
                uri={material}
                groups={groups}
                type="Instructional Materials Note"
                onClose={() => setInstruct(false)}
              />
            )}
            <div style={notesStyle}>
              <h4>Instructional Material Notes ({instructionNotes?.length || 0})</h4>
              {instructionNotes?.map((item) => (
                <Note
                  key={item.id}
                  id={item.id}
                  name={item.user?.first_name ? `${item.user.first_name} ${item.user?.last_name}` : item.user?.email}
                  text={item.text}
                  date={item.created}
                  framework={item.alignment_tag}
                  edit={item.can_edit}
                  time={[item.start_position, item.end_position]}
                  all={item.entire_entity}
                  groups={groups}
                />
              ))}
            </div>
          </div>
          <div hidden={value !== 2}>
            <div style={notesStyle}>
              <h4>Video Notes ({filtering(videoAnnotations[video?.url], duration)?.length || 0})</h4>
              {filtering(videoAnnotations[video?.url], duration)?.map((item) => (
                <Note
                  video
                  key={item.id}
                  id={item.id}
                  name={item.user?.first_name ? `${item.user.first_name} ${item.user?.last_name}` : item.user?.email}
                  text={item.text}
                  date={item.created}
                  framework={item.alignment_tag}
                  edit={false}
                  time={[item.start_position, item.end_position]}
                  setVideoTime={setVideoTime}
                />
              ))}
              <h4>Instructional Material Notes ({instructionNotes?.length || 0})</h4>
              {instructionNotes?.map((item) => (
                <Note
                  key={item.id}
                  id={item.id}
                  name={item.user?.first_name ? `${item.user.first_name} ${item.user?.last_name}` : item.user?.email}
                  text={item.text}
                  date={item.created}
                  framework={item.alignment_tag}
                  edit={false}
                  time={[item.start_position, item.end_position]}
                  all={item.entire_entity}
                />
              ))}
              <h4>Commentary Notes ({annotations?.filter(({ quote }) => !!quote)?.length || 0})</h4>
              {annotations?.filter(({ quote, text }) => !!quote && !!text)?.map((item) => (
                <Note
                  key={item.id}
                  id={item.id}
                  name={item.user?.first_name ? `${item.user.first_name} ${item.user?.last_name}` : item.user?.email}
                  text={item.text}
                  date={item.created}
                  framework={item.alignment_tag}
                  edit={false}
                />
              ))}
            </div>
          </div>
          <div hidden={value !== 3}>
            {resources.map((resource) => <div>
              <article>
                <div className={cls.resourceArticleTitle}>
                  <div style={{ flex: 1 }}>
                    <a href={resource.url} className={cls['enactment-resource-list-item-title']} title={`Download resource ${resource.title}`}>
                      <span className={cls['enactment-resource-list-item-material-type']}>Case Prompts for NB Candidates</span>
                      <span className={cls['enactment-resource-list-item-separator']}> | </span>
                      {resource.title}
                    </a>
                  </div>
                  <div>
                    <a href={resource.url} className={cls['enactment-resource-list-item-download-link']} title={`Download resource ${resource.title}`}>
                      Download <i class="fa fa-file-word-o" aria-hidden="true"></i>
                    </a>
                  </div>
                </div>
                <div className={cls['enactment-resource-list-item-description']} dangerouslySetInnerHTML={{ __html: resource.abstract }} />
              </article>
            </div>)}
          </div>
        </Grid>
      </Grid>
    </Box>
  )
}

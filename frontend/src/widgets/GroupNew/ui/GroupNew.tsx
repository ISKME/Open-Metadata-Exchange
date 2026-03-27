// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Typography, TextField, Button, Modal, Box, Checkbox, FormGroup, FormControlLabel, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import cls from './GroupNew.module.scss';
import { Uploader } from 'components/uploader';
import req from 'shared/lib/req';
import { useDebounce } from 'shared/lib/hooks';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  bgcolor: 'background.paper',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  borderRadius: '6px',
  p: 4,
};

function jsonToReadableText(json) {
  function processValue(value) {
    if (Array.isArray(value)) return value.map(processValue).join(', ');
    else if (typeof value === 'object' && value !== null)
      return Object.entries(value).map(([key, val]) => `${key}: ${processValue(val)}`).join(', ');
    return value;
  }
  return processValue(json);
}

let id = null

export function GroupNew() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState(null);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [checkedEmails, setCheckedEmails] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const inputRef = useRef(null);
  const dataImageRef = useRef('');
  const observer = useRef();
  const containerRef = useRef(null); // Add a reference to the container

  const debouncedSearch = useDebounce(search, 500);

  const fetchMembers = useCallback(async (id, page, query) => {
    try {
      const { data } = await axios.get(`/api/organizations/v1/organizations/${id}/members?user__is_active=true`, {
        params: { page, q: query },
      });
      setList((prevList) => (page === 1 ? data.results.map(({ user }) => user) : [...prevList, ...data.results.map(({ user }) => user)]));
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  }, []);

  useEffect(() => {
    if (id !== null) fetchMembers(id, page, debouncedSearch);
    else axios.get('/api/users/v1/profile').then(({ data }) => {
      id = data?.organization.id;
      if (!id) return;
      fetchMembers(id, page, debouncedSearch);
    });
  }, [page, debouncedSearch, fetchMembers]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0; // Scroll to the top when search term changes
      setPage(1)
    }
  }, [debouncedSearch]);

  const handleCheckboxChange = (event, email) => {
    const { checked } = event.target;
    if (checked) {
      setCheckedEmails([...checkedEmails, email]);
    } else {
      setCheckedEmails(checkedEmails.filter((checkedEmail) => checkedEmail !== email));
    }
  };

  const lastElementRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  function add() {
    setSelectedItems([
      ...list.filter((item) => checkedEmails.includes(item.email)),
      ...text.split(',').map((email) => email.trim()).filter(Boolean),
    ]);
    setOpen(false);
  }

  function removeItem(item) {
    if (item?.email) {
      setSelectedItems(selectedItems.filter((selectedItem) => selectedItem?.email !== item.email));
      setCheckedEmails(checkedEmails.filter((checkedEmail) => checkedEmail !== item.email));
    } else {
      setSelectedItems(selectedItems.filter((selectedItem) => selectedItem !== item));
      setText(text.split(',').filter((email) => email.trim() !== item).join(','));
    }
  }

  function create() {
    req.post('groups/v1/groups', { title, description, group_type: 1, cover }, true)
      .then(({ id }) => {
        alert('Group created successfully!');
        const emails = selectedItems.map((item) => item.email || item);
        req.post(`groups/v1/groups/${id}/members/invite`, { emails })
          .then(() => {
            window.location.href = `/groups/new/${id}`;
          })
          .catch((data) => alert(`Invitation error:\n\n${jsonToReadableText(data)}`));
      })
      .catch((data) => alert(`Creation error:\n\n${jsonToReadableText(data)}`));
  }

  useEffect(() => {
    if (!open) {
      setSearch('')
      setPage(1)
    } else {
      setText(selectedItems.filter((item) => !item?.email).join(', '));
      setCheckedEmails(selectedItems.map((item) => item?.email).filter(Boolean));
    }
  }, [open])

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <div style={{ display: 'flex' }}>
            <Typography style={{ flex: 1 }} id="modal-modal-title" variant="h6" component="h2">
              Add Members
            </Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>
          <TextField
            id="outlined-basic"
            label="Search members of organization"
            variant="outlined"
            sx={{ width: '100%' }}
            value={search}
            onChange={({ target }) => {
              setSearch(target.value);
              setPage(1); // Reset to the first page when search query changes
            }}
          />
          <div ref={containerRef} style={{ maxHeight: '300px', overflowY: 'auto' }}> {/* Add the ref to the container */}
            <FormGroup>
              {list.map((item, index) => (
                <FormControlLabel
                  key={item.id}
                  control={<Checkbox />}
                  label={`${item.first_name} ${item.last_name} <${item.email}>`}
                  checked={checkedEmails.includes(item.email)}
                  onChange={(event) => handleCheckboxChange(event, item.email)}
                  ref={index === list.length - 1 ? lastElementRef : null}
                />
              ))}
            </FormGroup>
          </div>
          <Typography sx={{ margin: '16px 0' }}>
            <b>NOTE:</b> Do not add Students who will be accessing ATLAS cases from within a learning management system
            (e.g., Canvas, Moodle, Blackboard, etc.). Student accounts will be automatically provisioned when students
            access the ATLAS cases from their course.
          </Typography>
          <TextField
            label="Not listed above? Invite by email address, separate emails with a comma."
            multiline
            rows={4}
            sx={{ width: '100%' }}
            value={text}
            onChange={({ target }) => setText(target.value)}
          />
          <hr style={{ margin: '16px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={add}
              sx={{
                marginLeft: '16px',
                padding: '6px 12px',
                borderColor: '#303e48',
                backgroundColor: '#303e48',
                color: '#fad000',
                fontFamily: '"DINPro", sans-serif',
                boxShadow: '0 3px 0 #202c34',
                '&:hover': {
                  borderColor: '#8f9bae',
                  backgroundColor: '#8f9bae',
                  color: '#ffffff',
                  boxShadow: '0 3px 0 #7c8ba2',
                },
              }}
            >
              Add member
            </Button>
          </div>
        </Box>
      </Modal>
      <h1 className={cls['page-title']}>Create Group</h1>
      <Typography>What is the name of your Group?*</Typography>
      <TextField
        label="e.g. 'Teachers as Makers'"
        variant="outlined"
        margin="dense"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{ width: '100%', marginTop: '0' }}
      />
      <Typography>Add a Description*</Typography>
      <TextField
        label="This group's purpose is..."
        variant="outlined"
        margin="dense"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ width: '100%', marginTop: '0' }}
      />
      <Typography>Members</Typography>
      {!selectedItems.length ? (
        <Button variant="contained" sx={{ marginRight: '8px', backgroundColor: '#303E48' }} onClick={() => setOpen(true)}>
          Add Members
        </Button>
      ) : (
        <div>
          <Typography sx={{ display: 'inline' }}>The selected user(s) will be added to this group. </Typography>
          <Button onClick={() => setOpen(true)}>Edit list of members to be added</Button>
          {selectedItems.map((item) => (
            <div key={item?.email || item}>
              <Typography sx={{ display: 'inline', marginTop: '6px' }}>
                {item?.first_name} {item?.last_name} &lt;{item?.email || item}&gt;
              </Typography>
              <IconButton onClick={() => removeItem(item)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
      <Typography variant="caption" sx={{ marginTop: '8px' }}>
        <b>NOTE: </b> Do not add Students who will be accessing ATLAS cases from within a learning management system
        (e.g., Canvas, Moodle, Blackboard, etc.). Student accounts will be automatically provisioned when students
        access the ATLAS cases from their course.
      </Typography>
      <Typography>Group cover image</Typography>
      <Uploader
        text="Upload file"
        init={cover}
        onChange={(newCover) => setCover(newCover)}
        inputRef={inputRef}
        dataImage={dataImageRef}
      />
      <Button variant="contained" sx={{ marginRight: '8px', marginBottom: '32px', backgroundColor: '#303E48' }} onClick={create}>
        Save Changes
      </Button>
    </div>
  );
}

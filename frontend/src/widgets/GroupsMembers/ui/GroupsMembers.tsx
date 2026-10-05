/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from "@mui/material/InputAdornment";
import ClearIcon from "@mui/icons-material/Clear";
import Close from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Table from 'components/table'
import Modal from '@mui/material/Modal';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import req from 'shared/lib/req'

const buttonStyles = {
  border: '1px solid #999',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 400,
  color: 'black !important',
  borderRadius: '2px',
  boxShadow: '1px 1px 3px #ccc',
  background: 'linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)',
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: { xs: '0', sm: '50%' },
  transform: { xs: 'translate(0, -50%)', sm: 'translate(-50%, -50%)' },
  width: { xs: '100%', sm: 600 },
  bgcolor: 'background.paper',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  borderRadius: '6px',
  p: 4,
};

const toolbarStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'stretch',
  gap: '4px',
  backgroundColor: '#efeff0',
  padding: '8px',
}

export function GroupsMembers({ onMembersCountChange = () => {} }) {
  const { id: group_id } = useParams();
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const [checkedEmails, setCheckedEmails] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')

  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalMembers, setOriginalMembers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [count, setCount] = useState(0);

  const [tab, setTab] = useState(0);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [selectedCurrentMembers, setSelectedCurrentMembers] = useState([]);
  const [originalPendingMembers, setOriginalPendingMembers] = useState([]);
  const [selectedPendingMembers, setSelectedPendingMembers] = useState([]);

  const hasCurrentSelection = tab === 0 && selectedCurrentMembers.length > 0;
  const hasPendingSelection = tab === 1 && selectedPendingMembers.length > 0;
  const hasAnyActiveSelection = hasCurrentSelection || hasPendingSelection;

  const handleCheckboxChange = (event, email) => {
    const { checked } = event.target
    if (checked) {
      setCheckedEmails([...checkedEmails, email])
    } else {
      setCheckedEmails(checkedEmails.filter((checkedEmail) => checkedEmail !== email));
    }
  }

  useEffect(() => {
  axios.get(`/api/groups/v1/groups/${group_id}/members/invite`).then(({ data }) => {
    setList(data)
  })
}, [group_id])

  async function add() {
    const extraEmails = text
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const emails = [...checkedEmails, ...extraEmails];

    if (!emails.length) {
      alert('Please select or enter at least one email.');
      return;
    }

    await req.post(`groups/v1/groups/${group_id}/members/invite`, {
      emails,
    });

    setOpen(false);
    setCheckedEmails([]);
    setText('');
    alert('Successfully invited!');

    await fetchMembers();
    await fetchPendingMembers();

    setSelectedCurrentMembers([]);
    setSelectedPendingMembers([]);
  }

  async function fetchMembers(params = {}) {
    try {
      const response = await axios.get(`/api/groups/v1/groups/${group_id}/members`, {
        params: { page, page_size: pageSize, ...params },
      });

      const rows = response.data.results.map(member => ({
        id: member.id,
        name: `${member.user.first_name} ${member.user.last_name}`,
        firstName: member.user.first_name,
        lastName: member.user.last_name,
        email: member.user.email,
        role: member.is_admin ? 'Leader' : 'Member',
        status: 'Approved',
        joined: new Date(member.user.date_joined).toLocaleDateString('en-US'),
      }));

      setMembers(rows);
      setOriginalMembers(rows);
      setCount(response.data.count ?? rows.length);
      onMembersCountChange(response.data.count ?? rows.length);
    } catch (error) {
      console.error('There was an error fetching the members!', error);
    }
  }

  async function fetchPendingMembers() {
    try {
      const { data } = await axios.get(`/api/groups/v1/groups/${group_id}/members/invitations`);

      const rows = (Array.isArray(data) ? data : data?.results || []).map((item) => ({
        id: item.id,
        firstName: item.user?.first_name || '',
        lastName: item.user?.last_name || '',
        email: item.email || item.user?.email || '',
        role: 'Member',
        status: item.status || 'Pending',
        invited: item.timestamp ? new Date(item.timestamp).toLocaleDateString('en-US') : '',
      }));

      setPendingMembers(rows);
      setOriginalPendingMembers(rows);
    } catch (error) {
      console.error('There was an error fetching pending members!', error);
    }
  }

  async function getCsrfHeaders() {
    const { data } = await axios.get('/api/csrf-token');

    return {
      'Content-Type': 'application/json;charset=UTF-8',
      'X-Csrftoken': data.token,
    };
  }

  useEffect(() => {
    setPage(1);
    fetchPendingMembers();
  }, [group_id]);

  useEffect(() => {
    fetchMembers();
  }, [group_id, page, pageSize]);

  const handleMemberModify = async (data) => {
    const isAdmin = data.role === 'Leader';

    try {
      const headers = await getCsrfHeaders();

      await axios.put(`/api/groups/v1/groups/${group_id}/members/${data.id}`, {
        is_admin: isAdmin,
      }, { headers });

      await fetchMembers();
    } catch (error) {
      console.error('Error updating member!', error);
      alert("An error occurred while trying to update the member. Please try again.");
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setMembers(originalMembers);
      setPendingMembers(originalPendingMembers);
      return;
    }

    if (tab === 0) {
      setMembers(originalMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      ));
    } else {
      setPendingMembers(originalPendingMembers.filter(
        (member) =>
          `${member.firstName} ${member.lastName}`.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      ));
    }
  };

  async function remove() {
    if (!confirm('Are you sure you want to remove selected users?')) return;

    try {
      const headers = await getCsrfHeaders();

      if (tab === 0) {
        await axios.delete(`/api/groups/v1/groups/${group_id}/members`, {
          headers,
          data: {
            members: selectedCurrentMembers,
          },
        });

        setSelectedCurrentMembers([]);
        await fetchMembers();
        return;
      }

      if (tab === 1) {
        await Promise.all(
          selectedPendingMembers.map((invitationId) => (
            axios.delete(`/api/groups/v1/groups/${group_id}/members/invitations/${invitationId}`, { headers })
          ))
        );

        setSelectedPendingMembers([]);
        await fetchPendingMembers();
      }
    } catch (error) {
      console.error('Remove failed:', error);
      alert('Error removing selected users.');
    }
  }

  async function reInvite() {
    if (!confirm('Are you sure you want to re-invite selected users?')) return;

    const selectedPendingRows = pendingMembers.filter((member) => (
      selectedPendingMembers.includes(member.id)
    ));

    const emails = selectedPendingRows
      .map(({ email }) => email?.trim())
      .filter(Boolean);

    if (!emails.length) return;

    try {
      await req.post(`groups/v1/groups/${group_id}/members/invite`, {
        emails,
      });

      alert(`Successfully re-invited ${emails.length} user(s).`);

      setSelectedPendingMembers([]);
      await fetchPendingMembers();
    } catch (error) {
      console.error('Re-invite failed:', error);
      alert('Error re-inviting selected users.');
    }
  }

  useEffect(() => {
    if (!open) {
      setSearch('')
      setText('')
    }
  }, [open])

  return (
    <>
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
              <Close />
            </IconButton>
          </div>
          <FormControl fullWidth sx={{ marginTop: '8px' }}>
            <InputLabel shrink htmlFor="members">
              {`Search ${list.length} members of organization`}
            </InputLabel>
            <TextField
              id="members"
              variant="outlined"
              sx={{ width: '100%', marginTop: '16px' }}
              value={search}
              onChange={({ target }) => setSearch(target.value)}
            />
          </FormControl>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <FormGroup>
              {list.filter(({ first_name, last_name, email }) => search.toLowerCase().split(/\s+/).every(word => [first_name, last_name, email].filter(Boolean).join(' ').toLowerCase().includes(word))).map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={<Checkbox />}
                  label={`${item.first_name} ${item.last_name} <${item.email}>`}
                  checked={checkedEmails.includes(item.email)}
                  onChange={(event) => handleCheckboxChange(event, item.email)}
                />
              ))}
            </FormGroup>
          </div>
          <Typography sx={{ margin: '16px 0' }}>
            <b>NOTE:</b>
            Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
            Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
          </Typography>
          <FormControl fullWidth sx={{ marginTop: '8px' }}>
            <InputLabel shrink htmlFor="emails">
              Not listed above? Invite by email address, separate emails with a comma.
            </InputLabel>
            <TextField
              id="emails"
              multiline
              rows={4}
              sx={{ width: '100%', marginTop: '16px' }}
              value={text}
              onChange={({ target }) => setText(target.value)}
            />
          </FormControl>
          <hr style={{ margin: '16px 0' }} />
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => {
              setOpen(false)
              setCheckedEmails([])
            }}>Cancel</Button>
            <Button onClick={add} sx={{
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
      <div style={{ width: '100%', padding: '0 10%' }}>
        <Typography variant="h5">
          Manage Members
        </Typography>
        <Typography sx={{ margin: '16px 0' }}>
          NOTE: Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
          Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
        </Typography>
        <Paper
          elevation={3}
          sx={toolbarStyles}
        >
          <Button style={buttonStyles} onClick={() => setOpen(true)}>Invite</Button>
          <Button style={buttonStyles} disabled={!hasAnyActiveSelection} onClick={remove}>Remove</Button>
          <Button style={buttonStyles} disabled={!hasPendingSelection} onClick={reInvite}>Re-invite</Button>
          <div style={{ flex: 1 }} />
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            className="search"
            size="small"
            sx={{ width:'300px', backgroundColor: 'white', '& input': { height: '30px' } }}
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={() => {
                    setSearchQuery("");
                    setMembers(originalMembers);
                    setPendingMembers(originalPendingMembers);
                  }}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        <Tabs
          value={tab}
          onChange={(_event, newValue) => {
            setTab(newValue);
            setSelectedCurrentMembers([]);
            setSelectedPendingMembers([]);
            setSearchQuery('');
            setMembers(originalMembers);
            setPendingMembers(originalPendingMembers);
          }}
          centered
        >
          <Tab label="Current Members" />
          <Tab label="Pending Members" />
        </Tabs>
        {tab === 0 && (
          <Table
            rows={members}
            headers={[
              { id: 'name', label: 'Name', width: 240 },
              { id: 'email', label: 'Email', width: 240 },
              { id: 'role', label: 'Role', width: 120, edit: true, items: ['Leader', 'Member'] },
              { id: 'status', label: 'Status', width: 120 },
              { id: 'joined', label: 'Joined', width: 180 },
            ]}
            total={count}
            onModify={handleMemberModify}
            onSelectionChanged={({ all, members: selectedIds }) => {
              setSelectedCurrentMembers(all ? members.map((member) => member.id) : selectedIds);
            }}
            onPageChanged={(newPage) => setPage(newPage)}
            onLimitChanged={(limit) => {
              setPageSize(limit);
              setPage(1);
            }}
          />
        )}

        {tab === 1 && (
          <Table
            rows={pendingMembers}
            headers={[
              { id: 'firstName', label: 'First name', width: 120 },
              { id: 'lastName', label: 'Last name', width: 120 },
              { id: 'email', label: 'Email', width: 220 },
              { id: 'role', label: 'Role', width: 120 },
              { id: 'status', label: 'Status', width: 120 },
              { id: 'invited', label: 'Invited', width: 140 },
            ]}
            edit={false}
            total={pendingMembers.length}
            onSelectionChanged={({ all, members }) => {
              if (all) {
                setSelectedPendingMembers(pendingMembers.map((member) => member.id));
              } else {
                setSelectedPendingMembers(members);
              }
            }}
          />
        )}
      </div>
    </>
  );
}

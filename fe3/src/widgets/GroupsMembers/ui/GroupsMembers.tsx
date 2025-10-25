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
import { styled } from '@mui/material/styles';
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
import { TableEdit } from 'widgets/TableEdit';
import Table from 'components/table'
import Modal from '@mui/material/Modal';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import cls from './GroupsMembers.module.scss';
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
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
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

const editModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '1px solid rgba(0, 0, 0, 0.2)',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
  borderRadius: '6px',
  p: 4,
};

export function GroupsMembers() {
  const { id } = useParams()
  const [open, setOpen] = useState(false)
  const [list, setList] = useState([])
  const [checkedEmails, setCheckedEmails] = useState([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')

  const [editOpen, setEditOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [originalMembers, setOriginalMembers] = useState([]);
  const { id: group_id } = useParams();

  const handleCheckboxChange = (event, email) => {
    const { checked } = event.target
    if (checked) {
      setCheckedEmails([...checkedEmails, email])
    } else {
      setCheckedEmails(checkedEmails.filter((checkedEmail) => checkedEmail !== email));
    }
  }

  useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  useEffect(() => {
    axios.get(`/api/groups/v1/groups/${id}/members/invite`).then(({ data }) => {
      setList(data)
    })
  }, [])

  async function add() {
    const extraEmails = text.split(',').map((item) => item.trim()).filter(i => i != '')
    await req.post(`groups/v1/groups/${id}/members/invite`, {
      emails: [...checkedEmails, ...extraEmails]
    })
    setOpen(false)
    setCheckedEmails([])
    alert('Successfully invited!')
  }

  function fetchMembers() {
    // Fetch members from the backend API
    axios.get(`/api/groups/v1/groups/${group_id}/members`)
      .then((response) => {
        const members = response.data.results.map(member => ({
          id: member.id,
          name: `${member.user.first_name} ${member.user.last_name}`,
          firstName: member.user.first_name,
          lastName: member.user.last_name,
          email: member.user.email,
          role: member.is_admin ? 'Leader' : 'Member',
          status: 'Approved',
          joined: new Date(member.user.date_joined).toLocaleDateString('en-US'),
        }));
        setMembers(members);
        setOriginalMembers(members); // Save the original list
      })
      .catch((error) => {
        console.error('There was an error fetching the members!', error);
      });
  }

  useEffect(() => {
    fetchMembers()
  }, [group_id]);

  const handleDeleteMember = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      const { data } = await axios.get('/api/csrf-token');
      const headers = { 'Content-Type': 'application/json;charset=UTF-8', 'X-Csrftoken': data.token };
      await axios.delete(`/api/groups/v1/groups/${group_id}/members/${userId}`, { headers });

      // Update members list after successful deletion
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== userId));
    } catch (error) {
      console.error('Error deleting member!', error);
      alert("An error occurred while trying to delete the member. Please try again.");
    }
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedMember) return;
    const isAdmin = selectedMember.role === 'Admin';

    try {
      const { data } = await axios.get('/api/csrf-token');
      const headers = { 'Content-Type': 'application/json;charset=UTF-8', 'X-Csrftoken': data.token };
      await axios.put(`/api/groups/v1/groups/${group_id}/members/${selectedMember.id}`, {
        is_admin: isAdmin
      }, { headers });

      // Update members list after successful edit
      setMembers((prevMembers) => prevMembers.map((member) => (
        member.id === selectedMember.id ? { ...member, role: selectedMember.role } : member
      )));
      setEditOpen(false);
    } catch (error) {
      console.error('Error updating member!', error);
      alert("An error occurred while trying to update the member. Please try again.");
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setMembers(originalMembers); // Reset to the original list
    } else {
      const filteredMembers = originalMembers.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      );
      setMembers(filteredMembers);
    }
  };

  function remove() {
    if (!confirm('Are you sure you want to remove selected users?')) return
    req.del(`groups/v1/groups/${id}/members`, {
      members: selectedMembers // members?.filter((item) => selectedMembers.includes(item.id))?.map(({ email }) => email),
    }).then(() => fetchMembers())
  }

  async function reInvite() { // new api needed
    if (!confirm('Are you sure you want to re-invite selected users?')) return
    await req.post(`groups/v1/groups/${id}/members/invite`, {
      emails: members?.filter((item) => selectedMembers.includes(item.id))?.map(({ email }) => email?.trim())
    })
    alert('Successfully re-invited!')
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
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={editModalStyle}>
          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <Typography style={{ flex: 1 }} id="edit-modal-title" variant="h6" component="h2">
              Edit User
            </Typography>
            <IconButton onClick={() => setEditOpen(false)}>
              <Close />
            </IconButton>
          </div>
          <Box className={cls.editModal}>
          {selectedMember && (
            <>
              <FormControl fullWidth sx={{ marginTop: '8px' }}>
                <InputLabel shrink htmlFor="first-name" sx={{ marginLeft: '-8px' }}>
                  First name
                </InputLabel>
                <TextField
                  id="first-name"
                  value={selectedMember.firstName}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: '8px' }}>
                <InputLabel shrink htmlFor="last-name" sx={{ marginLeft: '-8px' }}>
                  Last name
                </InputLabel>
                <TextField
                  id="last-name"
                  value={selectedMember.lastName}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: '8px' }}>
                <InputLabel shrink htmlFor="email" sx={{ marginLeft: '-8px' }}>
                Email
                </InputLabel>
                <TextField
                  id="email"
                  value={selectedMember.email}
                  fullWidth
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </FormControl>
              <FormControl fullWidth sx={{ marginTop: '8px' }}>
                <InputLabel shrink htmlFor="role" sx={{ marginLeft: '-8px' }}>
                  Role
                </InputLabel>
                <TextField
                  id="role"
                  className={cls.select}
                  value={selectedMember.role}
                  onChange={(e) => setSelectedMember({ ...selectedMember, role: e.target.value })}
                  fullWidth
                  margin="normal"
                  select
                  SelectProps={{ native: true }}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Leader</option>
                </TextField>
              </FormControl>
              <Box mt={3} display="flex" justifyContent="flex-end" gap={1} className={cls.buttonsGroup}>
                <Button onClick={() => setEditOpen(false)} className={cls.cancel}>Cancel</Button>
                <Button onClick={handleEditSave} variant="contained" color="primary" className={cls.primary}>
                  Save
                </Button>
              </Box>
            </>
          )}
        </Box>
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
          <Button style={buttonStyles} disabled={!selectedMembers.length} onClick={remove}>Remove</Button>
          <Button style={buttonStyles} disabled={!selectedMembers.length} onClick={reInvite}>Re-invite</Button>
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
                  <IconButton onClick={() =>
                    { setSearchQuery("");
                    setMembers(originalMembers)
                  }}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Paper>
        <TableEdit
          records={members}
          headers={[
            { field: 'name', headerName: 'Name', width: 240 },
            { field: 'email', headerName: 'Email', width: 240 },
            { field: 'role', headerName: 'Role', width: 120 },
            { field: 'status', headerName: 'Status', width: 120 },
            { field: 'joined', headerName: 'Joined', width: 180 },
          ]}
          onDelete={handleDeleteMember}
          onEdit={handleEditMember}
          onSelect={setSelectedMembers}
        />
        {/* <Table
          rows={members}
          headers={[
            { id: 'firstName', label: 'Name', width: 240, edit: true },
            { id: 'lastName', label: 'Last Name', width: 240, edit: true },
            { id: 'email', label: 'Email', width: 240, edit: true },
            { id: 'role', label: 'Role', width: 120, edit: true, items: ['Admin', 'Member'] },
            { id: 'status', label: 'Status', width: 120 },
            { id: 'joined', label: 'Joined', width: 180 },
          ]}
        /> */}
      </div>
    </>
  );
}

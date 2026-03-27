/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import { Search } from '@mui/icons-material';
import cls from './OrgansUsers.module.scss';
import Table from 'components/table'
import req from 'shared/lib/req'
import { OrgansUsersImport } from 'widgets/OrgansUsersImport';

function jsonToReadableText(json) {
  function processValue(value) {
    if (Array.isArray(value))
      return value.map(processValue).join(', ')
    else if (typeof value === 'object' && value !== null)
      return Object.entries(value).map(([key, val]) => `${isNaN(key) ? key + ': ' : ''} ${processValue(val)}`).join(', ')
    return value
  }
  return processValue(json)
}

const buttonStyles = {
  border: '1px solid #999',
  cursor: 'pointer',
  fontSize: '0.88em',
  color: 'black !important',
  borderRadius: '2px',
  boxShadow: '1px 1px 3px #ccc',
  background: 'linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)',
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
}

const paperStyle = {
  display: 'flex',
  gap: '4px',
  backgroundColor: '#efeff0',
  alignItems: 'center',
  padding: '8px',
}

const headers = [
  { id: 'firstName', label: 'First name', width: '107px', edit: true },
  { id: 'lastName', label: 'Last name', width: '107px', edit: true },
  { id: 'email', label: 'Email', width: '145px' },
  { id: 'role', label: 'Role', width: '80px', edit: true, items: [] },
  { id: 'status', label: 'Status', width: '66px' },
  { id: 'joined', label: 'Joined', type: 'date', width: '85px' },
  { id: 'lastLogin', label: 'Last login', type: 'date', width: '80px' },
]

let roleChoices = {}
let statusChoices = {}

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

export function OrgansUsers({ id }) {
  const [members, setMembers] = useState([])
  const [pendingMembers, setPendingMembers] = useState([])
  const [selected, setSelected] = useState({ all: false, members: [] })
  const [pendingSelected, setPendingSelected] = useState([])
  const [organizations, setOrganizations] = useState([])
  const [organization, setOrganization] = useState()
  const [moveModal, setMoveModal] = useState(false)
  const [pendingPageSize, setPendingPageSize] = useState(25)
  const [pageSize, setPageSize] = useState(25)
  const [loading, setLoading] = useState(true)
  const [admin, setAdmin] = useState(false)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [pendingCount, setPendingCount] = useState(0)
  const [count, setCount] = useState(0)
  const [pendingPage, setPendingPage] = useState(1)
  const [page, setPage] = useState(1)
  const [term, setTerm] = useState('')
  const [name, setName] = useState('')
  const [last, setLast] = useState('')
  const [mail, setMail] = useState('')
  const [role, setRole] = useState()
  const [tab, setTab] = useState(0)
  const [importPage, setImportPage] = useState(false)
  const [sortBy, setSortBy] = useState('user__first_name')
  const [sortDir, setSortDir] = useState('asc')
  const sortFieldMap = {
    firstName: 'user__first_name',
    lastName: 'user__last_name',
    email: 'user__email',
    joined: 'user__date_joined',
    lastLogin: 'user__last_login'
  };

  const fetchMembers = async (params = {}) => {
    try {
      const response = await axios.get(`/api/organizations/v1/organizations/${id}/members`, {
          params: {
              ...params,
              page_size: pageSize,
              ordering: `${sortDir === 'asc' ? '' : '-'}${sortBy}`
          }
      });

      if (response.data.results?.length) {
          const { role_choices, status_choices } = response.data.results[0];
          roleChoices = role_choices;
          statusChoices = status_choices;
          headers[3].items = Object.values(role_choices);

          const formattedMembers = response.data.results.map(member => ({
          id: member.id,
          firstName: member.user.first_name,
          lastName: member.user.last_name,
          email: member.user.email,
          role: member.role,
          status: member.status,
          joined: member.user?.date_joined && new Date(member.user.date_joined),
          lastLogin: member.user?.last_login && new Date(member.user.last_login),
        }));

        setMembers(formattedMembers);
      } else {
        setMembers([]);
      }
      setCount(response.data.count);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingMembers = async (params = {}) => {
    try {
      const { data } = await axios.get(`/api/organizations/v2/organizations/${id}/invitations`, { params: { ...params, page_size: pendingPageSize } })
      setPendingMembers(data?.results?.map(({ id, email, first_name, last_name, role_display, timestamp }, index) => ({
        id,
        email,
        first_name,
        last_name,
        role_display,
        timestamp: new Date(timestamp),
      })) || [])
      setPendingCount(data?.count)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  useEffect(() => {
    if (!modal) {
      setName('')
      setLast('')
      setMail('')
      setRole()
    }
  }, [modal])

  useEffect(() => {
    axios.get(`/api/organizations/v1/organizations/${id}/members/move`).then(({ data }) => {
      setOrganizations(data)
    })
    axios.get('/api/users/v1/profile').then(({ data }) => {
      if (data?.user?.is_staff || data?.user?.is_superuser) setAdmin(true)
    })
  }, [])

  function onModify(data) {
    const role = getKeyByValue(roleChoices, data.role);
    const status = getKeyByValue(statusChoices, data.status);
    req.put(`organizations/v1/organizations/${id}/members/${data.id}/update`, {
      user: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
      },
      role,
      status,
    })
      .then(() => {
        setMembers((prevMembers) => prevMembers.map((member) => member.id === data.id ? {
          ...member,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
          status: data.status,
        } : member));
      })
      .catch((error) => {
        console.error('Error modifying user:', error);
      });
  }

  function add() {
    req.post(`organizations/v2/organizations/${id}/members/invite`, {
      email: mail,
      first_name: name,
      last_name: last,
      role: role,
    }, true)
    .then((data) => {
      alert(`Successful:\n\n${jsonToReadableText(data)}`)
      window.location.reload()
    })
    .catch((data) => alert(`Creation error:\n\n${jsonToReadableText(data)}`))
    .finally(() => {
      setModal(false)
      window.location.reload()
    })
  }

  function move() {
    let data = {}
    if (!selected.all) data = { members: selected.members }
    else data = { members: ['all'], exclude: selected.members }
    req.post(`organizations/v1/organizations/${id}/members/move?q=${term}`, {
      ...data,
      organization,
    })
    .then(() => alert('Moved successfully!'))
    .catch(() => {})
    .finally(() => {
      setMoveModal(false)
      window.location.reload()
    })
  }

  function deactivate() {
    let data = {}
    if (!selected.all) data = { members: selected.members }
    else data = { members: ['all'], exclude: selected.members }
    req.put(`organizations/v1/organizations/${id}/members/deactivate?q=${term}`, data).then(() => {
      window.location.reload()
      // setMembers(members.map((item) => {
      //   if (!selected.includes(item.id)) return item
      //   return ({ ...item, status: 'Inactive' })
      // }))
    })
  }

  function handleSearch() {
    setSearch(term)
    setPage(1)
    fetchMembers({ q: term })
    fetchPendingMembers({ q: term })
  }

  useEffect(handleSearch, [pageSize, pendingPageSize])

  useEffect(() => {
    fetchMembers({
        q: search,
        page: page,
        page_size: pageSize,
        ordering: `${sortDir === 'asc' ? '' : '-'}${sortBy}`
    });
  }, [sortBy, sortDir, page, pageSize]);

  function exportMembers() {
    axios.get('/api/csrf-token').then(({ data }) => {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `/api/organizations/v1/organizations/${id}/members/export?q=${term}`;

      const csrf = document.createElement('input');
      csrf.type = 'hidden';
      csrf.name = 'csrfmiddlewaretoken';
      csrf.value = data.token;
      form.appendChild(csrf);

      // const rows = tab === 0 ? selected : pendingSelected

      if (selected.all) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'member';
        input.value = 'all';
        form.appendChild(input);
        selected.members.forEach(member => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'exclude';
          input.value = member;
          form.appendChild(input);
        })
      } else {
        selected.members.forEach(member => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'member';
          input.value = member;
          form.appendChild(input);
        })
      }

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    })
  }

  function reInvite() {
    const users = pendingMembers.filter(({ id }) => pendingSelected.includes(id)).map(({ email }) => email)
    req.post(`organizations/v1/organizations/${id}/members/invite`, {
      users: users.join(','),
      message: ''
    }, true).then(({ errors }) => {
      if (errors && errors?.length) alert('Error!\n' + errors.join('\n'))
      else alert(`Success! You have re-invited ${users.length} users.`)
    })
  }

  async function handlePendingDelete() {
    if (!window.confirm(`Delete ${pendingSelected.length} pending user(s)?`)) return;

    try {
      const { data } = await axios.get('/api/csrf-token');
      const headers = {
        'Content-Type': 'application/json',
        'X-Csrftoken': data.token
      };

      await Promise.all(
        pendingSelected.map(_id =>
          axios.delete(`/api/organizations/v2/organizations/${id}/invitations/${_id}`, { headers })
        )
      );

      alert('Deleted successfully');
      fetchPendingMembers();
      setPendingSelected([]);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Error deleting pending users.');
    }
  }


  function onSortChanged({ dir, by }) {
    const orderingField = sortFieldMap[by] || by;
    const newSortDir = dir === 'asc' ? 'asc' : 'desc';

    setSortBy(orderingField);
    setSortDir(newSortDir);
}

  function onPageChanged(newPage) {
    setPage(newPage);
  }

  function onLimitChanged(limit) {
    setPageSize(limit);
    setPage(1);
  }

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  const active = selected.all || (!selected.all && !!selected.members.length)

  return (
    <>
      <Modal open={modal} onClose={() => setModal(false)}>
        <Box sx={modalStyle}>
          <TextField
            fullWidth
            label="First Name"
            value={name}
            onChange={({ target }) => setName(target.value)}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={last}
            onChange={({ target }) => setLast(target.value)}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Email"
            value={mail}
            onChange={({ target }) => setMail(target.value)}
            margin="normal"
            size="small"
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Organization role</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={role}
              label="Organization role"
              size="small"
              onChange={({ target }) => setRole(target.value)}
            >
              {Object.entries(roleChoices).map(([key, val]) => (
                <MenuItem key={key} value={key}>{val}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className={cls.modalFooter}>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setModal(false)}>
                Cancel
              </Button>
              <Button onClick={add}>
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Modal open={moveModal} onClose={() => setMoveModal(false)}>
        <Box sx={modalStyle}>
          <Typography sx={{ marginBottom: '16px' }}>
            Warning: Users will be deleted from all of his groups
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label-1">New organization</InputLabel>
            <Select
              labelId="demo-simple-select-label-1"
              id="demo-simple-select-1"
              value={organization}
              label="New organization"
              onChange={({ target }) => setOrganization(target.value)}
            >
              {organizations.map((item) => (
                <MenuItem value={item.id}>{item.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box className={cls.modalFooter}>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setMoveModal(false)}>
                Cancel
              </Button>
              <Button onClick={move}>
                Move
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      {importPage && <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '920px' }}>
        <OrgansUsersImport id={id} onCancel={() => setImportPage(false)} />
      </div>}
      {!importPage && <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '920px' }}>
        <Typography component="div" variant="h5">
          Users
        </Typography>
        <Typography>
          <b>NOTE: </b>
          Do not add Students who will be accessing ATLAS cases from within a learning management system (e.g., Canvas, Moodle, Blackboard, etc.).
          Student accounts will be automatically provisioned when students access the ATLAS cases from their course.
        </Typography>
        {tab === 1 && (<Paper
          elevation={3}
          sx={paperStyle}
        >
          {/* <Button style={buttonStyles} disabled={!pendingSelected.length} onClick={exportMembers}>Export</Button> */}
          <Button style={buttonStyles} disabled={!pendingSelected.length} onClick={reInvite}>Re-invite</Button>
          <Button
            style={buttonStyles}
            disabled={!pendingSelected.length}
            onClick={handlePendingDelete}
          >
            Delete
          </Button>
          <TextField
            id="outlined-search"
            label="Search"
            variant="outlined"
            size="small"
            value={term}
            onChange={({ target }) => setTerm(target.value)}
            sx={{ flex: 1, backgroundColor: 'white', height: '100%' }}
            onKeyUp={event => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <IconButton style={buttonStyles} onClick={handleSearch}>
            <Search />
          </IconButton>
        </Paper>)}
        {tab === 0 && (<Paper
          elevation={3}
          sx={paperStyle}
        >
          <Button sx={buttonStyles} onClick={() => setModal(true)}>New</Button>
          <Button style={buttonStyles} disabled={!active} onClick={deactivate}>Deactivate</Button>
          <Button sx={buttonStyles} onClick={() => setImportPage(true)}>Import</Button>
          <Button style={buttonStyles} disabled={!active} onClick={exportMembers}>Export</Button>
          {admin && <Button style={buttonStyles} disabled={!active} onClick={() => setMoveModal(true)}>Move</Button>}
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            size="small"
            value={term}
            onChange={({ target }) => setTerm(target.value)}
            sx={{ flex: 1, backgroundColor: 'white', height: '100%' }}
            onKeyUp={event => {
              if (event.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <IconButton style={buttonStyles} onClick={handleSearch}>
            <Search />
          </IconButton>
        </Paper>)}
        <Tabs value={tab} onChange={(_event, newValue) => setTab(newValue)} centered sx={{ paddingLeft: '0' }}>
          <Tab label="Current Members" />
          <Tab label="Pending Members" />
        </Tabs>
        {tab === 1 && (<>
          <Table
            rows={pendingMembers}
            headers={[
              { id: 'first_name', label: 'First name', width: 89 },
              { id: 'last_name', label: 'Last name', width: 89 },
              { id: 'email', label: 'Email', width: 130 },
              { id: 'role_display', label: 'Role', width: 70 },
              { id: 'timestamp', label: 'Invited', type: 'date', width: 170 },
            ]}
            edit={false}
            total={pendingCount}
            onSelectionChanged={({ all, members }) => {
              if (all) {
                setPendingSelected(pendingMembers.map((member) => member.id))
              } else {
                setPendingSelected(members)
              }
            }}
            onPageChanged={(page) => {
              setPendingPage(page)
              fetchPendingMembers({ q: search, page })
            }}
            onLimitChanged={(limit) => {
              setPendingPageSize(limit)
            }}
          />
        </>)}
        {tab === 0 && (<>
          <Table
            rows={members}
            headers={headers}
            total={count}
            onPageChanged={onPageChanged}
            onLimitChanged={onLimitChanged}
            onModify={onModify}
            onSelectionChanged={setSelected}
            onSortChanged={onSortChanged}
          />
        </>)}
      </div>}
    </>
  );
}

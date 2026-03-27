import React, { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Modal,
  Box,
  Checkbox,
  FormControlLabel,
  TablePagination,
} from "@mui/material";
import axios from "axios";
import cls from "./TableEdit.module.scss";

const buttonStyles = {
  border: "1px solid #999",
  cursor: "pointer",
  fontSize: "0.88em",
  color: "black !important",
  borderRadius: "2px",
  boxShadow: "1px 1px 3px #ccc",
  background: "linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)",
  height: "40px",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 480,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

export const TableEdit = ({
  headers = [],
  records = [],
  toolbar = false,
  orgId = null,
  isGetLeaders = false,
  updatedLeadersCallback = () => {},
  onDelete = null,
  onEdit = null,
  onSelect = (ids) => {}
}) => {
  const [rows, setRows] = useState(records);
  const [displayedRows, setDisplayedRows] = useState(records);
  const [csrfToken, setCsrfToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState({
    id: null,
    title: "",
    description: "",
    leaders: [],
  });
  const [selected, setSelected] = useState([]);
  const [leaders, setLeaders] = useState([]);
  const [groupID, setGroupID] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    setRows(records);
    setDisplayedRows(records);
  }, [records]);

  useEffect(() => {
    if (!isGetLeaders) return;
    axios.get("/api/csrf-token/").then((response) => {
      setCsrfToken(response.data.token);
    });

    axios.get(`/api/organizations/v1/organizations/leaders?organization=${orgId}`)
    .then((response) => {
      const filteredLeaders = (response.data?.leaders_list || []).filter(
        (leader) => leader.full_name && leader.full_name.trim() !== ""
      );
      setLeaders(filteredLeaders);
    });
  }, []);

  useEffect(() => onSelect(selected), [selected])

  useEffect(() => {
    const sortedRows = [...rows];
    if (sortConfig.key) {
      sortedRows.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "leaders") {
          const getFirstValidLeaderName = (leaderArray) => {
            const validLeader = leaderArray.find(
              (leader) => leader.full_name && leader.full_name.trim() !== ""
            );
            return validLeader ? validLeader.full_name.toLowerCase() : "";
          };
          aValue = getFirstValidLeaderName(a[sortConfig.key]);
          bValue = getFirstValidLeaderName(b[sortConfig.key]);
        } else if (sortConfig.key === "joined") {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else {
          aValue = aValue ? String(aValue).toLowerCase() : "";
          bValue = bValue ? String(bValue).toLowerCase() : "";
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    setDisplayedRows(
      sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    );
  }, [rows, page, rowsPerPage, sortConfig]);

  const handleOpenModal = (
    group = { id: null, title: "", description: "", leaders: [] }
  ) => {
    setGroupID(group.id);
    const groupLeaders = Array.isArray(group.leaders)
      ? group.leaders.map((leader) => leader.id)
      : [];
    setCurrentGroup({ ...group, leaders: groupLeaders });

    const sortedLeaders = [...leaders].sort((a, b) => {
      return (
        Number(groupLeaders.includes(b.id)) -
        Number(groupLeaders.includes(a.id))
      );
    });

    setLeaders(sortedLeaders);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentGroup({ id: null, title: "", description: "", leaders: [] });
  };

  const handleSaveGroup = async () => {
    try {
      if (currentGroup.id) {
        const groupData = { ...currentGroup };
        // @ts-ignore
        delete groupData.cover;
        await axios
          .put(`/api/groups/v1/groups/${currentGroup.id}`, groupData, {
            headers: { "X-CSRFToken": csrfToken },
          })
          .then(() => updatedLeadersCallback());
      } else {
        await axios
          .post(`/api/groups/v1/groups`, currentGroup, {
            headers: { "X-CSRFToken": csrfToken },
          })
          .then(() => updatedLeadersCallback());
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleLeaderChange = (leaderId) => {
    setCurrentGroup((prevGroup) => {
      const isLeaderSelected = prevGroup.leaders.includes(leaderId);
      const updatedLeaders = isLeaderSelected
        ? prevGroup.leaders.filter((id) => id !== leaderId)
        : [...prevGroup.leaders, leaderId];
      return { ...prevGroup, leaders: updatedLeaders };
    });
  };

  const handleDeleteClick = async (id) => {

    if (onDelete) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error("Error deleting member with onDelete:", error);
      }
    } else {
      if (!window.confirm("Are you sure you want to delete this group?")) return;
      try {
        await axios
          .delete(`/api/groups/v1/groups/${id}`, {
            headers: { "X-CSRFToken": csrfToken },
          })
          .then(() => updatedLeadersCallback());
      } catch (error) {
        console.error(`Failed to delete group with id ${id}:`, error);
      }
    }
  };

  const handleEditClick = (record) => {
    if (onEdit) {
      onEdit(record);
    } else {
      handleOpenModal(record);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
    const filteredRows = rows.filter((row) =>
      row.title.toLowerCase().includes(value)
    );
    setDisplayedRows(filteredRows);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div>
      {toolbar && (
        <div style={{ display: "flex", marginBottom: "10px" }}>
          <TextField
            id="search-bar"
            label="Search"
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={handleSearchChange}
            sx={{ marginRight: "10px", width: "300px" }}
            InputProps={{
              endAdornment: searchValue && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      setSearchValue("");
                      setDisplayedRows(rows);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={buttonStyles}
          >
            New Group
          </Button>
        </div>
      )}
      <table className={cls.table}>
        <thead>
          <tr>
            {!toolbar && <th style={{ padding: 0, width: '50px' }}>
              <Checkbox
                checked={selected.length ? selected.reduce((a, b) => a && b, true) : false}
                indeterminate={selected.length && selected.length !== displayedRows.length}
                onChange={({ target }) => setSelected(target.checked ? displayedRows.map(({ id }) => id) : [])}
                sx={{ backgroundColor: "white", margin: "0 4px" }}
              />
            </th>}
            {headers.map((header) => (
              <th
                key={header.field}
                onClick={() => handleSort(header.field)}
                style={{ cursor: "pointer", fontSize: '14px' }}
                title="Click to sort"
              >
                {header.headerName}
                <span
                  style={{
                    marginLeft: "5px",
                    color: sortConfig.key === header.field ? "black" : "#ccc",
                  }}
                >
                  {sortConfig.key === header.field
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : "↓"
                    : "↑↓"}
                </span>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedRows.map((row) => (
            <tr key={row.id}>
              {!toolbar && (
                <td>
                  <Checkbox
                    checked={selected.includes(row.id)}
                    onChange={() => {
                      if (selected.includes(row.id)) {
                        setSelected(selected.filter((id) => id !== row.id))
                      } else {
                        setSelected([...selected, row.id])
                      }
                    }}
                  />
                </td>
              )}
              {headers.map((header) => (
                <td key={header.field} style={{ fontSize: '14px' }}>
                  {header.field === "title" ? (
                    <Link href={`/groups/new/${row.id}`} rel="noopener">
                      {row[header.field]}
                    </Link>
                  ) : header.field === "leaders" ? (
                    row[header.field]
                      .filter(
                        (leader) => leader.full_name && leader.full_name.trim() !== ""
                      )
                      .map((leader) => leader.full_name)
                      .join(", ")
                  ) : header.field === "cases" ? (
                    row[header.field] || 0
                  ) : (
                    row[header.field]
                  )}
                </td>
              ))}
              <td className={cls.buttons}>
                <IconButton onClick={() => handleEditClick(row)}>
                  <EditIcon />
                </IconButton>
                {toolbar && <IconButton onClick={() => handleDeleteClick(row.id)}>
                  <DeleteIcon />
                </IconButton>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination
        component="div"
        count={rows.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[25, 50, 100]}
        labelRowsPerPage="Rows per page"
      />

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle} className={cls.leadersModal}>
          <TextField
            fullWidth
            label="Group Name"
            value={currentGroup.title}
            onChange={(e) =>
              setCurrentGroup({ ...currentGroup, title: e.target.value })
            }
            margin="normal"
            multiline
          />
          <TextField
            fullWidth
            label="Group Description"
            value={currentGroup.description}
            onChange={(e) =>
              setCurrentGroup({ ...currentGroup, description: e.target.value })
            }
            margin="normal"
            multiline
          />
          <Box mt={2}>
            <h4>Group Leader(s)*</h4>
            <Box className={cls.leadersList}>
              {leaders.map((leader) => (
                <FormControlLabel
                  key={leader.id}
                  control={
                    <Checkbox
                      checked={currentGroup.leaders.includes(leader.id)}
                      onChange={() => handleLeaderChange(leader.id)}
                    />
                  }
                  label={leader.full_name}
                />
              ))}
            </Box>
          </Box>
          <Box className={cls.modalFooter}>
            <Link href={`/groups/new/${groupID}?settings=true`} rel="noopener">
              Open in Edit Mode
            </Link>
            <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={handleCloseModal} className={cls.cancelButton}>
                Cancel
              </Button>
              <Button onClick={handleSaveGroup} className={cls.saveButton}>
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

import { useState } from 'react'
import { Table, TableContainer, TableBody, TableCell, TableHead, TableRow, TableSortLabel, TablePagination, Checkbox, Box, Paper, IconButton, Select, MenuItem } from '@mui/material'
import { Edit, Save, Cancel } from '@mui/icons-material'
import { visuallyHidden } from '@mui/utils'

const EnhancedTableHead = ({
  headers,
  onSelectAllClick,
  order,
  all = false,
  edit = true,
  indeterminate = false,
  onRequestSort = (id) => {}
}) => (
  <TableHead>
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          color="primary"
          checked={all}
          indeterminate={indeterminate}
          onChange={onSelectAllClick}
          inputProps={{ 'aria-label': 'select all items' }}
        />
      </TableCell>
      {headers.map((headCell) => (
        <TableCell
          key={headCell.id}
          sx={{ p: '12px 0', maxWidth: headCell.width, minWidth: !headCell.items ? 'unset' : headCell.width }}
          sortDirection={order.by === headCell.id ? order.dir : false}
        >
           <TableSortLabel
            active={order.by === headCell.id}
            direction={order.by === headCell.id ? order.dir : 'asc'}
            onClick={() => onRequestSort(headCell.id)}
          >
            {headCell.label}
            {order.by === headCell.id ? (
              <Box component="span" sx={visuallyHidden}>
                {order.dir === 'desc' ? 'sorted descending' : 'sorted ascending'}
              </Box>
            ) : null}
          </TableSortLabel>
        </TableCell>
      ))}
      {edit && <TableCell align="right" sx={{ p: '12px', minWidth: '48px' }}>Edit</TableCell>}
    </TableRow>
  </TableHead>
)

export default function EnhancedTable({
  headers,
  rows = [],
  total = 0,
  edit = true,
  onPageChanged = (page) => {},
  onLimitChanged = (limit) => {},
  onModify = (data) => {},
  onSelectionChanged = (info) => {},
  onSortChanged = (order) => {},
}) {
  const [selected, setSelected] = useState([])
  const [unselect, setUnselect] = useState([])
  const [all, setAll] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [editRowId, setEditRowId] = useState(null)
  const [editRowData, setEditRowData] = useState({})
  const [order, setOrder] = useState({ dir: 'asc', by: 'firstName' })

  const handleSelectAllClick = ({ target }) => {
    const all = target.checked
    setSelected(all ? rows.map((n) => n.id) : [])
    setUnselect([])
    setAll(all)
    onSelectionChanged({ all, members: [] })
  }

  const handleRequestSort = (property) => {
    const isAsc = order.by === property && order.dir === 'asc'
    const newOrder = { dir: isAsc ? 'desc' : 'asc', by: property }
    setOrder(newOrder)
    onSortChanged(newOrder)
  }

  const handleClick = (id) => {
    if (all) {
      const members = unselect.includes(id) ? unselect.filter((item) => item !== id) : [...unselect, id]
      setUnselect(members)
      onSelectionChanged({ all: true, members })
    } else {
      const index = selected.indexOf(id)
      let members = []
      if (index === -1) {
        members = members.concat(selected, id)
      } else if (index === 0) {
        members = members.concat(selected.slice(1))
      } else if (index === selected.length - 1) {
        members = members.concat(selected.slice(0, -1))
      } else if (index > 0) {
        members = members.concat(selected.slice(0, index), selected.slice(index + 1))
      }
      setSelected(members)
      onSelectionChanged({ all: false, members })
    }
  }

  const handleEditClick = (id, row) => {
    setEditRowId(id)
    setEditRowData(row)
  }

  const handleSaveClick = () => {
    onModify(editRowData)
    setEditRowId(null)
  }

  const handleCancelClick = () => {
    setEditRowId(null)
    setEditRowData({})
  }

  const handleSelectChange = (event, headerId) => {
    setEditRowData({
      ...editRowData,
      [headerId]: event.target.value,
    })
  }

  const isSelected = (id) => {
    if (all) {
      return !unselect.includes(id)
    }
    return selected.includes(id)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
    onPageChanged(newPage + 1)
  }

  const handleChangeRowsPerPage = (event) => {
    const limit = parseInt(event.target.value, 10)
    setRowsPerPage(limit)
    onLimitChanged(limit)
    setPage(0)
  }

  const indeterminate = (all && unselect.length > 0) || (!all && selected.length > 0)

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <EnhancedTableHead
              headers={headers}
              all={all}
              edit={edit}
              onSelectAllClick={handleSelectAllClick}
              indeterminate={indeterminate}
              order={order}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(row.id)
                const labelId = `enhanced-table-checkbox-${index}`
                const isEditing = editRowId === row.id

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{ 'aria-labelledby': labelId }}
                        onClick={() => handleClick(row.id)}
                      />
                    </TableCell>
                    {headers.map((header, index) => (
                      <TableCell key={`${header.id}-${row.id}`} sx={{ p: isEditing ? 0 : '12px 0 11px 0', maxWidth: header.width, minWidth: header.width, overflowWrap: 'break-word' }}>
                        {isEditing && header.edit ? (
                        header.items?.length ? (
                          <Select
                            value={editRowData[header.id]}
                            onChange={(event) => handleSelectChange(event, header.id)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: '80px' }}
                          >
                            {header.items.map((item) => (
                              <MenuItem key={item} value={item}>
                                {item}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <input
                            value={editRowData[header.id] || ''}
                            onChange={(e) =>
                              setEditRowData((prev) => ({ ...prev, [header.id]: e.target.value }))
                            }
                            style={{ width: '100%', padding: '6px', fontSize: '0.875rem' }}
                          />
                        )
                        ) : (
                          header.type === 'date' ? row[header.id]?.toLocaleDateString() : row[header.id]
                        )}
                      </TableCell>
                    ))}
                    {edit && <TableCell padding="none">
                      {isEditing ? (
                        <>
                          <IconButton onClick={handleSaveClick} size="small">
                            <Save />
                          </IconButton>
                          <IconButton onClick={handleCancelClick} size="small">
                            <Cancel />
                          </IconButton>
                        </>
                      ) : (
                        <IconButton onClick={() => handleEditClick(row.id, row)} size="small" sx={{ ml: '24px' }}>
                          <Edit />
                        </IconButton>
                      )}
                    </TableCell>}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100, 500]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  )
}

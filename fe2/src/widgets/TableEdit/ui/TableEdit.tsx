/* eslint-disable no-param-reassign */
/* eslint-disable react/prop-types */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import cls from './TableEdit.module.scss';

let i = 1000;
const randomId = () => i++;

const buttonStyles = {
  border: '1px solid #999',
  cursor: 'pointer',
  fontSize: '0.88em',
  color: 'black !important',
  borderRadius: '2px',
  boxShadow: '1px 1px 3px #ccc',
  background: 'linear-gradient(top, #fff 0%, #f3f3f3 89%, #f9f9f9 100%)',
  height: '40px',
};

function EditGroupsToolbar(props) {
  const { setRows, setRowModesModel } = props;
  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [...oldRows, {
      id, name: '', age: '', isNew: true,
    }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };
  return (
    <GridToolbarContainer sx={{ backgroundColor: '#f8f8f8', borderBottom: '1px solid #e7e7e7', paddingBottom: '4px' }}>
      <TextField id="outlined-basic" label="Search" variant="outlined" size="small" sx={{ width: '65%', backgroundColor: 'white' }} />
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick} sx={buttonStyles}>
        New
      </Button>
    </GridToolbarContainer>
  );
}

export const TableEdit = ({ headers = [], records = [], selection = false, toolbar = false }) => {
  const [rows, setRows] = React.useState(records);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };
  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };
  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };
  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));
  };
  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow!.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const columns = [
    ...headers,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const props = toolbar ? {
    slots: {
      toolbar: EditGroupsToolbar,
    },
    slotProps: {
      toolbar: { setRows, setRowModesModel },
    },
  } : {};

  return (
    <DataGrid
      rows={rows}
      columns={columns}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      checkboxSelection={selection}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 25,
          },
        },
      }}
      pageSizeOptions={[25, 50, 100]}
      getRowHeight={() => 'auto'}
      showCellVerticalBorder
      density="compact"
      {...props}
    />
  );
};

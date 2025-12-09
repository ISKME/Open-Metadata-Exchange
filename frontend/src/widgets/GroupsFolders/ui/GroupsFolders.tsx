/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import cls from './GroupsFolders.module.scss';
import req from 'shared/lib/req'
import {SimpleTreeView} from './SimpleTreeView'
import {CasesList} from '../../CasesList/ui/CasesList'
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { useSearchParams } from 'react-router-dom';
import { casesSlice } from 'pages/Cases/model/slice/CasesSlice';

export function GroupsFolders({ content }) {
  const { id: groupId } = useParams();
  const dispatch = useAppDispatch();
  const [folders, setFolders] = React.useState([]);
  const [folderId, setFolderId] = React.useState(null);
  const [subFolderId, setSubFolderId] = React.useState(null);
  const [id, setId] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [openRename, setOpenRename] = React.useState(false);
  const [name, setName] = React.useState('');
  const [isSubfolder, setIsSubfolder] = React.useState(false);
  const [newSubfolderTitle, setNewSubfolderTitle] = React.useState('');
  const [openAddSubfolder, setOpenAddSubfolder] = React.useState(false);
  const [isGroup, setIsGroup] = React.useState(false);
  const [csrfToken, setCsrfToken] = React.useState("");
  const [check, setCheck] = React.useState([]);
  const [selectedFolderIsDefault, setSelectedFolderIsDefault] = React.useState(false);

  const { cases, count, pages, sorts, order } = useAppSelector((state) => state.CasesSlice);
  let [searchParams, setSearchParams] = useSearchParams();
  const [defaultPage, setDefaultPage] = React.useState(() => {
    const page = parseInt(new URLSearchParams(window.location.search).get("page"), 10);
    return isNaN(page) ? 1 : page;
  });
  let filters = searchParams.get('filters')
  if (filters) filters = JSON.parse(filters)
  else filters = {}

  React.useEffect(() => {
    get(groupId)
  }, []);

  React.useEffect(() => {
    axios
      .get("/api/csrf-token/")
      .then((response) => {
        setCsrfToken(response.data.token);
      })
      .catch((error) => {
        console.error("Failed to fetch CSRF token", error);
      });
  }, []);

  function get(groupId) {
    axios.get(`/api/groups/v1/groups/${groupId}/folders`)
    .then(({ data }) => {
      const folders = data?.results || [];
      setFolders(folders.map(item => ({
        ...item,
        root: true,
      })));
      setName('');
      setId(null);
      setOpen(false);
      setOpenRename(false);
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
    })
  }

  function del(isSubfolder) {
    const url = isSubfolder
      ? `groups/v1/groups/${groupId}/folders/${id.split('_')[0]}/subfolders/${id.split('_')[1]}`
      : `groups/v1/groups/${groupId}/folders/${id}`;

    req.del(url)
      .then(() => {
        get(groupId)
      })
      .catch((error) => {
        console.error('Delete failed:', error);
      });
  }

  function rename(isSubfolder) {
    const url = isSubfolder
      ? `groups/v1/groups/${groupId}/folders/${id.split('_')[0]}/subfolders/${id.split('_')[1]}`
      : `groups/v1/groups/${groupId}/folders/${id}`;

    req.put(url, {
      title: name,
    })
      .then(() => {
        get(groupId)
      })
      .catch((error) => {
        console.error('Rename failed:', error);
      });
  }

  const handleCreateSubfolder = () => {
    const parentFolderId = isGroup ? groupId : id;
    if (!parentFolderId) {
      console.error('Parent folder not found');
      return;
    }
    const parentContentTypeId = isGroup ? content : folders.find(folder => folder.id === id)?.content_type_id;
    if (!parentContentTypeId) {
      console.error('Parent folder does not have a content_type_id');
      return;
    }

    if (newSubfolderTitle) {
      const parent = `${parentContentTypeId}.${parentFolderId}`;
      const targetTitle = newSubfolderTitle;

      req.post('myitems/v1/save-widget/save/', { parent, target_title: targetTitle })
        .then(response => {
          console.log('Subfolder created successfully:', response);
          setNewSubfolderTitle('');
          setOpenAddSubfolder(false);
          get(groupId);
          setCheck([]);
        })
        .catch(error => {
          console.error('Failed to create subfolder:', error);
        });
    } else {
      console.error('Subfolder title is required');
    }
  };

  const updateCasesData = (caseIds) => {
    const data = [...cases];
    dispatch(casesSlice.actions.updateCases({
      items: data.filter((c) => !caseIds.includes(c.id))
    }));
  };

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
  };

  const handleRemoveItems = async (items, ) => {
    if (!folderId) {
      window.alert("Please select a folder from which you want to delete the cases.");
      return;
    }

    const payload = {
      item_ids: items,
      folderId: folderId,
      subfolderId: subFolderId,
      modelType: "groups",
    };

    try {
      const response = await axios.delete("/api/myitems/v1/remove-items-from-folders/", {
        data: payload,
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      updateCasesData(items);
      get(groupId);
      setCheck([]);
      console.log("Items removed:", response.data);
    } catch (error) {
      console.error("Error removing items:", error);
    }
  };

  const getSelectedItem = (is_default) => {
    setSelectedFolderIsDefault(is_default)
  }
  return (
    <>
        <Modal open={openAddSubfolder} onClose={() => setOpenAddSubfolder(false)}>
          <Box sx={modalStyle}>
            <Typography variant="h6" component="h2">
              Enter the title for the new {isGroup ? 'folder' : 'subfolder'}.
            </Typography>
            <Box className={cls.modalInput}>
            <TextField
              label={isGroup ? 'Folder Title' : 'Subfolder Title'}
              variant="outlined"
              margin="dense"
              value={newSubfolderTitle}
              onChange={(e) => setNewSubfolderTitle(e.target.value)}
            />
            </Box>
            <Box className={cls.buttonsGroup}>
              <button onClick={() => setOpenAddSubfolder(false)}  className={cls.cancel}>Cancel</button>
              <button onClick={() => handleCreateSubfolder()} className={cls.primary}>Create</button>
            </Box>
          </Box>
        </Modal>

        <Modal open={openRename} onClose={() => setOpenRename(false)}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant="h6" component="h2">
              Enter a new name for the {isSubfolder ? 'subfolder' : 'folder'}.
            </Typography>
            <Box className={cls.modalInput}>
            <TextField
              label="New Title"
              variant="outlined"
              margin="dense"
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
            </Box>
            <Box className={cls.buttonsGroup}>
              <button onClick={() => setOpenRename(false)}  className={cls.cancel}>Cancel</button>
              <button onClick={() => rename(isSubfolder)} className={cls.primary}>Confirm</button>
            </Box>
          </Box>
        </Modal>

        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={{ ...modalStyle }}>
            <Typography variant="h6" component="h2">
              Are you sure you want to delete this {isSubfolder ? 'subfolder' : 'folder'}?
              <br />
              All its contents will be permanently removed.
            </Typography>
            <hr />
            <Box className={cls.buttonsGroup}>
              <button onClick={() => setOpen(false)}  className={cls.cancel}>Cancel</button>
              <button onClick={() => del(isSubfolder)} className={cls.primary}>Confirm</button>
            </Box>
          </Box>
        </Modal>

      <Grid container spacing={2} sx={{ padding: '0 10%' }}>
        <Grid item xs={4}>
          <SimpleTreeView
            folders={folders}
            setFolderId={setFolderId}
            setSubFolderId={setSubFolderId}
            groupId={groupId}
            setId={setId}
            setName={setName}
            setOpenRename={setOpenRename}
            setOpen={setOpen}
            getSelectedItem={getSelectedItem}
            subfolderCallback={(bool)=>setIsSubfolder(bool)}
            openAddSubfolderCallback={(bool, isGroup) => {
              setOpenAddSubfolder(bool);
              setIsGroup(isGroup);
            }}
            setDefaultPage={setDefaultPage}
          />
        </Grid>
        <Grid item xs={8}>
          <CasesList
              data={cases}
               defaultPage={defaultPage}
               groupId={groupId}
               folderId={folderId}
               subFolderId={subFolderId}
               setDefaultPage={setDefaultPage}
               sorts={sorts}
               order={order}
               pages={pages}
               count={count}
               handleRemoveItems={handleRemoveItems}
               updateCasesData={updateCasesData}
               get={get}
               selectedFolderIsDefault={selectedFolderIsDefault}
               pageName={'group'}
               setCheck={setCheck}
               check={check}
          />
        </Grid>
      </Grid>
    </>
  );
}

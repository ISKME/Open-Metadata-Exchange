/* eslint-disable react/prop-types */
/* eslint-disable max-len */
/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import * as React from 'react';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import cls from 'widgets/GroupsFolders/ui/GroupsFolders.module.scss';
import req from 'shared/lib/req'
import { SimpleTreeView } from 'widgets/GroupsFolders/ui/SimpleTreeView'
import { MyItemsList } from 'widgets/MyItemsList'
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { useSearchParams } from 'react-router-dom';
import { itemsSlice } from '../model/slice/ItemsSlice';

export function MyItems() {
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

  const { items, count, pages } = useAppSelector((state) => state.ItemsSlice);
  let [searchParams, setSearchParams] = useSearchParams();
  const [defaultPage, setDefaultPage] = React.useState(() => {
    const page = parseInt(new URLSearchParams(window.location.search).get("page"), 10);
    return isNaN(page) ? 1 : page;
  });
  let filters = searchParams.get('filters')
  if (filters) filters = JSON.parse(filters)
  else filters = {}

  React.useEffect(() => {
    get()
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

  function get() {
    axios.get('/api/myitems/v1/save-widget/reload/')
    .then(({ data }) => {
      const folders = data?.user_folders || [];
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
      ? `myitems/v1/folders/${id.split('_')[0]}/subfolders/${id.split('_')[1]}`
      : `myitems/v1/folders/${id}`;
      
    req.del(url)
      .then(() => {
        get()
      })
      .catch((error) => {
        console.error('Delete failed:', error);
      });
  }
  
  function rename(isSubfolder) {
    const url = isSubfolder
      ? `myitems/v1/folders/${id.split('_')[0]}/subfolders/${id.split('_')[1]}`
      : `myitems/v1/folders/${id}`;
  
    req.put(url, { title: name, name })
      .then(() => {
        get()
      })
      .catch((error) => {
        console.error('Rename failed:', error);
      });
  }
  
  const handleCreateSubfolder = async () => {
    if (!newSubfolderTitle.trim()) {
      console.error('Folder title is required');
      return;
    }
  
    const parentFolderId = id;
    const parentContentTypeId = folders.find(folder => folder.id === id)?.content_type_id;
    const data = {
      target_title: newSubfolderTitle,
      ...(parentFolderId && parentContentTypeId && { parent: `${parentContentTypeId}.${parentFolderId}` })
    };
  
    try {
      const response = await req.post('myitems/v1/save-widget/save/', data);
      console.log(`${parentFolderId ? 'Subfolder' : 'Folder'} created successfully:`, response);
      
      setNewSubfolderTitle('');
      setOpenAddSubfolder(false);
      get();
      setCheck([]);
    } catch (error) {
      console.error(`Failed to create ${parentFolderId ? 'subfolder' : 'folder'}:`, error);
    }
  };

  const updateCasesData = (caseIds) => {
    const data = [...items];
    dispatch(itemsSlice.actions.updateItems({ 
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
      modelType: "myitems",
    };
  
    try {
      const response = await axios.delete("/api/myitems/v1/remove-items-from-folders/", {
        data: payload,
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      updateCasesData(items);
      get();
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

      <Grid container spacing={2} sx={{ padding: '32px 10%' }}>
        <Grid item xs={4} sx={{ fontFamily: '"DINPro", sans-serif' }}>
          <SimpleTreeView 
            folders={folders}
            setFolderId={setFolderId}
            setSubFolderId={setSubFolderId}
            groupId={undefined}
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
            title="My Items"
          />
        </Grid>
        <Grid item xs={8}>
          <MyItemsList
            data={items}
            defaultPage={defaultPage}
            folderId={folderId}
            subFolderId={subFolderId}
            setDefaultPage={setDefaultPage}
            pages={pages}
            count={count}
            handleRemoveItems={handleRemoveItems}
            updateCasesData={updateCasesData}
            get={get}
            selectedFolderIsDefault={selectedFolderIsDefault}
            canRemoveItems={true}
            setCheck={setCheck}
            check={check}
          />
        </Grid>
      </Grid>
    </>
  );
}

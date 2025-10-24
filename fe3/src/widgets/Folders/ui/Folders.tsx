// @ts-nocheck
import { useState } from "react"
import axios from "axios"
import { Link } from 'react-router-dom';
import { Menu, Fade, Typography, TextField, FormControl, Box, MenuItem } from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { CButton } from "pages/Case/ui/components"
import req from 'shared/lib/req'
import cls from "./Folders.module.scss"

export function Folders({ ids = [] }) {
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)
  const [getName, setGetName] = useState('')
  const [isShow, setisShow] = useState(false)
  const [check, setCheck] = useState([])
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [selectedFolder, setSelectedFolder] = useState('')
  const [folderName, setFolderName] = useState('')
  const [folders, setFolders] = useState({
    userFolders: [],
    groupFolders: [],
    myItemsTitle: "",
    myGroupsTitle: "",
  })

  const handleClick = (event) => {
    setCreatingFolder(false)
    setAnchorEl(event?.currentTarget);
    // Fetch folders when opening the save menu
    axios
      .get("/api/myitems/v1/save-widget/reload/")
      .then((response) => {
        const fetchedFolders = response.data;

        const userFolders = Array.isArray(fetchedFolders.user_folders)
          ? fetchedFolders.user_folders
          : [];
        const groupFolders = Array.isArray(fetchedFolders.groups)
          ? fetchedFolders.groups
          : [];

        setFolders({
          userFolders,
          groupFolders,
          myItemsTitle: fetchedFolders.my_items_title,
          myGroupsTitle: fetchedFolders.my_groups_title,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch folders", error);
      })
  }

  const handleClose = () => {
    setFolderName("");
    setAnchorEl(null);
  }

  const selectValue = (value, name) => {
    setGetName(name);
    setSelectedFolder(value);
    setisShow(false);
  }

  const handleCreateFolderInline = async () => {
    if (!folderName) return;
    if (folderName) {
      try {
        const payload: any = {
          target_title: folderName,
          item_ids: ids,
        };

        if (selectedFolder && selectedFolder !== "my_saved_cases") {
          payload.parent = selectedFolder;
        } else {
          payload.parent = '';
        }

        const response = await req.post('myitems/v1/save-widget/save/', payload)
       
        setCreatingFolder(false);
        setSelectedFolder("");
        setGetName("Move folder to");
        setCheck([]);
        if (response?.status === 'success' || response?.status === 200) {
          alert(`Success! ${response?.data?.message || response?.message}`)
          window.location.reload()
        }
      } catch (error) {
        console.error("Failed to create folder", error);
      }
      handleClose();
      handleClick(null);
    }
  }

  const createNewFolder = () => {
    setCreatingFolder(true)
    selectValue('', 'My Saved Cases')
  }

  const handleSaveToFolder = async (fullId, folderTitle, event) => {
    event.stopPropagation();

    const itemIds = ids
    if (itemIds.length === 0) {
      console.error("No items selected for saving");
      return;
    }

    try {
      const payload = {
        target_id: fullId,
        target_title: folderTitle,
        item_ids: itemIds,
      };
      const response = await req.post("myitems/v1/save-widget/save/", payload)
      setCheck([]);
      handleClose();
      if (response?.status === 'success' || response?.status === 200) {
        alert(`Success! ${response?.data?.message || response?.message}`) // You have saved ${itemIds.length} Cases to My Items → ${folderTitle}
        window.location.reload()
      }
      console.log("Items saved successfully");
    } catch (error) {
      console.error("Failed to save items", error);
    }
  }

  return <>
    <CButton
      id="fade-button"
      aria-controls={open ? "fade-menu" : undefined}
      aria-haspopup="true"
      aria-expanded={open ? "true" : undefined}
      endIcon={<KeyboardArrowDownIcon />}
      onClick={handleClick}
      style={{ display: 'inline-flex' }}
    >
      Save
    </CButton>
    <Menu
      id="fade-menu"
      MenuListProps={{ "aria-labelledby": "fade-button" }}
      className={cls.fadeMenu}
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      TransitionComponent={Fade}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {creatingFolder ? (
        <div className={cls.foldersWrapper} style={{ padding: "16px", width: 'min-content' }}>
          <Typography>Create New Folder</Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Enter folder name"
            type="text"
            fullWidth
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
          />
          <FormControl fullWidth sx={{ marginTop: "16px" }}>
            <div className={cls.dropButtonWrapper}>
              <div>
              Move folder to
              </div>
            <button onClick={() => setisShow(!isShow)} className={cls.dropButton}>
              {getName} 
            </button>
            <KeyboardArrowDownIcon className={`${cls.dropButtonIcon} ${isShow ? cls.dropButtonIconRotate : ''}`} />
            </div>
            <div className={cls.dropWrapper}>
            {isShow && (
              <Box className={cls.dropdown}>
                <MenuItem
                  onClick={() => selectValue('', 'My Saved Cases')}
                  className={cls.mySAvedCases}
                >
                  My Saved Cases
                </MenuItem>
                {/* User folders */}
                {folders.userFolders?.map((folder) => (
                  <MenuItem
                    key={folder.id}
                    onClick={() => selectValue(`${folder.content_type_id}.${folder.id}`, folder.title)}
                  >
                    {folder.title}
                  </MenuItem>
                ))}

                {/* Group folders */}
                <div className={cls.userFolders}>
                  {folders.groupFolders?.map((group) => (
                    <div key={group.id}>
                      <MenuItem
                        onClick={() => selectValue(`${group.content_type_id}.${group.id}`, group.title)}
                        style={{
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {group.title}
                      </MenuItem>
                      {group.folders?.map((folder) => (
                        <MenuItem
                          key={folder.id}
                          onClick={() => selectValue(`${folder.content_type_id}.${folder.id}`, folder.title)}
                          style={{ cursor: "pointer" }}
                        >
                          {folder.title}
                        </MenuItem>
                      ))}
                    </div>
                  ))}
                </div>
              </Box>
            )}
              </div>
          </FormControl>
          <Box
            sx={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CButton onClick={() => setCreatingFolder(false)}>
              Cancel
            </CButton>
            <CButton
              style={{ marginLeft: "8px" }}
              onClick={handleCreateFolderInline}
            >
              Create & Save
            </CButton>
          </Box>
        </div>
      ) : (
        <div className={cls.allItems}>
          {/* My Items Section */}
          {folders.myItemsTitle && (
            <div className={cls.myItems}>
              <Typography className={cls.title} component={Link} to="/my/new/items">
                {folders.myItemsTitle}
              </Typography>
              <div className={cls.itemsWrapper}>
                {folders.userFolders?.map((folder) => (
                  <div
                    className={cls.folder}
                    key={folder.id}
                    onClick={(e) =>
                      handleSaveToFolder(
                        `${folder.content_type_id}.${folder.id}`,
                        folder.title,
                        e
                      )
                    }
                  >
                    <Typography className={cls.folderName}>
                      {folder.title}
                    </Typography>
                    {folder.subfolders?.map((subfolder) => (
                      <div
                        key={subfolder.id}
                        onClick={(e) =>
                          handleSaveToFolder(
                            `${subfolder.content_type_id}.${subfolder.id}`,
                            subfolder.title,
                            e
                          )
                        }
                      >
                        <Typography className={cls.subFolderName}>
                          {subfolder.title}
                        </Typography>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* My Groups Section */}
          {folders.myGroupsTitle && (
            <div className={cls.groupItems}>
              <Typography className={cls.title} component={Link} to="/my/new/groups">
                {folders.myGroupsTitle}
              </Typography>
              <div className={cls.itemsWrapper}>
                {folders.groupFolders?.map((group) => (
                  <div
                    key={group.id}
                    onClick={(e) =>
                      handleSaveToFolder(
                        `${group.default_folder.content_type_id}.${group.default_folder.id}`,
                        group.default_folder.title,
                        e
                      )
                    }
                    className={cls.folder}
                  >
                    <div className={cls.groupNameWrapper}>
                      <img src={group.cover} alt="photo" />
                      <Typography className={cls.groupNameTitle}>
                        {group.title}
                      </Typography>
                    </div>
                    {group.folders?.map((folder) => (
                      <div
                        className={cls.folder}
                        key={folder.id}
                        onClick={(e) =>
                          handleSaveToFolder(
                            `${folder.content_type_id}.${folder.id}`,
                            folder.title,
                            e
                          )
                        }
                      >
                        <Typography className={cls.folderName}>
                          {folder.title}
                        </Typography>
                        {folder.subfolders?.map((subfolder) => (
                          <div
                            key={subfolder.id}
                            onClick={(e) =>
                              handleSaveToFolder(
                                `${subfolder.content_type_id}.${subfolder.id}`,
                                subfolder.title,
                                e
                              )
                            }
                          >
                            <Typography className={cls.subFolderName}>
                              {subfolder.title}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          <CButton
            style={{ float: "right", margin: "16px" }}
            onClick={createNewFolder}
          >
            Create new folder
          </CButton>
        </div>
      )}
    </Menu>
  </>
}
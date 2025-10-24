// @ts-nocheck
import * as React from "react";
import { useLocation, useSearchParams, useNavigate, Link } from 'react-router-dom';
import * as qs from 'query-string';
import { styled } from "@mui/material/styles";
import { useAppDispatch } from "hooks/redux";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Pagination from "@mui/material/Pagination";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import Fade from "@mui/material/Fade";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { fetchItems } from "widgets/MyItems/model/services/ActionCreators";
import { CardCase } from "../../../widgets/CardCase";
import cls from "./MyItemsList.module.scss";
import axios from "axios";
import { GridDeleteIcon } from "@mui/x-data-grid";

const CButton = styled(Button)(({ theme }) => ({
  padding: "6px 12px",
  borderColor: "#303e48",
  backgroundColor: "#303e48",
  color: "#fad000",
  fontFamily: '"DINPro", sans-serif',
  boxShadow: "0 3px 0 #202c34",
  "&:hover": {
    borderColor: "#8f9bae",
    backgroundColor: "#8f9bae",
    color: "#ffffff",
    boxShadow: "0 3px 0 #7c8ba2",
  },
}));

export function MyItemsList({
  data = [],
  pages = 1,
  count = 0,
  folderId = '',
  subFolderId = '',
  unselectTopic = () => {},
  unselectGrade = () => {},
  unselectFramework = () => {},
  onClear = () => {},
  handleRemoveItems = (check: []) => {},
  updateCasesData = (check: []) => {},
  get,
  selectedFolderIsDefault,
  setCheck,
  check,
  defaultPage,
  setDefaultPage,
  canRemoveItems = false,
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: filters } = useLocation();
  const location = useLocation();

  const setParams = (key, value) => {
    let params = qs.parse(filters);
    params[key] = value
    setSearchParams(params);
  }

  const [term, setTerm] = React.useState(() => {
    return new URLSearchParams(window.location.search).get("f.search") || "";
  });
  const [search, setSearch] = React.useState(searchParams.get('f.search'));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [csrfToken, setCsrfToken] = React.useState("");
  const [searchText, setSearchText] = React.useState("")
  // New state for creating folder inline
  const [creatingFolder, setCreatingFolder] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [isShow, setisShow] = React.useState(false);
  const [getName, setGetName] = React.useState("");
  const [itemIds, setItemIds] =  React.useState([]);
  const [folders, setFolders] = React.useState({
    userFolders: [],
    groupFolders: [],
    myItemsTitle: "",
    myGroupsTitle: "",
  });
  const [selectedFolder, setSelectedFolder] = React.useState("");

  const handlePageChange = (page) => {
    setDefaultPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set("page", page);
    if (term) params.set("f.search", term);
    navigate(`?${params.toString()}`);
  };

  const handleSearch = (searchTerm) => {
    setDefaultPage(1)
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) {
      params.set("f.search", searchTerm);
      setSearch(searchTerm);
    } else {
      params.delete("f.search");
    }
  
    params.set("page", 1);
    window.history.replaceState(null, "", `?${params.toString()}`);
  
    dispatch(
      fetchItems(
        searchTerm,
        1,
        folderId,
        subFolderId,
      )
    );
  };
  
  const handleClearFilters = () => {
    const params = new URLSearchParams();
    setTerm("");
    setDefaultPage(1);
    setSearch("");
    setSearchText("");
    onClear();
  
    const currentPath = location.pathname;

    navigate(currentPath);
  };

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setCreatingFolder(false)
    setAnchorEl(event.currentTarget);
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
      });
  };

  const handleClose = () => {
    setFolderName("");
    setAnchorEl(null);
  };

  const handleChecked = ({ target }) => {
    setCheck(data.map(() => target.checked));
  };

  const handleItem = (event) => {
    setDefaultPage(1)
    const params = new URLSearchParams(window.location.search);
    params.set("page", 1);
  
    window.history.replaceState(null, "", `?${params.toString()}`);
  
    dispatch(
      fetchItems(
        term,
        1,
        folderId,
        subFolderId,
      )
    );
  };

  React.useEffect(() => {
    setCheck(data.map(() => false));
  }, [JSON.stringify(data)]);

  React.useEffect(() => {
    if (term) setParams('f.search', term);
  }, [search]);

  React.useEffect(() => {    
    getItemIds();
  }, [check, JSON.stringify(data)]);

  React.useEffect(() => {
    dispatch(
      fetchItems(
        term,
        defaultPage,
        folderId,
        subFolderId,
      )
    );
  }, [defaultPage, folderId, subFolderId, JSON.stringify(term)]);

  const handleCreateFolderInline = async () => {
    if (!folderName) return;
    if (folderName) {
      try {
        const payload = {
          target_title: folderName,
          item_ids: check
            .map((isChecked, index) => {
              return isChecked && data[index] ? data[index].id : null;
            })
            .filter((id) => id !== null),
        };

        if (selectedFolder && selectedFolder !== "my_saved_cases") {
          payload.parent = selectedFolder;
        } else {
          payload.parent = '';
        }

        const response = await axios.post("/api/myitems/v1/save-widget/save/", payload, {
          headers: {
            "X-CSRFToken": csrfToken,
          },
        });
       
        setCreatingFolder(false);
        setSelectedFolder("");
        setGetName("Move folder to");
        setCheck([]);
        if (response?.status === 200) {
          alert(`Success! ${response?.data?.message}`)
        }
        get();
      } catch (error) {
        console.error("Failed to create folder", error);
      }
      handleClose();
      handleClick();
    }
  };
  
  const getItemIds = () => {
    const itemsIds = check
      .map((isChecked, index) => {
        return isChecked && data[index] ? data[index].id : null;
      })
      .filter((id) => id !== null);
    setItemIds(itemsIds);
  };

  const deleteItems = () => {
    getItemIds()
    if(itemIds.length) {
      handleRemoveItems(itemIds)
    }
  }
  // Handle saving items to a folder, subfolder, or directly to a group
  const handleSaveToFolder = async (fullId, folderTitle, event, selectGroupId) => {
    event.stopPropagation();
    getItemIds()
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
      const response = await axios.post("/api/myitems/v1/save-widget/save/", payload, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });
      setCheck([]);
      handleClose();
      if (response?.status === 200) {
        alert(`Success! ${response?.data?.message}`)
      }
      get();
      if (selectedFolderIsDefault && selectGroupId) {
        updateCasesData(itemIds);
      }
    } catch (error) {
      console.error("Failed to save items", error);
    }
  };

  const openDropDown = () => {
    setisShow(!isShow);
  };
  const selectValue = (value, name) => {
    setGetName(name);
    setSelectedFolder(value);
    setisShow(false);
  };

  const createNewFolder = () => {
    setCreatingFolder(true)
    selectValue('', 'My Saved Cases')
  }
 
  return (
    <>
      <Typography
        sx={{
          color: "#44515a",
          font: '400 24px / 24px "DINPro", sans-serif',
          marginBottom: "15px",
        }}
      >
        My Items ({count})
      </Typography>
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          gap: "4px",
          backgroundColor: "#efeff0",
          padding: "8px",
          minHeight: "72px",
        }}
      >
        <FormControlLabel
          label="Select all"
          control={
            <Checkbox
              checked={
                check.length ? check.reduce((a, b) => a && b, true) : false
              }
              indeterminate={check.some(Boolean) && !check.every(Boolean)}
              onChange={handleChecked}
              sx={{ backgroundColor: "white", margin: "0 8px" }}
            />
          }
        />
        {check.some(Boolean) && (
          <>
            <CButton
              id="fade-button"
              aria-controls={open ? "fade-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleClick}
            >
              Save
            </CButton>
            <Menu
              id="fade-menu"
              MenuListProps={{
                "aria-labelledby": "fade-button",
              }}
              className={cls.fadeMenu}
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              TransitionComponent={Fade}
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
                    <button onClick={openDropDown} className={cls.dropButton}>
                      {getName} 
                    </button>
                    <KeyboardArrowDownIcon className={`${cls.dropButtonIcon} ${isShow ? cls.dropButtonIconRotate : ''}`} />
                    </div>
                    <div className={cls.dropWrapper}>
                    {isShow && (
                      <Box
                        className={cls.dropdown}
                  
                      >
                        <MenuItem
                    
                          onClick={() =>
                            selectValue(
                              '',
                              'My Saved Cases'
                            )
                          }
                          className={cls.mySAvedCases}
                        >
                          My Saved Cases
                        </MenuItem>

                        {/* User folders */}
                        {folders.userFolders?.map((folder) => (
                          <MenuItem
                            key={folder.id}
                            onClick={() =>
                              selectValue(
                                `${folder.content_type_id}.${folder.id}`,
                                folder.title
                              )
                            }
                          >
                            {folder.title}
                          </MenuItem>
                        ))}

                        {/* Group folders */}
                        <div className={cls.userFolders}>
                          {folders.groupFolders?.map((group) => (
                            <div key={group.id}>
                              <MenuItem
                                onClick={() =>
                                  selectValue(
                                    `${group.content_type_id}.${group.id}`,
                                    group.title
                                  )
                                }
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
                                  onClick={() =>
                                    selectValue(
                                      `${folder.content_type_id}.${folder.id}`,
                                      folder.title
                                    )
                                  }
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
                    onClick={ handleCreateFolderInline}
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
                                e,
                                group.id,
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
                                    e,
                                    group.id,
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
                                        e,
                                        group.id,
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
                    onClick={ createNewFolder}
                  >
                    Create new folder
                  </CButton>
                </div>
              )}
            </Menu>
            {canRemoveItems && (
              <CButton
                id="remove-items-button"
                endIcon={<GridDeleteIcon />}
                onClick={deleteItems}
              >
                Remove
              </CButton>
            )}
          </>
        )}
        {!check.reduce((a, b) => a = a || b, false) && (
          <>
            <TextField
              id="outlined-basic"
              type="search"
              label="Search within cases"
              variant="outlined"
              sx={{ flex: 1, backgroundColor: "white" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyUp={(event) => {
                if (event.key === "Enter") {
                  handleSearch(searchText);
                  setTerm(searchText)
                }
              }}
            />
            {/* <FormControl sx={{ minWidth: "142px" }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select
                labelId="sort-label"
                value={item}
                label="Sort"
                onChange={handleItem}
                sx={{ backgroundColor: "white" }}
              >
                {sorts.map((sortOption) => (
                  <MenuItem key={sortOption.slug} value={sortOption.slug}>
                    {sortOption.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
          </>
        )}
      </Paper>
      <Box
        sx={{
          gap: "24px",
          display: "flex",
          flexDirection: "column",
          marginTop: "32px",
          marginBottom: "64px",
        }}
      >
        {search ? (
          <div
            style={{
              display: "flex",
              padding: "15px 0",
              borderBottom: "1px solid #e8e8e8",
              marginTop: "-30px",
              marginBottom: "30px",
            }}
          >
            <div style={{ flex: 1 }}>
              <Button onClick={handleClearFilters}>Clear filters</Button>
            </div>
            <div style={{ flex: 3, display: "flex", flexWrap: "wrap" }}>
              {search ? (
                <span className="search-filter-value">
                  <IconButton
                    onClick={() => {
                      setSearch("");
                      setTerm("");
                      handleSearch("");
                      setSearchText("");
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  Search:
                  <span> {search}</span>
                </span>
              ) : (
                ""
              )}
            </div>
          </div>
        ) : (
          ""
        )}
        {data.map((item, index) => (
          <CardCase
            id={item.id}
            key={item.id}
            title={`${item.title} - Case ${item.id.split(".").pop()}`}
            picture={item.thumbnail}
            description={item.abstract}
            items={item.metadata.filter((meta) => meta.label !== 'Author').map((meta) =>
              meta.items.map((a) => a.name)
            )}
            checked={check[index]}
            onCheck={({ target }) => {
              const temp = [...check];
              temp[index] = target.checked;
              setCheck(temp);
            }}
            returnUrl={window.location.search}
          />
        ))}
      </Box>
      <Pagination
        count={pages}
        page={defaultPage}
        onChange={(_event, page) => handlePageChange(page)}
      />
    </>
  );
}

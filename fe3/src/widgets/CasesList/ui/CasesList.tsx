// @ts-nocheck
import { useState, useEffect } from "react";
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
import { fetchCases } from "pages/Cases/model/services/ActionCreators";
import { CardCase } from "../../../widgets/CardCase";
import cls from "./CasesList.module.scss";
import axios from "axios";
import { GridDeleteIcon } from "@mui/x-data-grid";
import { matomoTag } from "pages/Case/ui/helper";
import { useAppDispatch } from 'hooks/redux';

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
}))

const overflowStyle = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '380px',
}

const Loader = () => <svg width="20" height="20" viewBox="0 0 100 100" style={{ marginLeft: '8px' }}>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#303e48" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="125">
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      from="0 50 50"
      to="360 50 50"
      dur="1s"
      repeatCount="indefinite"
    />
    <animate
      attributeName="stroke-dashoffset"
      values="125; 251.2; 0; 125"
      dur="1.5s"
      repeatCount="indefinite"
    />
  </circle>
</svg>

export function CasesList({
  data = [],
  sorts = [],
  pages = 1,
  count = 0,
  topics = [],
  grades = [],
  selectedStandards = [],
  groupId = '',
  folderId = '',
  subFolderId = '',
  unselectTopic = () => {},
  unselectGrade = () => {},
  onClear = () => {},
  handleRemoveItems = (check: []) => {},
  updateCasesData = (check: []) => {},
  get = () => {},
  onUnselectFilter = () => {},
  selectedFolderIsDefault,
  setCheck,
  check,
  order,
  defaultPage,
  setDefaultPage,
  pageName = '',
  titles = '',
  URL = '/api/search/v2/browse/',
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: filters } = useLocation();
  const location = useLocation();
  const [extras, setExtras] = useState([])

  const setParams = (key, value) => {
    let params = qs.parse(filters);
    params[key] = value;
    if (!params.sort_by) {
      params.sort_by = "search";
    }

    setSearchParams(params);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!params.get("sort_by")) {
      params.set("sort_by", "search");
      setSearchParams(params);
    }
  }, []);

  const [term, setTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get("f.search") || "";
  });
  const [search, setSearch] = useState(searchParams.get('f.search'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [csrfToken, setCsrfToken] = useState("");
  const [searchText, setSearchText] = useState("")
  // New state for creating folder inline
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [isShow, setisShow] = useState(false);
  const [getName, setGetName] = useState("");
  const [itemIds, setItemIds] =  useState([]);
  const [folders, setFolders] = useState({
    userFolders: [],
    groupFolders: [],
    myItemsTitle: "",
    myGroupsTitle: "",
  });
  const [selectedFolder, setSelectedFolder] = useState("");
  const [filterNames, setFilterNames] = useState({});
  const [loading, setLoading] = useState(true);

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
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    const sort = searchParams.get('sort_by');
    setTerm("");
    setDefaultPage(1);
    setSearch("");
    setSearchText("");
    onClear();
    setExtras([])

    const currentPath = location.pathname;

    if (sort) {
      params.set('sort_by', sort);
      navigate(`${currentPath}?sort_by=${sort}`);
    } else {
      navigate(currentPath);
    }
  };

  const clearStdFilter = (value) => {
    onUnselectFilter('f.std', value.slug)
  }

  useEffect(() => {
    axios
      .get("/api/csrf-token/")
      .then((response) => {
        setCsrfToken(response.data.token);
      })
      .catch((error) => {
        console.error("Failed to fetch CSRF token", error);
      });
  }, []);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
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
    const sort = event.target.value;
    setItem(sort);
    setParams('sort_by', sort)
    const params = new URLSearchParams(window.location.search);
    params.set("page", 1);

    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  useEffect(() => {
    setCheck(data.map(() => false));
  }, [JSON.stringify(data)]);

  useEffect(() => {
    if (term) {
        setParams('f.search', term);
    } else {
        let params = new URLSearchParams(window.location.search);
        params.delete("f.search");
        setSearchParams(params);
    }
  }, [term]);

  const [item, setItem] = useState(searchParams.get('sort_by') || order || '');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sort = params.get("sort_by") || "";
    setItem(sort);
  }, [window.location.search]);

  useEffect(() => {
    getItemIds();
  }, [check, JSON.stringify(data)]);

  useEffect(() => {
    const searchParamValue = searchParams.get("f.search");
    if (searchParamValue) {
      setSearchText(searchParamValue);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchFiltersAndCases = async () => {
      setLoading(true)
      try {
        const { data: filtersData } = await axios.get('/api/search/v2/browse/filters');
        let { filters } = filtersData
        if (filters) filters = Object.values(filters)
        if (data.length) {
          filters = filters.filter((item) => !['f.general_subject', 'f.grade_codes', 'f.std'].includes(item.keyword))
        }
        const extras = []
        filters.forEach(({ keyword, name, items }) => {
          const filterValues = searchParams.getAll(keyword)
          filterValues.forEach((value) => {
            const label = items.find((item) => item.slug == value)?.name
            extras.push({ keyword, value, name, label })
          })
        })
        setExtras(extras)
      } catch (error) {
        console.error("Failed to fetch filters", error);
      }
      await dispatch(fetchCases(URL, groupId, folderId, subFolderId));
      setLoading(false)
    };

    fetchFiltersAndCases();
  }, [
    defaultPage,
    groupId,
    folderId,
    subFolderId,
    JSON.stringify(term),
    JSON.stringify(topics),
    JSON.stringify(grades),
    searchParams,
  ]);

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
        get(groupId);
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
        alert(`Success! ${response?.data?.message}`) // You have saved ${itemIds.length} Cases to My Items → ${folderTitle}
      }
      get(groupId);
      if (selectedFolderIsDefault && selectGroupId && Number(selectGroupId) === Number(groupId)) {
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
        {titles} Cases
        {loading ? <Loader /> : ` (${count})`}
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
            {pageName && (
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
                  setTerm(searchText);
                  if (pageName == 'group') {
                    matomoTag({ category: 'Search', action: 'group search', name: searchText });
                  } else {
                    matomoTag({ category: 'Search', action: 'site search', name: searchText });
                  }
                }
              }}
            />
            <FormControl sx={{ minWidth: "142px" }}>
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
            </FormControl>
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
      {topics.length ||
      grades.length ||
      selectedStandards.length ||
      search ||
      searchParams.get("hub_title") ||
      extras.length ? (
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
              {searchParams.get("network_hub") && (
                <span className="search-filter-value">
                  <IconButton
                    onClick={() => {
                      let params = new URLSearchParams(window.location.search);
                      params.delete("network_hub");
                      params.delete("hub_title");
                      setSearchParams(params);
                      handleSearch(search);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  Hub:
                  <span> {searchParams.get("hub_title") || searchParams.get("network_hub")}</span>
                </span>
              )}
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
              {topics.map((topic) => (
                <span key={topic.slug} className="search-filter-value">
                  <IconButton onClick={() => unselectTopic(topic)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  {topic.parent ? "Topic" : "Subject"}:
                  <span> {topic.name}</span>
                </span>
              ))}
              {grades.map((grade) => (
                <span key={grade.slug} className="search-filter-value">
                  <IconButton onClick={() => unselectGrade(grade)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  Grade:
                  <span> {grade.name}</span>
                </span>
              ))}
              {selectedStandards.map(standard => (
                <span className="search-filter-value" key={standard.slug}>
                  <IconButton onClick={() => clearStdFilter(standard)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  {standard.section.name}:
                  <span style={overflowStyle}> {standard.name}</span>
                </span>
              ))}
              {extras.map((extra, index) => (
                <span key={`${extra.key}-${extra.value}`} className="search-filter-value">
                  <IconButton
                    onClick={() => {
                      let params = new URLSearchParams(window.location.search);
                      const updatedValues = params.getAll(extra.keyword).filter(val => val != extra.value);
                      params.delete(extra.keyword);
                      updatedValues.forEach(val => params.append(extra.keyword, val));
                      setSearchParams(params);
                      handleSearch(search);
                      setExtras(extras.filter((_, i) => i !== index));
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  {extra.name}: <span>{extra.label}</span>
                </span>
              ))}

            </div>
          </div>
        ) : (
          ""
        )}
        {data.map((item, index) => (
          <CardCase
            id={item.id}
            key={item.id}
            title={`${item.title} - Case ${item?.id?.split(".")?.pop()}`}
            picture={item.thumbnail}
            description={item.abstract}
            items={item.metadata.filter((meta) => ['Subject', 'Grade Level'].includes(meta.label)).map((meta) =>
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

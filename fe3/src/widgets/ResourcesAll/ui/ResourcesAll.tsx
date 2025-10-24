// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
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
import { CardResource } from "widgets/CardResource";
import cls from "./ResourcesAll.module.scss";
import axios from "axios";
import { GridDeleteIcon } from "@mui/x-data-grid";
import { matomoTag } from "pages/Case/ui/helper";
import { useAppDispatch, useAppSelector } from 'hooks/redux';

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

export function ResourcesAll({
  data = [],
  pages = 1,
  count = 0,
  materials = [],
  selectedStandards = [],
  unselectMaterial = () => {},
  onUnselectFilter = () => {},
  onClear = () => {},
  get = () => {},
  defaultPage,
  setDefaultPage,
  pageName = '',
  titles = '',
  URL,
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { search: filters } = useLocation();
  const location = useLocation();

  const setParams = (key, value) => {
    let params = qs.parse(filters);
    params[key] = value;
    setSearchParams(params);
  };
 
  const [term, setTerm] = useState(() => {
    return new URLSearchParams(window.location.search).get("f.search") || "";
  });
  const [search, setSearch] = useState(searchParams.get('f.search'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [csrfToken, setCsrfToken] = useState("");
  const [searchText, setSearchText] = useState("")

  const handlePageChange = (page) => {
    setDefaultPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set("page", page);
    if (term) params.set("f.search", term);
    navigate(`?${params.toString()}`);
  };

  const clearStdFilter = (value) => {
    onUnselectFilter('f.std', value.slug)
  }

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
    setTerm("");
    setDefaultPage(1);
    setSearch("");
    setSearchText("");
    onClear();
    const currentPath = location.pathname;
    navigate(currentPath);
  };

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

  useEffect(() => {
    if (term) setParams('f.search', term);
  }, [search]);

  useEffect(() => {
    const searchParamValue = searchParams.get("f.search");
    if (searchParamValue) {
      setSearchText(searchParamValue);
    }
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchCases(URL, null, null, null, true))
  }, [defaultPage, JSON.stringify(term), JSON.stringify(materials)]);
 
  return (
    <>
      <Typography
        sx={{
          color: "#44515a",
          font: '400 24px / 24px "DINPro", sans-serif',
          marginBottom: "15px",
        }}
      >
        {titles} Resources ({count})
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
        {materials.length || selectedStandards.length || search || searchParams.get("hub_title") ? (
          <div
            style={{
              display: "flex",
              padding: "15px 0",
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
              {materials.map((material) => (
                <span key={material.slug} className="search-filter-value">
                  <IconButton onClick={() => unselectMaterial(material)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  Material Type:
                  <span> {material.name}</span>
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
            </div>
          </div>
        ) : (
          ""
        )}
        <div style={{
          padding: '0 20px',
          border: '1px solid #e8e8e8',
        }}>
          {data.map((item, index) => (
            <CardResource
              id={item.id}
              key={item.id}
              title={`${item.title} - Case ${item?.id?.split(".")?.pop()}`}
              description={item.abstract}
              url={item.url}
              items={item.metadata.filter((meta) => ['Subjects', 'Grade Levels', 'Frameworks'].includes(meta.label))}
            />
          ))}
        </div>
      </Box>
      <Pagination
        count={pages}
        page={defaultPage}
        onChange={(_event, page) => handlePageChange(page)}
      />
    </>
  );
}

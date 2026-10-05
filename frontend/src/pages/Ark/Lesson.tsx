/* eslint-disable react/jsx-no-comment-textnodes */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import api from "./api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Modal as MuiModal,
  Link as MuiLink,
  Tab,
  Tabs,
  Drawer,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NoteIcon from "@mui/icons-material/Note";
import RemixIcon from "@mui/icons-material/Autorenew"; // Substitute for remix
import CCIcon from "@mui/icons-material/Copyright"; // Substitute for cc
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DownloadIcon from "@mui/icons-material/Download";
import MovieIcon from "@mui/icons-material/Movie";
import Loader from "./icons/Loader";
import cls from "./styles.module.scss";
import { matomoTag } from "pages/Case/ui/helper";
import { makeVideoContent } from "./widgets/VideoPlayer";
import MenuIcon from "@mui/icons-material/Menu";
import Arrow from "./icons/Arrow";

const trackDownload = (s?: string) => {
  const v = (s || "").toLowerCase();
  let action: "html" | "pdf" | "docx" | "pptx" | "attached resources" =
    "attached resources";
  if (v.endsWith(".pdf") || v === "pdf") action = "pdf";
  else if (v.endsWith(".docx") || v === "docx") action = "docx";
  else if (v.endsWith(".pptx") || v === "pptx") action = "pptx";
  else if (v.endsWith(".html") || v.endsWith(".htm") || v === "html")
    action = "html";
  matomoTag({ category: "Downloads", action });
};

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function AttachmentButton({ title, url = "" }) {
  const ext = url.split(".").pop()?.toLowerCase();
  let FileIcon = InsertDriveFileIcon;
  if (ext === "pdf") FileIcon = PictureAsPdfIcon;
  else if (["mp4", "mov", "avi", "webm"].includes(ext)) FileIcon = MovieIcon;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      {/* Open in new tab */}
      <IconButton
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in new tab"
        size="small"
        onClick={() => trackDownload(url)}
      >
        <FileIcon color="primary" />
      </IconButton>
      {/* Download */}
      <IconButton
        component="a"
        href={url}
        download
        aria-label="Download file"
        size="small"
        onClick={() => trackDownload(url)}
      >
        <DownloadIcon color="action" />
      </IconButton>
      <Typography variant="body2" sx={{ ml: 1 }}>
        {title}
      </Typography>
    </Box>
  );
}

function StarRating({ rate }) {
  const full = Math.floor(Number(rate) || 0);
  const empty = 5 - full;
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {[...Array(full)].map((_, i) => (
        <StarIcon color="success" key={i} />
      ))}
      {[...Array(empty)].map((_, i) => (
        <StarBorderIcon color="disabled" key={i} />
      ))}
    </Box>
  );
}

function HistoryModal({ open, onClose, history }) {
  return (
    <MuiModal open={open} onClose={onClose}>
      <Box
        sx={{
          bgcolor: "#fff",
          p: 3,
          borderRadius: 2,
          maxWidth: 400,
          mx: "auto",
          my: 8,
          outline: "none",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Version History
        </Typography>
        {history.map((item, idx) => (
          <Box key={idx} mb={2}>
            {item.change_type === "remixed_from" && (
              <>
                <span>Remixed from </span>
                <MuiLink href={item.related_object_url}>
                  {item.related_object_name}
                </MuiLink>
              </>
            )}
            {item.change_type === "remix_published" && (
              <span>Remix published </span>
            )}
            <span>{`on ${new Date(item.date)
              .toDateString()
              .substring(4)}`}</span>
            {item.author_name && (
              <MuiLink
                href={item.author_url}
              >{` by ${item.author_name}`}</MuiLink>
            )}
            {item.change_type === "remix_published" && (
              <>
                <span>: </span>
                <MuiLink href={item.related_object_url}>
                  {item.related_object_name}
                </MuiLink>
              </>
            )}
          </Box>
        ))}
        <Button onClick={onClose} variant="contained" fullWidth>
          Close
        </Button>
      </Box>
    </MuiModal>
  );
}

const fileFormats = ["pdf", "epub", "thincc", "scorm"];

async function hardDownload(url, interval = 5) {
  function browserDownload(downloadUrl) {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return new Promise(async (resolve, reject) => {
    try {
      const { data } = await api.post(url);

      if (data?.created && data?.download_url) {
        browserDownload(data.download_url);
        resolve();
        return;
      }

      if (!data?.task_url) {
        reject(new Error("hardDownload: No task_url in response"));
        return;
      }

      const pollTask = async () => {
        try {
          const taskRes = await api.get(data.task_url);
          const status = taskRes?.data?.task?.status;

          const downloadUrl =
            taskRes?.data?.download_url ||
            taskRes?.data?.task?.download_url ||
            data?.download_url;

          if (status === "SUCCESS") {
            if (!downloadUrl) {
              reject(new Error("hardDownload: SUCCESS but no download_url"));
              return;
            }
            browserDownload(downloadUrl);
            resolve();
            return;
          }

          if (["FAILURE", "REVOKED"].includes(status)) {
            reject(new Error(`hardDownload: task failed (${status})`));
            return;
          }

          setTimeout(pollTask, interval * 1000);
        } catch (e) {
          reject(e);
        }
      };

      pollTask();
    } catch (e) {
      reject(e);
    }
  });
}

function DownloadList({ data, editURL, canEdit }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const [downloadList, setDownloadList] = useState(data);
  const [downloadingByUrl, setDownloadingByUrl] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setDownloadList(
      data.map((item) => ({
        ...item,
        open: false,
        children: item.children || [],
      }))
    );
  }, [data]);

  return (
    <Stack direction="row" spacing={2}>
      {canEdit && (
        <Button variant="contained" color="primary" href={editURL}>
          Edit
        </Button>
      )}
      <Button
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        variant="contained"
        onClick={handleClick}
        sx={{ fontWeight: "bold" }}
      >
        Download
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {downloadList.map((item, i) => (
          <MenuItem
            key={item}
            onClick={async () => {
              if (!!item.children?.length) {
                if (!item.open)
                  setDownloadList([
                    ...downloadList.slice(0, i),
                    { ...item, open: true },
                    ...item.children.map((child) => ({
                      parent: i + 1,
                      ...child,
                    })),
                    ...downloadList.slice(i + 1),
                  ]);
                else
                  setDownloadList([
                    ...downloadList.slice(0, i),
                    { ...item, open: false },
                    ...downloadList.slice(item.children?.length + i + 1),
                  ]);
                return;
              }

              if (item.parent && fileFormats.includes(item.title)) {
                const key = item.url;
                if (downloadingByUrl[key]) return;

                setDownloadingByUrl((prev) => ({ ...prev, [key]: true }));

                try {
                  await hardDownload(item.url);
                  trackDownload(item.title);
                } catch (e) {
                  console.error(e);
                } finally {
                  setDownloadingByUrl((prev) => {
                    const next = { ...prev };
                    delete next[key];
                    return next;
                  });
                }
                return;
              }

              window.open(item.url, "_blank");
              trackDownload(item.url);
            }}
            disabled={!!item.url && !!downloadingByUrl[item.url]}
            sx={{
              bgcolor: item.parent ? "ark.innerCardsBackgroundColor" : "",
              color: item.parent ? "ark.innerCardsTextColor" : "",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>{item.title}</span>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {!!item.url && downloadingByUrl[item.url] && (
                  <CircularProgress size={14} />
                )}

                {!!item.children?.length && (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "16px",
                      transform: item.open ? "rotate(180deg)" : "",
                      transition: "transform 0.3s ease",
                    }}
                  >
                    <Arrow />
                  </div>
                )}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
}

export default function ArkLesson() {
  const params = useParams();
  let details = params["*"];
  if (details.endsWith("/")) details = details.substring(0, details.length - 1);

  const [title, setTitle] = useState("");
  const [create, setCreate] = useState("");
  const [update, setUpdate] = useState("");
  const [desc, setDesc] = useState("");
  const [license, setLicense] = useState("");
  const [licenseImage, setLicenseImage] = useState("");
  const [url, setUrl] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [collections, setCollections] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [provider, setProvider] = useState("");
  const [history, setHistory] = useState([]);
  const [rate, setRate] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [visits, setVisits] = useState(0);
  const [saves, setSaves] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [sections, setSections] = useState([]);
  const [small, setSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1200 : false
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [canEdit, setCanEdit] = useState(false);
  const [editURL, setEditURL] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/api/imls/v2/resources/ark_project/courseware/lesson-${details}`)
      .then(({ data }) => {
        const {
          authors,
          createDate,
          abstract,
          generalSubjects,
          keywords_names,
          languages,
          levels,
          materialTypes,
          mediaFormats,
          rating,
          provider,
          title,
          thumbnail,
          visits,
          saves_count,
          downloads_count,
          collections_titles,
          license_title,
          license_image,
          micrositeResourceURL,
          updateDate,
          history,
        } = data.resource;

        document.title =
          title && data?.clientInfo?.name
            ? `${title} | ${data.clientInfo.name}`
            : "Digital Public Goods Library";

        setTitle(title);
        setDesc(
          abstract
            ? abstract
                .replace(/&#39;/g, "'")
                .replace(/\&nbsp;/g, '"')
                .replace(/\&[lr]squo;/g, "'")
                .replace(/\&[lr]dquo;/g, '"')
            : ""
        );
        setSubjects(generalSubjects);
        setCollections(collections_titles);
        setLevels(levels);
        setAuthors(authors);
        setProvider(provider || "");
        setHistory(history);
        setRate(rating);
        setLicense(license_title);
        setLicenseImage(license_image);
        setMaterials(materialTypes);
        setLanguages(languages);
        setFormats(mediaFormats);
        setKeywords(keywords_names);
        setThumbnail(thumbnail);
        setVisits(visits || 0);
        setSaves(saves_count || 0);
        setDownloadsCount(downloads_count || 0);
        setUrl(micrositeResourceURL);
        setUpdate(updateDate.replace(/^(\d+)-(\d+)-.*/, "$2/$1"));
        setCreate(new Date(createDate).toDateString().slice(4));
        api.get(`/api/courseware/v1/lessons/${details}`).then(({ data }) => {
          const {
            abstract,
            general_subjects,
            levels,
            grades,
            sections,
            material_types,
            title,
            thumbnail,
            alignment_tags,
            update_date,
            can_edit,
            edit_url,
          } = data;
          setSections(sections);
          setCanEdit(can_edit);
          setEditURL(edit_url);
          setLoading(false);
        });
      });
    const handleResize = () => setSmall(window.innerWidth < 1200);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.textContent = `header>div>div{max-width:unset !important}header+div>div{max-width:unset !important}header+div .page-wrapper>div{max-width:unset !important}`;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  useEffect(() => {
    if (tab !== 1) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.id.split("-")[1], 10);
            setActiveIndex(index);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px", // Center of viewport trigger
        threshold: 0,
      }
    );
    setTimeout(() => {
      document
        .querySelectorAll('[id^="section-"]')
        ?.forEach((section) => observer.observe(section));
    }, 500);
    // Observe all sections
    return () => observer.disconnect();
  }, [tab]);

  function save() {
    // api.post('/my/save-widget/save/', { ... });
  }

  function jump(i) {
    setActiveIndex(i);
    document.getElementById(`section-${i}`).scrollIntoView({
      behavior: "smooth",
    });
  }

  if (loading)
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", margin: "36px auto" }}
      >
        <Loader />
      </Box>
    );

  const children = (id, student = true) =>
    fileFormats.map((item) => ({
      title: item,
      url: `/courseware/lesson/${id}${
        student ? "/student" : ""
      }/download/${item}`,
    }));
  const downloads = sections?.map(({ attachments }) => attachments)?.flat();
  downloads.push({ title: "Materials", children: children(details, false) });
  downloads.push({ title: "Student Materials", children: children(details) });

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      "/static/newdesign/images/materials/default-thumbnail-index.png";
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 3 }, maxWidth: 1100, mx: "auto" }}>
      <HistoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        history={history}
      />
      <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        ⬅ Back
      </Button>
      <Card
        sx={{
          display: "flex",
          flexDirection: small ? "column" : "row",
          alignItems: "center",
          mb: 3,
          p: 2,
          bgcolor: "ark.innerCardsBackgroundColor",
          color: "ark.innerCardsTextColor",
        }}
      >
        <CardMedia
          component="img"
          image={thumbnail}
          alt={title}
          sx={{
            maxWidth: 220,
            height: 220,
            objectFit: "scale-down",
            borderRadius: 2,
            mr: 3,
          }}
          onError={handleImageError}
        />
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h1" gutterBottom sx={{ fontSize: "32px" }}>
            {title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <StarRating rate={rate} />
            <Typography variant="body2" color="text.secondary">
              ({rate || 0})
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Updated {update}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            mb={2}
            sx={{ alignItems: "center " }}
          >
            <Typography variant="body2">{visits} Views</Typography>
            <Typography variant="body2">{saves} Saves</Typography>
            <Typography variant="body2">{downloadsCount} Downloads</Typography>
            {!!downloads?.length && !small && (
              <DownloadList
                data={downloads}
                canEdit={canEdit}
                editURL={editURL}
              />
            )}
          </Stack>
          {!!downloads?.length && small && (
            <DownloadList
              data={downloads}
              canEdit={canEdit}
              editURL={editURL}
            />
          )}
          <Stack direction="row" spacing={2} mb={2}>
            {/* <Button
              variant="contained"
              color="primary"
              href={'/ark/overview/' + details}
              onClick={() => {
                matomoTag({
                  category: 'Resource Interaction',
                  action: 'Overview Courseware',
                  name: details,
                });
              }}
            >
              View Resource
            </Button> */}
            {/* <Button variant="outlined" onClick={save}>
              Save
            </Button> */}
          </Stack>
        </CardContent>
      </Card>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_e, t) => setTab(t)}>
          <Tab label="Details" />
          <Tab label="View Resource" />
        </Tabs>
      </Box>
      <CustomTabPanel value={tab} index={0}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <Box flex={1}>
            <Typography
              variant="h2"
              color="ark.mainFontColor"
              gutterBottom
              sx={{ fontSize: "28px" }}
            >
              Description
            </Typography>
            <Typography variant="body1" color="ark.mainFontColor" paragraph>
              <b>Overview: </b>
            </Typography>
            <Typography variant="body1" color="ark.mainFontColor" paragraph
              dangerouslySetInnerHTML={{ __html: desc?.replace(/\r\n/g, '<br />')?.replace(/\n/g, '<br />') }}
            />
            <Typography variant="body2" color="ark.mainFontColor" paragraph>
              <b>Subject:</b> {subjects?.join(", ")}
              <br />
              <b>Level:</b> {levels?.join(" / ")}
              <br />
              <b>Material Type:</b> {materials?.join(", ")}
              <br />
              <b>Author:</b> {authors?.join(", ")}
              <br />
              {provider && (
                <>
                  <b>Provider:</b> {provider}
                  <br />
                </>
              )}
              <b>Collection:</b> {collections?.join(", ")}
              <br />
              <b>Language:</b> {languages?.join(", ")}
              <br />
              <b>Media Format:</b> {formats?.join("/")}
              <br />
              {license && (
                <>
                  <b>License:</b> {license}
                </>
              )}
              {licenseImage && (
                <img
                  src={licenseImage}
                  alt="CC"
                  style={{ marginLeft: 8, verticalAlign: "middle", height: 24 }}
                />
              )}
            </Typography>
            <Box mt={2}>
              <b>Tags: </b>
              <Button variant="outlined" size="small" sx={{ ml: 1 }}>
                Add New Tag
              </Button>
            </Box>
            <Box
              mt={1}
              color="ark.mainFontColor"
              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
            >
              {keywords.map((item, idx) => (
                <Chip
                  key={idx}
                  label={item}
                  variant="outlined"
                  sx={{
                    bgcolor: "ark.innerCardsBackgroundColor",
                    color: "ark.innerCardsTextColor",
                  }}
                />
              ))}
            </Box>
          </Box>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: "none", sm: "block" } }}
          />
          <Box minWidth={220}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <HistoryIcon color="action" />
                <Typography variant="body2" color="ark.mainFontColor">
                  {history.length} Updates/Edits since first published {create}
                </Typography>
              </Box>
              {history.length > 0 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <RemixIcon color="action" />
                  <Typography variant="body2" color="ark.mainFontColor">
                    {history.length} Remixes
                  </Typography>
                </Box>
              )}
              {history.length > 0 && (
                <MuiLink
                  component="button"
                  onClick={() => setModalOpen(true)}
                  sx={{ color: "primary.main", fontWeight: 500, mt: 1 }}
                >
                  Show full history
                </MuiLink>
              )}
            </Stack>
          </Box>
        </Stack>
      </CustomTabPanel>
      <CustomTabPanel value={tab} index={1}>
        {small && (
          <>
            <IconButton
              size="large"
              sx={{
                position: "sticky",
                top: "36px",
                background: "black",
                color: "white",
              }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer open={open} onClose={() => setOpen(false)}>
              <Box sx={{ width: "280px", padding: "48px 24px" }}>
                <Typography
                  sx={{ mb: 2, fontSize: "24px", fontWeight: 600 }}
                  color="ark.mainFontColor"
                  variant="h2"
                >
                  Contents
                </Typography>
                <ul
                  style={{
                    fontFamily: "Inter",
                    color: "#646464",
                    cursor: "pointer",
                  }}
                >
                  {sections.map((section, idx) => (
                    <li
                      onClick={() => jump(idx)}
                      style={{ textDecoration: "underline", color: "#646464" }}
                    >
                      {section.name}
                    </li>
                  ))}
                </ul>
              </Box>
            </Drawer>
          </>
        )}
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          {!small && (
            <Box
              sx={{
                maxWidth: "350px",
                position: "sticky",
                top: "36px",
                marginRight: "48px",
                bgcolor: "ark.innerCardsBackgroundColor",
                color: "ark.innerCardsTextColor",
                padding: "16px",
                borderRadius: "8px",
                minWidth: "250px",
                marginTop: "16px",
              }}
            >
              <Typography
                sx={{ mb: 2, fontSize: "24px", fontWeight: 600 }}
                color="ark.mainFontColor"
                variant="h2"
              >
                Contents
              </Typography>
              <ul
                style={{
                  fontFamily: "Inter",
                  color: "#646464",
                  cursor: "pointer",
                }}
              >
                {sections.map((section, idx) => (
                  <li
                    onClick={() => jump(idx)}
                    style={{
                      color: "#646464",
                      borderRadius: "4px",
                      paddingLeft: "8px",
                      background: activeIndex === idx ? "white" : "",
                    }}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            </Box>
          )}
          <Box
            sx={{ fontFamily: "Inter", lineHeight: "26px", flex: 1 }}
            className={cls.sections}
          >
            {sections.map((section, idx) => (
              <Card
                key={idx}
                id={"section-" + idx}
                sx={{
                  p: 2,
                  mt: 2,
                  bgcolor: "ark.innerCardsBackgroundColor",
                  color: "ark.innerCardsTextColor",
                }}
              >
                <Typography variant="h6">{section.name}</Typography>
                <div
                  dangerouslySetInnerHTML={{
                    __html: section.teacher_description,
                  }}
                />
                <div className={cls.content}>
                  <Typography variant="h6">{section.routine_name}</Typography>
                  <div>{makeVideoContent(section.content)}</div>
                  {!!section.attachments?.length && (
                    <div className={cls.attachments}>
                      {section.attachments.map((item, i) => {
                        return (
                          <AttachmentButton
                            key={i}
                            url={item.url}
                            title={item.title}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </Box>
        </div>
      </CustomTabPanel>
      <IconButton
        color="primary"
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          bgcolor: "primary.main",
          color: "#fff",
          boxShadow: 3,
          "&:hover": { bgcolor: "primary.dark" },
        }}
        size="large"
      >
        <EditIcon />
      </IconButton>
    </Box>
  );
}

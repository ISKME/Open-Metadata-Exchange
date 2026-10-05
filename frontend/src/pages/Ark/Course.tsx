/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/anchor-is-valid */
// @ts-nocheck
import api from "./api/axios";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Modal as MuiModal,
  Link as MuiLink,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import HistoryIcon from "@mui/icons-material/History";
import RemixIcon from "@mui/icons-material/Autorenew";
import Loader from "./icons/Loader";

const normalizeText = (s?: string) => {
  if (!s) return "";
  return String(s)
    .replace(/&#39;/g, "'")
    .replace(/\&nbsp;/g, " ")
    .replace(/\&[lr]squo;/g, "'")
    .replace(/\&[lr]dquo;/g, '"');
};

const pickLabel = (v: any) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v.name || v.short_name || v.title || v.code || v.slug || "";
};

const listLabels = (arr: any) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(pickLabel).filter(Boolean);
};

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
          maxWidth: 520,
          mx: "auto",
          my: 8,
          outline: "none",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Version History
        </Typography>

        {!history?.length && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No history available.
          </Typography>
        )}

        {history?.map((item, idx) => (
          <Box key={idx} mb={2}>
            <Typography variant="body2" color="text.secondary">
              {item?.change_type ? <b>{item.change_type}</b> : <b>update</b>}{" "}
              {item?.date
                ? `on ${new Date(item.date).toDateString().substring(4)}`
                : ""}
            </Typography>

            {item?.related_object_url && (
              <MuiLink
                href={item.related_object_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item?.related_object_name || item.related_object_url}
              </MuiLink>
            )}

            {item?.author_name && item?.author_url && (
              <Typography variant="body2">
                by{" "}
                <MuiLink
                  href={item.author_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.author_name}
                </MuiLink>
              </Typography>
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

export default function ArkCourse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [rate, setRate] = useState("");

  const [update, setUpdate] = useState("");
  const [create, setCreate] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [collections, setCollections] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [formats, setFormats] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [provider, setProvider] = useState("");
  const [grades, setGrades] = useState<string[]>([]);
  const [dateAdded, setDateAdded] = useState("");

  const [license, setLicense] = useState("");
  const [licenseImage, setLicenseImage] = useState("");
  const [licenseUrl, setLicenseUrl] = useState("");
  const [licenseIcons, setLicenseIcons] = useState<string[]>([]);

  const [history, setHistory] = useState([]);

  const [visits, setVisits] = useState(0);
  const [saves, setSaves] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);

  const [canEdit, setCanEdit] = useState(false);
  const [editURL, setEditURL] = useState("");
  const [viewURL, setViewURL] = useState("");

  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.textContent = `header>div>div{max-width:unset !important}header+div>div{max-width:unset !important}header+div .page-wrapper>div{max-width:unset !important}`;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const { data: course } = await api.get(
          `/api/materials/v2/courses/${id}`
        );

        const t = course?.title || "";
        const abstract = course?.abstract || "";

        const updateDate = course?.modified_on || null;
        const createDate = course?.created_on || null;

        const canEditValue = !!course?.can_edit;
        const editUrlValue = course?.edit_url || "";
        const viewUrlValue = course?.url || "";

        setAuthors(listLabels(course?.authors));
        setProvider(pickLabel(course?.provider));
        setLanguages(listLabels(course?.languages));
        setFormats(listLabels(course?.media_formats));

        setCollections(
          course?.collections_titles || listLabels(course?.collections)
        );
        setKeywords(course?.keywords_names || listLabels(course?.keywords));

        setRate(course?.rating || course?.rate || "");
        setVisits(course?.visits || course?.views || 0);
        setSaves(course?.saves_count || course?.saves || 0);
        setDownloadsCount(course?.downloads_count || 0);
        setHistory(course?.history || []);

        setCanEdit(canEditValue);
        setEditURL(editUrlValue);
        setViewURL(viewUrlValue);

        const lic = course?.license_title;

        const licText =
          typeof lic === "string" ? lic : lic?.label || lic?.name || "";

        const licUrl = typeof lic === "object" && lic ? lic?.url || "" : "";

        let licImg = course?.license_image || "";
        if (licImg && licImg.startsWith("//")) licImg = `https:${licImg}`;

        setLicense(licText);
        setLicenseUrl(licUrl);
        setLicenseImage(licImg);

        if (!mounted) return;

        document.title = t
          ? `${t} | Digital Public Goods Library`
          : "Digital Public Goods Library";

        setTitle(t);
        setDesc(normalizeText(abstract));

        setThumbnail(
          course?.thumbnail ||
            "/static/newdesign/images/materials/default-thumbnail-index.png"
        );

        setSubjects(
          (course?.general_subjects || []).map((x) => x?.name).filter(Boolean)
        );
        setLevels(
          (course?.levels || [])
            .map((x) => x?.name || x?.short_name || x?.code || x?.slug)
            .filter(Boolean)
        );
        setGrades(
          (course?.grades || []).map((x) => x?.code || x?.name).filter(Boolean)
        );
        setMaterials(
          (course?.material_types || []).map((x) => x?.name).filter(Boolean)
        );

        setUpdate(
          updateDate ? new Date(updateDate).toDateString().substring(4) : ""
        );
        setCreate(
          createDate ? new Date(createDate).toDateString().substring(4) : ""
        );
        setDateAdded(
          createDate ? new Date(createDate).toLocaleDateString("en-US") : ""
        );
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) load();
    else setLoading(false);

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      "/static/newdesign/images/materials/default-thumbnail-index.png";
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", margin: "36px auto" }}
      >
        <Loader />
      </Box>
    );
  }

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
          flexDirection: { xs: "column", sm: "row" },
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
            mr: { xs: 0, sm: 3 },
            mb: { xs: 2, sm: 0 },
          }}
          onError={handleImageError}
        />

        <CardContent sx={{ flex: 1, width: "100%" }}>
          <Typography variant="h1" gutterBottom sx={{ fontSize: "32px" }}>
            {title}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <StarRating rate={rate} />
            <Typography variant="body2" color="text.secondary">
              ({rate || 0})
            </Typography>
          </Stack>

          {!!update && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              Updated {update}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={2}
            mb={2}
            sx={{ alignItems: "center" }}
          >
            <Typography variant="body2">{visits} Views</Typography>
            <Typography variant="body2">{saves} Saves</Typography>
            <Typography variant="body2">{downloadsCount} Downloads</Typography>
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            {canEdit && !!editURL && (
              <Button
                variant="contained"
                color="primary"
                href={editURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Edit
              </Button>
            )}

            <Button
              variant="contained"
              onClick={() =>
                viewURL && window.open(viewURL, "_blank", "noopener,noreferrer")
              }
              disabled={!viewURL}
              sx={{ fontWeight: "bold" }}
            >
              View Site
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* DETAILS ONLY (without View Resource) */}
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
            {!!subjects?.length && (
              <>
                <b>Subject:</b> {subjects?.join(", ")}
                <br />
              </>
            )}
            {!!levels?.length && (
              <>
                <b>Level:</b> {levels?.join(" / ")}
                <br />
              </>
            )}
            {!!grades?.length && (
              <>
                <b>Grades:</b> {grades.join(" / ")}
                <br />
              </>
            )}
            {!!materials?.length && (
              <>
                <b>Material Type:</b> {materials?.join(", ")}
                <br />
              </>
            )}
            {!!authors?.length && (
              <>
                <b>Author:</b> {authors?.join(", ")}
                <br />
              </>
            )}
            {!!provider && (
              <>
                <b>Provider:</b> {provider}
                <br />
              </>
            )}
            {!!dateAdded && (
              <>
                <b>Date Added:</b> {dateAdded}
                <br />
              </>
            )}
            {!!collections?.length && (
              <>
                <b>Collection:</b> {collections?.join(", ")}
                <br />
              </>
            )}
            {!!languages?.length && (
              <>
                <b>Language:</b> {languages?.join(", ")}
                <br />
              </>
            )}
            {!!formats?.length && (
              <>
                <b>Media Format:</b> {formats?.join(" / ")}
                <br />
              </>
            )}
            {license && (
              <span style={{ display: "inline-flex", alignItems: "center" }}>
                <b>License:</b>&nbsp;
                <span>{license}</span>
                {!!licenseImage && (
                  <>
                    &nbsp;
                    {licenseUrl ? (
                      <MuiLink
                        href={licenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        <img
                          src={
                            licenseImage.startsWith("//")
                              ? `https:${licenseImage}`
                              : licenseImage
                          }
                          alt={license}
                          style={{ height: 24 }}
                        />
                      </MuiLink>
                    ) : (
                      <img
                        src={
                          licenseImage.startsWith("//")
                            ? `https:${licenseImage}`
                            : licenseImage
                        }
                        alt={license}
                        style={{ height: 24 }}
                      />
                    )}
                  </>
                )}
              </span>
            )}
          </Typography>

          {!!keywords?.length && (
            <>
              <Box mt={2}>
                <b>Tags: </b>
              </Box>
              <Box mt={1} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
            </>
          )}
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: "none", sm: "block" } }}
        />

        <Box minWidth={240}>
          <Stack spacing={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <HistoryIcon color="action" />
              <Typography variant="body2" color="ark.mainFontColor">
                {history?.length || 0} Updates/Edits
                {create ? ` since first published ${create}` : ""}
              </Typography>
            </Box>

            {!!history?.length && (
              <Box display="flex" alignItems="center" gap={1}>
                <RemixIcon color="action" />
                <Typography variant="body2" color="ark.mainFontColor">
                  {history.length} History items
                </Typography>
              </Box>
            )}

            {!!history?.length && (
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
    </Box>
  );
}

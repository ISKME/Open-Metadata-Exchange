import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";

import styles from "./WidgetDashboard.module.scss";
import { generateDefaultContent } from "../constants";

export const WidgetDashboard: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [csrfToken, setCsrfToken] = useState<string>("");
  const [editingPageId, setEditingPageId] = useState<number | null>(null);
  const [editingPageName, setEditingPageName] = useState<string>("");
  const [openModal, setOpenModal] = useState(false);
  const [pageName, setPageName] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [editingImageName, setEditingImageName] = useState<string>("");

  // Open modal to create a new page
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Load pages and images on component mount
  useEffect(() => {
    axios
      .get("/api/csrf-token/")
      .then((response) => {
        setCsrfToken(response.data.token);
        return axios.get("/api/pages/v1/admin/");
      })
      .then((response) => setPages(response.data))
      .catch((error) =>
        console.error("Error loading pages or CSRF token:", error)
      );

    axios
      .get("/api/pages/v1/images/")
      .then((response) => setImages(response.data))
      .catch((error) => console.error("Error loading images:", error));
  }, []);

  // Delete page
  const handleDelete = (id: number) => {
    axios
      .delete(`/api/pages/v1/admin/${id}/`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      .then(() => {
        setPages(pages.filter((page) => page.id !== id));
        alert("Page deleted successfully");
      })
      .catch((error) => console.error("Error deleting page:", error));
  };

  // Edit page
  const handleEdit = (id: number) => {
    window.location.href = `/new/my/page/grapes/${id}`;
  };

  // Save new page and reload list
  const handleSave = () => {
    if (!pageName) {
      alert("Please enter a widget name");
      return;
    }

    const data = {
      name: pageName,
      content: JSON.stringify(generateDefaultContent()),
      styles: "",
      enabled,
    };

    axios
      .post("/api/pages/v1/admin/", data, {
        headers: {
          "X-CSRFToken": csrfToken,
          "Content-Type": "application/json",
        },
      })
      .then(() => {
        setOpenModal(false);
        // Reload the page list
        return axios.get("/api/pages/v1/admin/");
      })
      .then((response) => setPages(response.data))
      .catch((error) => console.error("Error saving widget:", error));
  };

  // Enable or disable a page
  const handleEnabledChange = (id: number, enabled: boolean) => {
    const updatedPages = pages.map((page) =>
      page.id === id ? { ...page, enabled } : page
    );
    setPages(updatedPages);

    const pageToUpdate = updatedPages.find((page) => page.id === id);
    if (pageToUpdate) {
      axios
        .put(`/api/pages/v1/admin/${id}/`, pageToUpdate, {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "application/json",
          },
        })
        .then(() => console.log("Page updated successfully"))
        .catch((error) => console.error("Error updating page:", error));
    }
  };

  // Edit page name in the list with auto-save
  const handleEditPageName = (id: number, newName: string) => {
    const pageToUpdate = pages.find((page) => page.id === id);
    if (pageToUpdate) {
      axios
        .put(
          `/api/pages/v1/admin/${id}/`,
          { ...pageToUpdate, name: newName },
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          setPages(
            pages.map((page) =>
              page.id === id ? { ...page, name: newName } : page
            )
          );
          setEditingPageId(null);
        })
        .catch((error) => console.error("Error updating page name:", error));
    }
  };

  // Add new image
  const handleAddNewImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length === 1) {
      const formData = new FormData();
      formData.append("image", files[0]);

      axios
        .post("/api/pages/v1/images/", formData, {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setImages([response.data, ...images]);
        })
        .catch((error) => console.error("Error uploading image:", error));
    } else {
      alert("Please select only one file.");
    }
  };

  // Delete image
  const handleDeleteImage = (id: number) => {
    axios
      .delete(`/api/pages/v1/images/${id}/`, {
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      .then(() => {
        setImages(images.filter((image) => image.id !== id));
        alert("Image deleted successfully");
      })
      .catch((error) => console.error("Error deleting image:", error));
  };

  // Edit image name with auto-save
  const handleEditImageName = (id: number) => {
    const imageToUpdate = images.find((image) => image.id === id);
    if (imageToUpdate) {
      const formData = new FormData();
      formData.append("name", editingImageName);

      axios
        .put(`/api/pages/v1/images/${id}/`, formData, {
          headers: {
            "X-CSRFToken": csrfToken,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          setImages(
            images.map((image) =>
              image.id === id ? { ...response.data } : image
            )
          );
          setEditingImageId(null);
        })
        .catch((error) => console.error("Error updating image name:", error));
    }
  };

  return (
    <div className={`container ${styles.dashboardContainer}`}>
      <h1 className={styles.title}>Page Dashboard</h1>

      {/* Modal for creating a new page */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Enter Page Name</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Page Name"
            fullWidth
            value={pageName}
            onChange={(e) => setPageName(e.target.value)}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enabled"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Page list */}
      <div className={styles.widgetList}>
        <div className={styles.widgetExisting}>
          <h2>Existing Pages</h2>
          <button
            onClick={() => {
              handleOpenModal();
              setPageName("");
            }}
            className="btn btn-primary"
          >
            Add new page
          </button>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td>
                    {editingPageId === page.id ? (
                      <div className={styles.editingPageName}>
                        <input
                          type="text"
                          value={editingPageName}
                          onChange={(e) => setEditingPageName(e.target.value)}
                          onBlur={() =>
                            handleEditPageName(page.id, editingPageName)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleEditPageName(page.id, editingPageName);
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className={styles.pageName}
                        onClick={() => {
                          setEditingPageId(page.id);
                          setEditingPageName(page.name);
                        }}
                      >
                        <span title={page.name}>{page.name}</span>
                        <EditIcon />
                      </div>
                    )}
                  </td>
                  <td>
                    <Switch
                      checked={page.enabled}
                      onChange={(e) =>
                        handleEnabledChange(page.id, e.target.checked)
                      }
                      color="primary"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(page.id)}
                      className="btn btn-warning"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image list */}
      <div className={styles.widgetList}>
        <div className={styles.widgetExisting}>
          <h2>Images</h2>
          <label className="custom-file-upload btn btn-primary">
            <input
              type="file"
              accept="image/*"
              onChange={handleAddNewImages}
              style={{ display: "none" }}
            />
            Add new image
          </label>
        </div>
        <div className={styles.tableWrapper}>
          {images.map((image) => (
            <div key={image.id} className={styles.imageItem}>
              <div className={styles.imageDetail}>
                <img
                  src={image.image_url}
                  alt={image.name}
                  className={styles.image}
                />
              </div>
              {editingImageId === image.id ? (
                <input
                  type="text"
                  value={editingImageName}
                  onChange={(e) => setEditingImageName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditImageName(image.id);
                    }
                  }}
                  onBlur={() => {
                    setEditingImageId(null);
                    setEditingImageName("");
                  }}
                />
              ) : (
                <div
                  className={styles.editImageName}
                  onClick={() => {
                    setEditingImageId(image.id);
                    setEditingImageName(image.name);
                  }}
                >
                  <p> {image.name} </p>
                  <EditIcon />
                </div>
              )}
              <button
                onClick={() => handleDeleteImage(image.id)}
                className={`btn btn-danger ${styles.delete}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EditIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    fill="currentColor"
    className="bi bi-pencil-fill"
    viewBox="0 0 16 16"
  >
    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
  </svg>
);

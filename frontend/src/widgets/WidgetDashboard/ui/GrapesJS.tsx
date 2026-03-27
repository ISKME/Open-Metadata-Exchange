import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import GjsEditor, {
  AssetsProvider,
  Canvas,
  ModalProvider,
} from "@grapesjs/react";
import { ThemeProvider } from "@mui/material/styles";
import { MAIN_BORDER_COLOR } from "./components/common";
import CustomModal from "./components/CustomModal";
import CustomAssetManager from "./components/CustomAssetManager";
import Topbar from "./components/Topbar";
import RightSidebar from "./components/RightSidebar";
import "./WidgetDashboard.module.scss";
import type { StorageManagerConfig } from "grapesjs";

import { customPlugins } from "../utils/plugins";
import { THEME, getGJSOptions } from "../constants";

const fetchImageUrls = async (): Promise<string[]> => {
  const response = await axios.get("/api/pages/v1/images/");
  return response.data.map((image: any) => image.image_url);
};

export default function DefaultEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const storageManager = getGJSOptions.storageManager as StorageManagerConfig;

    (storageManager.options.remote.onLoad = (result) => {
      return JSON.parse(result.content);
    }),
      axios.get("/api/csrf-token/").then((response) => {
        const storageManager =
          getGJSOptions.storageManager as StorageManagerConfig;
        storageManager.options.remote.fetchOptions = (opts) => {
          if (opts.method !== "GET") {
            return {
              ...opts,
              method: "PUT",
              headers: {
                "X-CSRFToken": response.data.token,
                "Content-Type": "application/json",
              },
            };
          }
        };
      });
  }, []);

  useEffect(() => {
    const storageManager = getGJSOptions.storageManager as StorageManagerConfig;

    storageManager.options.remote.urlLoad = `/api/pages/v1/admin/${id || ""}`;
    storageManager.options.remote.urlStore = `/api/pages/v1/admin/${id || ""}/`;
    storageManager.options.remote.onLoad = async (data, _editor) => {
      let projectData = JSON.parse(data.content);
      projectData.assets = await fetchImageUrls();
      return projectData;
    };
  }, [id]);

  useEffect(() => {
    const storageManager = getGJSOptions.storageManager as StorageManagerConfig;
    storageManager.options.remote.onStore = (data) => ({
      id: id,
      content: JSON.stringify(data),
      // @ts-ignore
      html_content: window?.grapesjs?.editors[0].editor?.getHtml(),
      // @ts-ignore
      styles: window?.grapesjs?.editors[0].editor?.getCss(),
    });
  }, [id]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSave = async () => {
    const storageManager = getGJSOptions.storageManager as StorageManagerConfig;
    const fetchOptions = storageManager.options.remote.fetchOptions;
    const headers = typeof fetchOptions === 'function'
      ? fetchOptions({}).headers["X-CSRFToken"]
      : null;

    if (!headers) {
      console.error("CSRF token not found");
      return;
    }

    // @ts-ignore
    const editorInstance = window?.grapesjs?.editors[0];

    if (!editorInstance || !editorInstance.getProjectData()) {
      console.error("Editor instance or project data is missing");
      return;
    }

    try {
      await axios.put(`/api/pages/v1/admin/${id}/`, {
        id: id,
        content: JSON.stringify(editorInstance.getProjectData()),
        html_content: editorInstance.editor.getHtml(),
        styles: editorInstance.editor.getCss(),
      }, {
        headers: {
          "X-CSRFToken": headers,
          "Content-Type": "application/json",
        },
      });
      editorInstance.clearDirtyCount();
      alert("Saved successfully!");
      navigate("/new/my/page/dashboard/");
    } catch (error) {
      console.error("Error while saving:", error);
    }
  };

  return (
    <div>
      <ThemeProvider theme={THEME}>
        <GjsEditor
          className="gjs-custom-editor text-white bg-slate-900"
          grapesjs="https://unpkg.com/grapesjs"
          grapesjsCss="https://unpkg.com/grapesjs/dist/css/grapes.min.css"
          options={getGJSOptions}
          plugins={[
            {
              id: "gjs-blocks-basic",
              src: "https://unpkg.com/grapesjs-blocks-basic",
            },
            customPlugins,
          ]}
        >
          <div className={`flex h-full border-t ${MAIN_BORDER_COLOR}`}>
            <div className="gjs-column-m flex flex-col flex-grow">
              <Topbar className="min-h-[48px]" />
              <Canvas className="flex-grow gjs-custom-editor-canvas" />
            </div>
            <RightSidebar
              className={`gjs-column-r w-[300px] border-l ${MAIN_BORDER_COLOR}`}
            />
          </div>
          <ModalProvider>
            {({ open, title, content, close }) => (
              <CustomModal
                open={open}
                title={title}
                children={content}
                close={close}
              />
            )}
          </ModalProvider>
          <AssetsProvider>
            {({ assets, select, close, Container }) => (
              <Container>
                <CustomAssetManager
                  assets={assets}
                  select={select}
                  close={close}
                />
              </Container>
            )}
          </AssetsProvider>
        </GjsEditor>
        <button
          onClick={handleSave}
          className="m-2 p-2 bg-blue-500 text-white"
        >
          Save
        </button>
        <button
          onClick={() => navigate(`/new/my/page/dashboard/`)}
          className="m-2 p-2 text-grey"
        >
          Cancel
        </button>
      </ThemeProvider>
    </div>
  );
}

import { createTheme } from "@mui/material/styles";
import type { EditorConfig } from "grapesjs";
import { v4 as uuidv4 } from "uuid";

export const THEME = createTheme({
  palette: {
    mode: "dark",
  },
});

export const getGJSOptions: EditorConfig = {
  height: "100vh",
  storageManager: {
    type: "remote",
    stepsBeforeSave: 1000000,
    options: {
      remote: {},
    },
  },
  undoManager: { trackSelection: false },
  selectorManager: { componentFirst: true },
};

export const generateDefaultContent = () => {
  return {
    assets: [],
    styles: [],
    pages: [
      {
        frames: [
          {
            component: {
              type: "wrapper",
              stylable: [
                "background",
                "background-color",
                "background-image",
                "background-repeat",
                "background-attachment",
                "background-position",
                "background-size",
              ],
              head: {
                type: "head",
              },
              docEl: {
                tagName: "html",
              },
            },
            id: uuidv4(),
          },
        ],
        type: "main",
        id: uuidv4(),
      },
    ],
    symbols: [],
    dataSources: [],
  };
};

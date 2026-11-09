declare module '*.scss' {
    interface IClassNames {
        [className: string]: string
    }
    const classNames: IClassNames;
    export = classNames;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg' {
    import React from 'react';

    const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
    export default SVG;
}

declare const __IS_DEV__: boolean;

// Globals that the server-rendered pages around the React app can set.
// ESLint's core no-unused-vars does not understand declaration merging or parameter names in types.
/* eslint-disable no-unused-vars */
interface Window {
    StatusMessage?: {
        success: (msg: string) => void;
        error: (msg: string) => void;
    };
    googleapiShowPicker?: (
        onSelect: (docId: string, accessToken: string) => void,
        onCancel: () => void,
    ) => void;
    CKEDITOR_4_LICENSE_KEY?: string;
    GOOGLE_DOCS_IMPORT_URL?: string;
}
/* eslint-enable no-unused-vars */

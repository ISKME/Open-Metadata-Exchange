import { CKEditor } from 'ckeditor4-react';
import { useState, useRef } from 'react';
import { BlockUI } from '../BlockUI/BlockUI';
import req from 'shared/lib/req';

const plugins = [
  "about",
  "basicstyles",
  "blockquote",
  "clipboard",
  "contextmenu",
  "enterkey",
  "entities",
  "floatingspace",
  "format",
  "indentblock",
  "indentlist",
  "justify",
  "link",
  "list",
  "notificationaggregator",
  // "quicktable",
  "resize",
  "tabletools",
  "tableresize",
  "toolbar",
  "undo",
  "wysiwygarea",
  "pastefromword",
  "uploadfile",
  // "a11ychecker",
  "video",
  "image2",
  "uploadimage",
  "filebrowser",
  "showblocks",
  // "abbr",
  "mathjax",
];

const config = {
  uiColor: "#FAFAFA",
  toolbar: [
    { name: 'document', items: [ 'A11ychecker' ] },
    { name: 'clipboard', items: [ 'PasteFromWord', 'Undo', "Redo" ] },
    { name: 'styles', items: [ 'Format' ] },
    { name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'] },
    { name: 'paragraph', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
    { name: 'links', items: [ 'Link', 'Unlink' ] },
    { name: 'insert', items: [ 'Image', 'Table', 'Video', 'Mathjax', 'Abbr' ] },
    { name: 'tools', items: [ 'ShowBlocks' ] }, 
  ],
  removeButtons: "Cut,Copy,Paste,JustifyBlock,Anchor,About",
  format_tags: "p;h1;h2;h3;h4;pre",
  indentClasses: ["indent-1", "indent-2", "indent-3"],
  plugins: plugins.join(','),
  oembedUrl: '/oembed/client',
  uploadUrl: '/editor/documents/upload',
  imageUploadUrl: '/editor/images/upload',
  filebrowserBrowseUrl: '/editor/file-browser',
  filebrowserUploadUrl: '/editor/file-browser',
  filebrowserImageBrowseUrl: '/editor/file-browser',
  filebrowserImageUploadUrl: '/editor/images/upload',
  filebrowserVideoBrowseUrl: '/editor/file-browser',
  filebrowserVideoUploadUrl: '/editor/videos/upload',
  filebrowserLinkBrowseUrl: '/editor/document-browser',
  filebrowserLinkUploadUrl: '/editor/documents/upload',
  kalturaUploadInitUrl: '/editor/videos/upload/init',
  kalturaUploadAddUrl: '/editor/videos/upload/add',
  image2_altRequired: true,
  contentsLangDirection: 'ltr',
  stylesSet: false,
  qtWidth: "100%",
  allowedContent: true,
  mathJaxLib: "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
  height: 425,
  useComputedState: false,
  language: 'en',
}

export function CKEditorWidget({ content, onChange }) {
  const [importing, setImporting] = useState(false);
  const editorRef = useRef(null);
  const googleAPI = window['googleapiShowPicker'];

  const onGoogleFileSelect = (docId, accessToken) => {
    setImporting(true);
    req.post(window['GOOGLE_DOCS_IMPORT_URL'], {doc_id: docId, access_token: accessToken}, true).then((data: {body: string}) => {
      editorRef.current?.setData(data.body);
      setImporting(false);
    }).catch(error => {
      setImporting(false);
      console.error(error);
    })
  }

  const onGoogleFileCancel = () => {
  }

  const importFromGoogle = (e) => {
    e.preventDefault();
    googleAPI(onGoogleFileSelect, onGoogleFileCancel);
  }

  return (
    <>
    { importing && <BlockUI /> }
    <CKEditor config={ config }
              initData={ content }
              onChange={onChange} onInstanceReady={(e) => {
                editorRef.current = e.editor
              }}
    />
    <button type="button" className="btn btn-ckeditor-import mod-google-drive" onClick={importFromGoogle}>Import from Google Drive</button>
    </>
  )
}
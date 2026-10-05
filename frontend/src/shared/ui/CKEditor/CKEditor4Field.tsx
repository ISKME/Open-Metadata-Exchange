import { useState } from 'react';
import { CKEditorWidget } from './CKEditor4';

interface CKEditor4FieldProps {
  name: string;
  content: string;
  documentUploadUrl?: string;
  documentBrowserUrl?: string;
  imageUploadUrl?: string;
  oembedUrl?: string;
  fileBrowserUrl?: string;
  fileBrowserImageUrl?: string;
  fileBrowserVideoUrl?: string;
  kalturaUploadInitUrl?: string;
  kalturaUploadAddUrl?: string;
  googleDocsImportUrl?: string;
}

// Standalone, name-based CKEditor 4 form field: a hidden input carries the value so a
// normal (non-React) <form> submit picks it up, the same role the legacy CKEditor 4
// widget's own textarea played. All editor config is passed in directly as props
// (sourced from explicit web component attributes), not read off any other element.
export function CKEditor4Field({
  name,
  content,
  documentUploadUrl,
  documentBrowserUrl,
  imageUploadUrl,
  oembedUrl,
  fileBrowserUrl,
  fileBrowserImageUrl,
  fileBrowserVideoUrl,
  kalturaUploadInitUrl,
  kalturaUploadAddUrl,
  googleDocsImportUrl,
}: CKEditor4FieldProps) {
  const [value, setValue] = useState(content);

  if (googleDocsImportUrl) {
    window['GOOGLE_DOCS_IMPORT_URL'] = googleDocsImportUrl;
  }

  const config = {
    uploadUrl: documentUploadUrl || '',
    filebrowserLinkBrowseUrl: documentBrowserUrl || '',
    filebrowserLinkUploadUrl: documentUploadUrl || '',
    imageUploadUrl: imageUploadUrl || '',
    filebrowserImageUploadUrl: imageUploadUrl || '',
    oembedUrl: oembedUrl || '',
    filebrowserBrowseUrl: fileBrowserUrl || '',
    filebrowserUploadUrl: fileBrowserUrl || '',
    filebrowserImageBrowseUrl: fileBrowserImageUrl || fileBrowserUrl || '',
    filebrowserVideoBrowseUrl: fileBrowserVideoUrl || fileBrowserUrl || '',
    filebrowserVideoUploadUrl: fileBrowserVideoUrl || '',
    kalturaUploadInitUrl: kalturaUploadInitUrl || '',
    kalturaUploadAddUrl: kalturaUploadAddUrl || '',
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <CKEditorWidget
        content={content}
        config={config}
        googleImport={!!googleDocsImportUrl}
        onChange={(e) => setValue(e.editor.getData())}
      />
    </>
  );
}

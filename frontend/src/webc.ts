import { OAEditor, QAEditorAction, OAEditorDesc } from 'widgets/OAEditor';
import { MFABackupTokens } from 'widgets/MFA';
import { DS } from 'widgets/MFA/lib/styles';
import { VideoAnnotationEditor } from 'widgets/VideoAnnotationEditor';
import { CKEditor4Field } from 'shared/ui/CKEditor/CKEditor4Field';
import defineWebComponent from 'shared/lib/webc';

defineWebComponent('oa-editor', OAEditor, ['content-id', 'video-upload-strategy'], (wc) => {
  const content = document.getElementById(wc.getAttribute('content-id') as string)?.textContent;

  return {
    lesson: JSON.parse(content || '{}'),
    videoUploadStrategy: wc.getAttribute('video-upload-strategy') || undefined,
  };
});

defineWebComponent('oa-editor-action', QAEditorAction, ['title', 'event', 'class-name', 'next-url', 'action'], (wc) => {
  return {
    title: wc.getAttribute('title'),
    event: wc.getAttribute('event'),
    className: wc.getAttribute('class-name'),
    nextURL: wc.getAttribute('next-url'),
    action: wc.getAttribute('action'),
  };
});

defineWebComponent('oa-editor-desc', OAEditorDesc, ['content-id', 'video-upload-strategy'], (wc) => {
  const content = document.getElementById(wc.getAttribute('content-id') as string)?.textContent;

  return {
    lesson: JSON.parse(content || '{}'),
    videoUploadStrategy: wc.getAttribute('video-upload-strategy') || undefined,
  };
});

defineWebComponent('mfa-backup-token', MFABackupTokens, [], (wc) => {
  return { ds: DS(1.4) };
});

defineWebComponent('video-annotation-editor', VideoAnnotationEditor, ['video-url', 'video-vtt', 'inline', 'edit-url'], (wc) => {
  return {
    videoUrl: wc.getAttribute('video-url'),
    videoVTT: wc.getAttribute('video-vtt'),
    inline: wc.hasAttribute('inline'),
    editUrl: wc.getAttribute('edit-url') || undefined,
  };
});

const attr = (wc: HTMLElement, name: string) => wc.getAttribute(name) || undefined;

defineWebComponent('ckeditor4-field', CKEditor4Field, [
  'name',
  'content-id',
  'document-upload-url',
  'document-browser-url',
  'image-upload-url',
  'oembed-url',
  'file-browser-url',
  'file-browser-image-url',
  'file-browser-video-url',
  'kaltura-upload-init-url',
  'kaltura-upload-add-url',
  'google-docs-import-url',
], (wc) => {
  const contentId = wc.getAttribute('content-id');
  const content = contentId ? document.getElementById(contentId)?.textContent : null;

  return {
    name: wc.getAttribute('name'),
    content: content ? JSON.parse(content) : '',
    documentUploadUrl: attr(wc, 'document-upload-url'),
    documentBrowserUrl: attr(wc, 'document-browser-url'),
    imageUploadUrl: attr(wc, 'image-upload-url'),
    oembedUrl: attr(wc, 'oembed-url'),
    fileBrowserUrl: attr(wc, 'file-browser-url'),
    fileBrowserImageUrl: attr(wc, 'file-browser-image-url'),
    fileBrowserVideoUrl: attr(wc, 'file-browser-video-url'),
    kalturaUploadInitUrl: attr(wc, 'kaltura-upload-init-url'),
    kalturaUploadAddUrl: attr(wc, 'kaltura-upload-add-url'),
    googleDocsImportUrl: attr(wc, 'google-docs-import-url'),
  };
});

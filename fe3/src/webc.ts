import { OAEditor, QAEditorAction } from 'widgets/OAEditor';
import defineWebComponent from 'shared/lib/webc';

defineWebComponent('oa-editor', OAEditor, ['content-id'], (wc) => {
  const content = document.getElementById(wc.getAttribute('content-id')).textContent;

  return {
    lesson: JSON.parse(content || '{}'),
  };
});

defineWebComponent('oa-editor-action', QAEditorAction, ['title', 'event', 'class-name', 'next-url'], (wc) => {
  return {
    title: wc.getAttribute('title'),
    event: wc.getAttribute('event'),
    className: wc.getAttribute('class-name'),
    nextURL: wc.getAttribute('next-url'),
  };
});

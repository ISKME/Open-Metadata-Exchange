import { useState, useRef } from 'react';
import req from 'shared/lib/req';

function RelatedResourceForm({
  resource, closeCallback, beforeSubmitCallback, afterSubmitCallback,
}) {
  const [title, setTitle] = useState(resource?.title || '');
  const [url, setURL] = useState(resource?.url || '');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    const data = {
      title,
      url,
      file: fileInputRef.current?.files?.[0] || null,
    };
    beforeSubmitCallback(resource).then(({ submitMethod, submitURL }) => {
      req[submitMethod](submitURL, data, true).then((data) => {
        afterSubmitCallback(submitMethod, data);
      });
    });
  };

  return (
    <div className="related-resource-form">
      <div>
        <div className="related-resource-form-row">
          <span className="related-resource-form-row-number">1.</span>
          <strong className="related-resource-form-row-label">
            {resource?.file ? 'Replace' : 'Add'}
&nbsp;
            {resource?.file ? (<a href={resource.file} target="_blank" rel="noopener">Resource</a>) : 'Resource'}
            *:
          </strong>
          <div className="related-resource-form-file-input">
            <div className="form-group">
              <label className="control-label">
                File
              </label>
              <div className="controls">
                <input type="file" ref={fileInputRef} />
              </div>
            </div>
          </div>
          <span className="related-resource-form-row-number">or</span>
          <span className="related-resource-form-row-label">Add URL:</span>
          <div className="related-resource-form-text-input">
            <div className="form-group">
              <label className="control-label">
                URL
              </label>
              <div className="controls">
                <input type="url" className="form-control urlinput" value={url} onChange={(e) => setURL(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="related-resource-form-row">
          <span className="related-resource-form-row-number">2.</span>
          <strong className="related-resource-form-row-label">Name the Resource*:</strong>
          <div className="related-resource-form-text-input">
            <div className="form-group">
              <label className="control-label requiredField">
                Title
                <span className="asteriskField">*</span>
              </label>
              <div className="controls ">
                <input type="text" className="form-control textinput" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
        <div className="related-resource-form-row">
          <span className="related-resource-form-row-number">3.</span>
          <button className="btn btn-primary" type="submit" onClick={handleSave}>Save</button>
          <button className="btn btn-link" type="button" onClick={closeCallback}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function RelatedResource({
  resource = null, beforeSubmitCallback, afterSubmitCallback = null, editCallback = null,
}) {
  const [resourceLoc, setResourceLoc] = useState(resource);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(resource?.title || '');

  const setEditMode = (editMode) => {
    setEditing(editMode);

    if (editCallback) {
      editCallback(editMode ? resource : null);
    }
  };

  const onClose = () => {
    setEditMode(false);
  };

  const onBeforeFormSubmit = (resource) => beforeSubmitCallback(resource);

  const onAfterFormSubmit = (method, data) => {
    setEditMode(false);
    setTitle(data.title);

    if (method === 'put') {
      // Update local instance of resource only if modify an existing instance.
      // If we update it after a resource creation, it will be available on the "Add new resource" widget.
      setResourceLoc(data);
    }

    if (afterSubmitCallback) {
      afterSubmitCallback(method, data);
    }
  };

  const onDelete = () => {
    onBeforeFormSubmit(resource).then(({ submitURL }) => {
      req.del(submitURL).then(() => {
        if (afterSubmitCallback) {
          afterSubmitCallback('delete', resource);
        }
      });
    });
  };

  return (
    <>
      <div className="saved-related-resource-ct mod-opened" data-resource-id="None">

        {resource && !editing && (
          <div className="saved-related-resource">
            <button className="btn btn-link saved-related-resource-delete" type="button" aria-label="Remove related resource" onClick={onDelete}>
              <i className="fa fa-times-circle" />
            </button>
            <a href={resource.download_url || resource.url} className="saved-related-resource-link" target="_blank" rel="noopener">
              <i className={resource.icon_class} />
              <p className="saved-related-resource-name">{title || 'Untitled'}</p>
            </a>
            <button className="btn btn-link saved-related-resource-edit" type="button" onClick={() => setEditMode(true)}>
              <i className="fa fa-pencil" />
              <span className="saved-related-resource-edit-title">Edit</span>
            </button>
          </div>
        )}

        {editing && (
          <RelatedResourceForm
            resource={resourceLoc}
            closeCallback={onClose}
            beforeSubmitCallback={onBeforeFormSubmit}
            afterSubmitCallback={onAfterFormSubmit}
          />
        )}
      </div>

      {!resource && !editing && (
      // New Related Resource Button
        <button className="related-resources-add-btn" type="button" aria-label="Add related resource" onClick={() => setEditMode(true)}>
          <i className="fa fa-paperclip" />
        </button>
      )}
    </>
  );
}

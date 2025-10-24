import { useState } from 'react';
import { CKEditorWidget } from 'shared/ui/CKEditor/CKEditor4';
import { BlockUI, buiStyle } from 'shared/ui/BlockUI/BlockUI';
import { ISection } from 'entities/Lesson';
import req from 'shared/lib/req';

import cls from './OAEditor.module.scss';

export function OASection({ section, number, totalNumber, onChange, onSectionMove, onSectionDelete, createURL, RelatedResourceWidget }) {
  const [sectionLoc, setSectionLoc] = useState(section);
  const [isNew, setIsNew] = useState(section.is_new || false);
  const [opened, setOpened] = useState(number == 1);
  const [name, setName] = useState(section.name);
  const [content, setContent] = useState(section.content);
  const [teacherDescription, setTeacherDescription] = useState(section.teacher_description);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [attachments, setAttachments] = useState(section.attachments || []);
  const [editableAttachment, setEditableAttachment] = useState(null);
  const [processingAttachment, setProcessingAttachment] = useState(false);

  const fieldHandlers = {
    name: setName,
    content: setContent,
    teacher_description: setTeacherDescription,
  }

  const handleChange = (field, value, newSection: ISection | null = null, replace = false) => {
    const currentSection = newSection || sectionLoc;
    const handler = fieldHandlers[field];
    if (handler) {
      handler(value);
    }
    currentSection[field] = value;
    onChange(section, currentSection, replace);
  }

  const toggleOpened = (e) => {
    e.preventDefault();
    setOpened(!opened);
  }

  const moveSection = (offset) => {
    onSectionMove(number - 1, offset);
  }

  const deleteSection = () => {
    onSectionDelete(number - 1);
  }

  const attachmentOnBeforeSubmit = (attachment) => {
    setProcessingAttachment(true);

    return new Promise((resolve, reject) => {
      if (!isNew) {
        // Processing existing section.
        const submitURL = !!attachment?.update_url ? attachment.update_url : sectionLoc.attachment_create_url;
        const submitMethod = attachment ? 'put' : 'post';
        resolve({ submitURL: submitURL, submitMethod: submitMethod });
      } else {
        // Section does not exist yet, creating it first.
        req.post(createURL, { ...section, number }).then((data: ISection) => {
          setIsNew(false);
          setSectionLoc(data);
          onChange(section, { ...data, is_new: false });
          // Once section is created, use it to create attachment.
          resolve({ submitURL: data.attachment_create_url, submitMethod: 'post' });
        }).catch((e) => {
          reject('An error occurred during the creation of a Resource. Please, try later.');
          console.error(e);
        })
      }
    })
  }

  const attachmentOnAfterSubmit = (method, attachment) => {
    setProcessingAttachment(false);
    setEditableAttachment(null);

    if (method === 'post') {
      // Add new attachment
      setAttachments([...attachments, attachment]);
    }
    if (method === 'delete') {
      setAttachments(attachments.filter(att => att.id !== attachment.id));
    }
  }

  return(
    <div className={`lesson-task editable-task ${opened ? 'is-opened' : ''}`}>
      <div>
        {!confirmDelete && (<div className={`${cls['editable-task-buttons']} editable-task-buttons mod-right`}>
          <button type="button" className="btn btn-icon" title="Move up" onClick={() => moveSection(-1)} disabled={number === 1}>
            <i className="fa fa-arrow-up"></i>
            </button>
          <button type="button" className="btn btn-icon" title="Move down" onClick={() => moveSection(1)} disabled={number === totalNumber}>
            <i className="fa fa-arrow-down"></i>
          </button>
          <button type="button" className="btn btn-icon btn-task-delete" title="Delete Section" onClick={() => setConfirmDelete(true)}>
            <i className="fa fa-remove"></i>
          </button>
        </div>)}
        {confirmDelete && (
          <div className="alert alert-danger task-delete-confirmation" style={{ display: 'block' }}>
            <div className="task-delete-confirmation-text">
              <strong>Delete this Section?</strong> This action cannot be undone.
            </div>
            <div className="task-delete-confirmation-buttons">
              <button className="btn btn-danger" type="button" onClick={deleteSection}>Yes, delete</button>
              <button className="btn btn-link" type="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      <div className="task-preview">
        <h1 className="lesson-task-title">
          <a href="#" onClick={toggleOpened}>
            <i className="fa fa-chevron-down">&nbsp;</i>
            <i className="fa fa-chevron-up">&nbsp;</i>
            <span>Section</span> <span>{number}</span>
          </a>
        </h1>
        <div className={opened ? 'hidden' : ''}>
          <input className="form-control textinput" type="text" value={name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
      </div>
      <div className={`task-form ${!opened ? 'hidden' : ''}`}>
        <div className="form-group">
          <label htmlFor="id_name" className="control-label">
            Section Name
          </label>
          <div className="controls">
            <input className="form-control textinput" type="text" name="name" id="id_name" value={name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
        </div>
        <div className="steps-formset">
          <div className="step-form">
            <div className="lesson-step-student-content">
              <div className="form-group">
                <label htmlFor="id_step-0-student_content" className="control-label">
                  Main Content
                </label>
                <div className="controls">
                  <CKEditorWidget content={content} onChange={(e) => handleChange('content', e.editor.getData())} />
                </div>
              </div>
              {/* BEGIN Attachments block */}
              <div className="related-resources-formset" style={buiStyle.uiBox}>
                {processingAttachment && <BlockUI />}
                <h2 className="related-resources-formset-title">
                  <span>Attach Section {number} Resources</span>
                </h2>
                <div className="related-resources-forms-ct">
                  {attachments.map(attachment => {
                    return ((!editableAttachment || editableAttachment.id == attachment.id) &&
                      <RelatedResourceWidget key={attachment.id}
                                             resource={attachment}
                                             beforeSubmitCallback={attachmentOnBeforeSubmit}
                                             afterSubmitCallback={attachmentOnAfterSubmit}
                                             editCallback={setEditableAttachment}
                        />
                    )
                  })}
                  {!editableAttachment && (
                    <RelatedResourceWidget beforeSubmitCallback={attachmentOnBeforeSubmit}
                                           afterSubmitCallback={attachmentOnAfterSubmit}
                    />
                  )}
                </div>
              </div>
              {/* END Attachments block */}
            </div>
            {/* BEGIN Instructor notes block */}
            <div className="lesson-step-instructor-content mod-expanded ">
              <p className="lesson-step-instructor-content-help">Instructor Notes (Optional)</p>
              <p className="lesson-step-instructor-content-help mod-lite">Add comments and other content that will only be visible in the Instructor View</p>
              <div className="lesson-step-instructor-content-ct">
                <div className="form-group">
                  <div className="controls">
                    <CKEditorWidget content={teacherDescription} onChange={(e) => handleChange('teacher_description', e.editor.getData())} />
                  </div>
                </div>
              </div>
            </div>
            {/* END Instructor notes block */}
          </div>
        </div>
      </div>
    </div>
  )
}
import { useEffect, useState, useRef } from 'react';

import { ILesson } from 'entities/Lesson';
import { OATitleForm, OAImageForm, ImagePreviewContainer } from 'entities/OAEditor';
import { CKEditorWidget } from 'shared/ui/CKEditor/CKEditor4';
import { MDSelect, MDCreatable } from 'entities/Metadata';
import { LicenseSelect } from 'entities/ConditionsOfUse';
import { AlignmentWidget } from 'widgets/Align';
import { BlockUI, buiStyle } from 'shared/ui/BlockUI/BlockUI';
import req from 'shared/lib/req';

export function OAEditorDesc({ lesson }) {
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const lessonRef = useRef(lesson);

  const onLessonChange = (field, value) => {
    lesson[field] = value;
  }

  const onSubmitHandler = (e: any) => {
    setProcessing(true);
    const action = e?.detail?.action || 'save';
    const currentLesson = lessonRef.current;
    const payload = {
      title: currentLesson.title,
      license_title: currentLesson.license_title,
      teacher_overview: currentLesson.teacher_overview,
      general_subjects: currentLesson.general_subjects,
      levels: currentLesson.levels,
      material_types: currentLesson.material_types,
      languages: currentLesson.languages,
      alignment_tags: currentLesson.alignment_tags,
      media_formats: currentLesson.media_formats,
      educational_use: currentLesson.educational_use,
      primary_user: currentLesson.primary_user,
      accessibility: currentLesson.accessibility,
      keywords: currentLesson.keywords,
      action: action,
    };
    req.put(lesson.edit_url, payload).then((data: ILesson) => {
      setErrors({});
      if (data.edit_next_url) {
        location.href = data.edit_next_url;
      }
    })
    .catch((err) => {
      setErrors(err || {});
    })
    .finally(() => { setProcessing(false) });
  }

  const publish = () => {
    document.dispatchEvent(new CustomEvent('oa:submit', { detail: { action: 'next' } }));
  }

  useEffect(() => { lessonRef.current = lesson; }, [lesson]);

  useEffect(() => {
    document.addEventListener('oa:submit', onSubmitHandler);

    return () => {
      document.removeEventListener('oa:submit', onSubmitHandler);
    };
  }, []);

  const FormGroup = ({ field, label, required=true }) => {
    const fieldErrors = errors[field] || null;

    return (
      <div className={'form-group' + (fieldErrors ? ' has-error' : '')}>
        <MDSelect metadata={lesson[field] || []}
                  options={lesson[`${field}_choices`] || []}
                  onChange={(value) => onLessonChange(field, value)}
                  label={label}
                  required={required}
        />
        {fieldErrors && <p className="form-error help-block"><strong>This field is required.</strong></p>}
      </div>
    )
  }

  return (
    <div style={buiStyle.uiBox}>
      {processing && (<BlockUI text='Saving...'/>)}
      <OATitleForm lesson={lesson} onChange={onLessonChange} cssMod='mod-gray' />
      <p className="lesson-editor-describe-title">Describe Resource</p>
      <div className="row">
        <div className="col-md-9">
          <div className="form-group">
            <label>Overview*</label>
            <div className="controls">
              <CKEditorWidget content={lesson.teacher_overview}
                              onChange={(e) => onLessonChange('teacher_overview', e.editor.getData())}
                              googleImport={false}
                              config={{ height: 200 }}
              />
            </div>
          </div>
          <LicenseSelect license={lesson.license_title} onChange={(option) => onLessonChange('license_title', option.value)} />
          <p className="lesson-editor-describe-subtitle">Help make this discoverable to others</p>
          <FormGroup field="general_subjects" label="Subjects" />
          <FormGroup field="levels" label="Education Levels" />
          <FormGroup field="material_types" label="Material Types" />
          <FormGroup field="languages" label="Languages" />
          <p className="lesson-editor-describe-subtitle">
            Additional Descriptions <span className="lesson-editor-describe-subtitle mod-lite">(Optional)</span>
          </p>
          <div className="form-group">
            <AlignmentWidget alignmentTags={lesson.alignment_tags} onChange={(value) => onLessonChange('alignment_tags', value)} />
          </div>
          <FormGroup field="media_formats" label="Media formats" required={false} />
          <FormGroup field="educational_use" label="Educational Use" required={false} />
          <FormGroup field="primary_user" label="Primary User" required={false} />
          <FormGroup field="accessibility" label="Accessibility" required={false} />
          <div className="form-group">
            <MDCreatable metadata={lesson.keywords}
                         onChange={(value) => onLessonChange('keywords', value)}
                         label="Keywords"
                         required={false}
            />
          </div>
          <p className="lesson-editor-describe-subtitle">Acknowledgement of use permissions</p>
          <div className="form-group">
            <div className="checkbox">
              <label htmlFor="id_is_content_use_permission_accepted" className="requiredField">
                <input type="checkbox" name="is_content_use_permission_accepted" id="id_is_content_use_permission_accepted" />
                By checking this box I am declaring that I have the right to use and share all images,
                videos and other content inside this resource with the original creator's consent<span className="asteriskField">*</span>
              </label>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <p className="lesson-describe-preview-text">Preview Image</p>
          <OAImageForm lesson={lesson} container={ImagePreviewContainer} />
        </div>
      </div>
      <button type="button" className="btn btn-primary lesson-editor-describe-publish-btn" onClick={publish}>Publish</button>
    </div>
  )
}
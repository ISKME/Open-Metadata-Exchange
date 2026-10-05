import { useState } from 'react';

export function OATitleForm({ lesson, onChange, cssMod = null, errors = null }) {
  const [title, setTitle] = useState(lesson.title || '');

  const handleChange = (field, value) => {
    onChange(field, value);
    setTitle(value);
  }

  return (
    <div className="lesson-editor-form">
      <div className={'lesson-editor-name-ct ' + (cssMod ? cssMod : '')}>
        <div className={errors ? "form-group has-error" : "form-group"}>
          <div className="controls">
            <input type="text" name="name" value={title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter a Resource Title" />
            {errors && errors.length > 0 && errors.map((error, index) => (
              <p className="form-error help-block" id={`error_id_name_${index}`} key={index}><strong>{error}</strong></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

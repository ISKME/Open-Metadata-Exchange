import { useState } from 'react';

export function OATitleForm({ lesson, onChange }) {
  const [title, setTitle] = useState(lesson.title);

  const handleChange = (field, value) => {
    onChange(field, value);
    setTitle(value);
  }

  return (
    <div className="lesson-editor-form">
      <div className="lesson-editor-name-ct">
        <div className="form-group">
          <div className="controls">
            <input type="text" name="name" value={title} onChange={(e) => handleChange('title', e.target.value)} placeholder="Enter a Resource Title" />
          </div>
        </div>
      </div>
    </div>
  )
}
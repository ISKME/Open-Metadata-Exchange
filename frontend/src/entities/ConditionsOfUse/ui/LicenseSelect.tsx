// @ts-nocheck

import { useState } from 'react';
import Select from 'react-select';

export function LicenseSelect({ license, onChange }) {
  const [label, setLabel] = useState(license.label);
  const [value, setValue] = useState(license.value);
  const [description, setDescription] = useState(license.desc);
  const [type, setType] = useState(license.type);
  const [url, setUrl] = useState(license.url);

  const handleChange = (option) => {
    setLabel(option.label);
    setValue(option.value);
    setType(option.type);
    setDescription(option.desc);
    setUrl(option.url);
    onChange(option);
  }

  const formatOptionLabel = ({ label, icons }) => (
    <div>
      <span>{label}</span> -
      {icons.map(icon => {
        return (
          <i className={icon} key={icon}></i>
        )
      })}
    </div>
  );

  return (
    <div className="resource-license-picker-widget">
      <label className="control-label requiredField">Conditions of Use*</label>
      <div className="resource-license-picker-choice-description">
        <a className="description-name" target="_blank" href={url}>{label}</a>
        <p>
          <span className="description-type">{type}</span>: <span className="description-content">{description}</span>
        </p>
      </div>
      <div className="resource-license-picker-field-ct controls">
        <div className='chosen-results'>
          <Select options={license.options} onChange={handleChange} formatOptionLabel={formatOptionLabel} defaultValue={license} />
        </div>
      </div>
    </div>
  )
}

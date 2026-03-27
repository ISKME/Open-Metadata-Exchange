import { useState, useEffect } from 'react';
import { fetchStandards, BLANK_VALUE } from '../lib/fetch';

function SelectSection({ options, label, onChange }) {
  return (
    <select className="form-control" onChange={onChange}>
      <option value={BLANK_VALUE}>Select {label}</option>
      {options.map(option => (
        <option value={option.value} key={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

function CheckboxSection({ options, onChange }) {
  return (
    <>
    <p className="alignment-tag-help-text">Please select tags to be aligned</p>
    {options.map(option => (
      <label className="tag-label" key={option.value}>
        <input className="tag-option" type="checkbox" value={option.value} onChange={onChange} />
        {option.label}
      </label>
    ))}
    </>
  )
}

function AlignmentSection({ label=null, field, options, onChange, onSelect, toggler=false }) {
  const [selected, setSelected] = useState(null);
  const [nextField, setNextField] = useState(null);
  const [nextLabel, setNextLabel] = useState(null);
  const [nextOptions, setNextOptions] = useState([]);

  const handleChange = async (e) => {
    const value = e.target.value;
    const { data } = await onChange(field, value);

    const nextField = data.name;
    const nextLabel = data.label;

    setSelected(value);
    setNextField(nextField);
    setNextLabel(nextLabel);

    if (nextField === 'tag') {
      setNextOptions(data.choices?.options || []);
    } else {
      setNextOptions(data.choices || []);
    }
  }

  useEffect(() => { setSelected(null) }, [options, toggler]);

  return (
    <>
    <div className="form-group">
      {field !== 'standard' && label && (<label>{label}</label>)}
      {field !== 'tag' ? (
        <SelectSection label={label} options={options} onChange={handleChange} />
      ) : (
        <CheckboxSection options={options} onChange={onSelect} />
      )}
    </div>
    {selected && selected != BLANK_VALUE && field !== 'tag' && (
      <AlignmentSection field={nextField} label={nextLabel} options={nextOptions} onChange={onChange} onSelect={onSelect} />
    )}
    </>
  )
}

export function AlignmentWidget({ alignmentTags=[], label='Educational standards', onChange }) {
  const [standards, setStandards] = useState([]);
  const [standardSelected, setStandardSelected] = useState(null);
  const [tags, setTags] = useState(alignmentTags);
  const [tagsStack, setTagsStack] = useState([]);
  const [toggler, setToggler] = useState(false);

  const handleTagRemove = (tagToRemove) => {
    const newTags = tags.filter(tag => tag.full_code !== tagToRemove.full_code);
    setTags(newTags);
    onChange(newTags);
  }

  const handleOnChange = async (field, value) => {
    if (field === 'standard') {
      setStandardSelected(value);
    }
    return await fetchStandards(field, value, standardSelected);
  }

  const handleOnSelect = (e) => {
    const tagValue = e.target.value;

    if (e.target.checked) {
      setTagsStack([...tagsStack, { full_code: tagValue }]);
    } else {
      setTagsStack(tagsStack.filter(tag => tag.full_code !== tagValue));
    }
  }

  const addTags = () => {
    const map = new Map([...tags, ...tagsStack].map(t => [t.full_code, t]));
    const newTags = Array.from(map.values());
    setTags(newTags);
    cancel();
    onChange(newTags);
  }

  const cancel = () => {
    setTagsStack([]);
    setStandardSelected(null);
    setToggler(!toggler);
  }

  useEffect(() => {
    const fetchInitialStandards = async () => {
      const { data } = await fetchStandards();
      setStandards(data.choices);
    }
    fetchInitialStandards();
  }, []);

  return (
    <>
    <label>{label}</label>
    <div className="controls">
      <div className="multiple-alignment-tag-widget">
        {tags.length === 0 && (
          <div className="multiple-alignment-tag-widget-empty-message" style={{display: 'block'}}>Not Yet Aligned</div>
        )}
        <div className="multiple-alignment-tag-widget-tags">
          {tags.map(tag => (
            <span className="multiple-alignment-tag-widget-tag" key={tag.full_code}>
              {tag.full_code}
              <button className="btn btn-link multiple-alignment-tag-widget-remove-btn" title="Remove tag" onClick={() => handleTagRemove(tag)}>
                <i className="fa fa-remove"></i>
              </button>
            </span>
          ))}
        </div>
        <div className="multiple-alignment-tag-widget-selects">
          <AlignmentSection label='Standard' field='standard' options={standards} onChange={handleOnChange} onSelect={handleOnSelect} toggler={toggler} />
          {standardSelected && standardSelected != BLANK_VALUE && (
            <>
            <button type="button" className={'btn btn-default' + (tagsStack.length === 0 ? ' disabled' : '')} onClick={addTags}>Add Selected Tags</button>
            <button type="button" className="btn btn-link" onClick={cancel}>Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

// @ts-nocheck

import { useState, KeyboardEventHandler } from 'react'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'

function createMetadata(options) {
  return options ? options.map(option => ({name: option.label, slug: option.value, id: option.id})) : []
}

function onChangeHandler(onChange) {
  return (selectedOptions) => onChange(createMetadata(selectedOptions))
}

function Label({ label, required=false }) {
  return (
    <>
      {label && (<label className={`control-label ${required ? 'requiredField' : ''}`}>{ label + (required ? '*' : '') }</label>)}
    </>
  )
}

export function MDSelect({ metadata, options, onChange, label=null, required=true }) {
  const mdDefault = metadata.map(md => ({label: md.name, value: md.slug, id: md.id}))
  const mdOptions = options.reduce((acc, option) => {
    acc.push({
      label: (option.level ? ' --- '.repeat(option.level) : '') + option.name,
      value: option.slug,
      id: option.id,
    })
    return acc
  }, [])

  return (
    <>
    <Label label={label} required={required} />
    <Select isMulti options={mdOptions} defaultValue={mdDefault} onChange={onChangeHandler(onChange)} />
    </>
  )
}

export function MDCreatable({ metadata, onChange, label=null, required=true }) {
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(metadata.map(md => ({label: md.name, value: md.slug, id: md.id})));

  const components = {
    DropdownIndicator: null,
  };

  const createOption = (label: string) => ({
    label,
    value: label,
  });

  const handleOnChange = (newValue) => {
    setValue(newValue);
    onChange(createMetadata(newValue));
  }

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case 'Enter':
      case 'Tab':
        setValue((prev) => {
          const newValue = [...prev, createOption(inputValue)];
          onChange(createMetadata(newValue));
          return newValue;
        });
        setInputValue('');
        event.preventDefault();
    }
  };

  return (
    <>
    <Label label={label} required={required} />
    <CreatableSelect
      components={components}
      inputValue={inputValue}
      isClearable
      isMulti
      menuIsOpen={false}
      onChange={handleOnChange}
      onInputChange={(newValue) => setInputValue(newValue)}
      onKeyDown={handleKeyDown}
      placeholder="Type something and press enter..."
      value={value}
    />
    </>
  );
}
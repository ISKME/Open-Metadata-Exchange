import { useEffect, useState } from 'react';
import cls from './Settings.module.scss';

// One font field. Its own component, so the hooks run once per field and in the same order every render.
function FontInput({ font, idx, onFontChange }) {
  const [inputValue, setInputValue] = useState(font);

  useEffect(() => {
    setInputValue(font);
  }, [font]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onFontChange(idx, inputValue);
    }
  };

  return (
    <div className={cls.item}>
      <span>
        Font
        {' '}
        {idx + 1}
      </span>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: 180 }}
      />
    </div>
  );
}

// One size field, for the same reason
function SizeInput({ name, value, onSizeChange }) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSizeChange(name, inputValue);
    }
  };

  return (
    <div className={cls.item}>
      <span>{name.replace(/([A-Z])/g, ' $1')}</span>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ width: 100 }}
      />
    </div>
  );
}

export default function Settings({
  init, onChange, fonts = [], onFontChange = (i, v) => {}, sizes = {}, onSizeChange = (k, v) => {},
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleHotkey = (e) => {
      if (e.shiftKey && e.key.toLowerCase() === 'y') {
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleHotkey);
    return () => window.removeEventListener('keydown', handleHotkey);
  }, [setOpen]);

  return (
    <div className={cls.settings} style={{ display: open ? 'block' : 'none' }}>
      {/* Color inputs */}
      {Object.keys(init).map((key) => (
        <div className={cls.item} key={key}>
          <span>{key.replace(/([A-Z])/g, ' $1')}</span>
          <input type="color" value={init[key]} onChange={({ target }) => onChange(key, target.value)} />
        </div>
      ))}
      {/* Font inputs */}
      {fonts.map((font, idx) => (
        <FontInput key={font} font={font} idx={idx} onFontChange={onFontChange} />
      ))}
      {/* Size inputs */}
      {sizes && Object.keys(sizes).map((key) => (
        <SizeInput key={key} name={key} value={sizes[key]} onSizeChange={onSizeChange} />
      ))}
    </div>
  );
}

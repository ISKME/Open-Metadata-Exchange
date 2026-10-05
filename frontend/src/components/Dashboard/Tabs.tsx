import { useState, useEffect } from 'react';

export default function({
  label = 'Select View',
  items = [],
  onChange = (i) => {},
}) {
  const [selected, setSelected] = useState(0);

  useEffect(() => onChange(selected), [selected]);

  return (
    <>
      {label !== '' && <span>{label}</span>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div
          role="tablist"
          aria-label={label || 'View options'}
          style={{
            display: 'flex',
            marginTop: '8px',
            background: '#F2F2F7',
            borderRadius: '8px',
            overflow: 'hidden',
            width: 'fit-content',
            marginBottom: '28px',
          }}
        >
          {items.map((item, index) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={selected === index}
              onClick={() => setSelected(index)}
              style={{
                border: 0,
                cursor: 'pointer',
                padding: '8px 24px',
                minHeight: '44px',
                background: selected === index ? 'black' : 'transparent',
                color: selected === index ? 'white' : 'inherit',
                font: 'inherit',
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

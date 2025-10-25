import { useState, useEffect } from 'react'

export default function({ label = 'Select View', items = [], onChange = (i) => {} }) {
  const [selected, setSelected] = useState(0)
  useEffect(() => onChange(selected), [selected])
  return (<>
    {label !== '' && <span>{label}</span>}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
      <div style={{ display: 'flex', marginTop: '8px', background: '#F2F2F7', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', width: 'fit-content', marginBottom: '28px' }}>
        {items.map((item, index) => <div onClick={() => setSelected(index)} style={{ padding: '8px 24px', background: selected === index ? 'black' : 'transparent', color: selected === index ? 'white' : 'inherit' }}>{item}</div>)}
      </div>
    </div>
  </>)
}

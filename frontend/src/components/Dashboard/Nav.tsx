// @ts-nocheck
import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Arrow, Book } from './icons';

export default function ({
  target, widgetId, item, icon, widgets,
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(target === item.slug), [target, item.slug]);
  const single = !item.slug && !item?.widgets?.length;
  if (single) {
    return (
      <li>
        <a
          href={`/reports/dashboard/${item.slug || ''}`}
          style={{
            display: 'flex', gap: '8px', background: target === item.slug ? '#F3F3F3' : '', textDecoration: 'none',
          }}
        >
          {item.icon || <Book />}
          <div>
            <span style={{ color: 'black', fontSize: '14px' }}>{item.title}</span>
            <br />
            <span style={{ color: 'rgba(0, 0, 0, .6)', fontSize: '12px' }}>{item.description}</span>
          </div>
        </a>
      </li>
    );
  }
  return (
    <li style={{ padding: '16px 0' }}>
      {/* !item.widgets.length ? item.slug : (!open && item.slug) */}
      <NavLink onClick={() => setOpen(!open)} to={item.slug} style={{ display: 'flex', padding: '8px', gap: '8px' }}>
        {item.icon || <Book />}
        <div>
          <span style={{ color: 'black', fontSize: '14px', textTransform: 'uppercase' }}>{item.title}</span>
          <br />
          <span style={{ color: 'rgba(0, 0, 0, .6)', fontSize: '12px' }}>{item.description}</span>
        </div>
        {!!item.widgets.length && <div style={{ marginTop: '4px' }}><Arrow /></div>}
      </NavLink>
      {!!item.widgets.length && open && (
        <div style={{ background: '#F6F5F5', padding: '12px' }}>
          <ul style={{
            display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'Inter !important',
          }}
          >
            {item.widgets.map((widget, i) => (
              // eslint-disable-next-line react/no-array-index-key -- the widgets of a menu item are only shown, in a fixed order
              <li key={i}>
                <NavLink to={widget.link || `${item.slug}/${widget.id}`} style={{ fontWeight: widgetId === widget.id ? 'bold' : 'normal', color: 'black', fontSize: '14px' }}>
                  {widget.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

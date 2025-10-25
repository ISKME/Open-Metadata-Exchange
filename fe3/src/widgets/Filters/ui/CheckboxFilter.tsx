import { useState } from 'react';

function updateProps(props, newProps) {
  return { ...props, ...newProps }
}

function Checkbox(props) {
  const { filter, item, checked, onSelect, onUnSelect } = props

  const handleChange = (e) => {
    const value = e.target.value
    if (e.target.checked) {
      onSelect(filter.keyword, value)
    } else {
      onUnSelect(value)
    }
  }

  return (
    <label>
      <input type='checkbox' name={filter.keyword} checked={checked} value={item.slug} onChange={handleChange}/>
      {item.name}
      <span className='facet-count'>({item.numResources})</span>
    </label>
  )
}

function CheckboxWrapper(props) {
  const { filter, item, selected, wrapTag } = props
  const getKey = () => filter.keyword + '.' + item.slug
  const getClassName = () => isSelected(item.slug) ? 'selected' : ''
  const [collapsed, setCollapsed] = useState(true)

  const isSelected = (value) => {
    const valueStr = ('' + value)
    return selected.some(i => i.keyword === filter.keyword && i.value === valueStr)
  }

  const itemProps = updateProps(props, { checked: isSelected(item.slug) })

  const wrappers = {
    li: () => {
      return (
        <li key={getKey()} className={getClassName()}>
          {Checkbox(itemProps)}
          {item.items.length > 0 && CheckboxUL(updateProps(props, { items: item.items }))}
        </li>
      )
    },
    dt: () => {
      return (
        <>
          <dt key={getKey()} className={getClassName() + (collapsed ? ' collapsed' : '')}>
            {Checkbox(itemProps)}
            <button
                type="button"
                className="filter-block-chevron btn btn-icon toggle-collapse"
                data-title-expanded="Collapse"
                data-title-collapsed="Expand"
                title="Collapse"
                aria-label="Collapse"
                onClick={() => setCollapsed(!collapsed)}>
                  <i className={"fa fa-chevron-" + (collapsed ? 'down' : 'up')}></i>
              </button>
          </dt>
          {!collapsed && item.items.map(dd => {
            return (
              <CheckboxWrapper {...updateProps(props, { item: dd, wrapTag: 'dd' })}/>
            )
          })}
        </>
      )
    },
  }

  return (wrappers[wrapTag] || wrappers['li'])()
}

export function CheckboxUL(props) {
  const { items } = props

  return (
    <ul>
      {items.map(item => {
        return (
          <CheckboxWrapper {...updateProps(props, { item: item, wrapTag: 'li' })}/>
        )
      })}
    </ul>
  )
}

export function CheckboxDL(props) {
  const { items } = props

  return (
    <dl>
      {items.map(item => {
        return (
          <CheckboxWrapper {...updateProps(props, { item: item, wrapTag: 'dt' })}/>
        )
      })}
    </dl>
  )
}

export function CheckboxFilter(props) {
  const items = props.filter.items
  const grid = 12
  const cols = props.cols || 1
  const colWrap = grid / cols
  const chunkSize = Math.ceil(items.length / cols)
  const listComponent = props.listComponent || CheckboxUL

  let chunks = []
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize))
  }

  return (
    <section className={'filter-block ' + (props.className || '')} style={{ marginBottom: '30px' }}>
      <h2 className='filter-block-title'>{ props.header || props.filter.name }</h2>
      <nav className="row">
        {chunks.map(colItems => {
          return (
            <div className={"col-md-" + colWrap}>
              {listComponent(updateProps(props, { items: colItems }))}
            </div>
          )
        })}
      </nav>
    </section>
  )
}

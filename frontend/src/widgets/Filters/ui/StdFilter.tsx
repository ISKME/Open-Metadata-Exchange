import cls from './StdFilter.module.scss'

function StdSelect({ items, emptyValue, onChange }) {
  return (
    <select className='form-control' onChange={onChange} name='f.std'>
      <option value={emptyValue}>---</option>
      {items.map(item => {
        return (
          <option value={item.slug} key={item.slug} selected={item.isSelected}>
            {item.name}
          </option>
        )
      })}
    </select>
  )
}

function StdSection({ filter, items, parent, onChange }) {
  const emptyValue = parent ? parent.slug : ''

  return (
    <div className='field standard form-group'>
      <label>{items.length > 0 && items[0].section.name}</label>
      <StdSelect items={items} emptyValue={emptyValue} onChange={(e) => onChange(filter, e.target.value)} />
    </div>
  )
}

export function StdWidget(props) {
  const { section, items, onChange, filter, parent } = props
  const selectedItem = items?.find(item => item.isSelected) || { items: [] }

  return (
    <>
      {section({ filter, items, parent, onChange })}
      {selectedItem.items?.length > 0 && StdWidget({...props, items: selectedItem.items, parent: selectedItem })}
    </>
  )
}

export function StdFilter(props) {
  return (
    <section className={'filter-block ' + (props.className || '')} style={{ marginBottom: '30px' }}>
      <h2 className='filter-block-title'>{ props.header || props.filter.name }</h2>
      <div className={cls[props.className]}>
        <StdWidget section={StdSection} {...props} />
      </div>
    </section>
  )
}

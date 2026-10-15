export function getSelectedItems(items) {
  let selected = []

  for (const item of items) {
    if (item.isSelected) {
      selected.push(item)
      selected = selected.concat(getSelectedItems(item.items))
    }
  }

  return selected
}

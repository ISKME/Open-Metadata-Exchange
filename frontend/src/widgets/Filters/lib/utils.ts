export function getSelectedItems(items) {
  let selected = [];

  items.forEach((item) => {
    if (item.isSelected) {
      selected.push(item);
      selected = selected.concat(getSelectedItems(item.items));
    }
  });

  return selected;
}

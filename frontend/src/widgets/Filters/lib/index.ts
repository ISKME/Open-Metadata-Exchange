import { IFilterItem } from '../model/types.d';

export function getSelectedItems(items: IFilterItem[]): IFilterItem[] {
  if (!items || items.length === 0) return [];
  const selected: IFilterItem[] = [];
  for (const item of items) {
    if (item.isSelected) {
      selected.push(item);
    }
    if (item.items && item.items.length > 0) {
      selected.push(...getSelectedItems(item.items));
    }
  }
  return selected;
}

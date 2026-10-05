import { IFilterItem } from '../model/types.d';

export function convertFlatToTree(items: IFilterItem[]): IFilterItem[] {
  if (!items || items.length === 0) return [];

  const roots: IFilterItem[] = [];
  const stack: IFilterItem[] = [];

  for (const item of items) {
    const node: IFilterItem = { ...item, items: item.items ? [...item.items] : [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      const parent = stack[stack.length - 1];
      parent.items.push(node);
    }

    stack.push(node);
  }

  return roots;
}

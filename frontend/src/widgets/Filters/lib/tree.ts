import { IFilterItem } from '../model/types'

export function convertFlatToTree(items: IFilterItem[], level=0): IFilterItem[] {
  let itemsTree: IFilterItem[] = []

  while (items.length > 0) {
    const item = items[0]
    if (item.level === level) {
      items.shift()
      if (item.items.length == 0) {
        item.items = convertFlatToTree(items, level + 1)
      }
      itemsTree.push(item)
    } else {
      break
    }
  }

  return itemsTree
}

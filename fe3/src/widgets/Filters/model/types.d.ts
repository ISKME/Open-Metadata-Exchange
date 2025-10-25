interface IFilterNode {
  items: Array<IFilterItem>,
}

export interface IFilterItem extends IFilterNode {
  name: string,
  slug: string,
  level: number,
  isSelected: boolean,
  items: Array<IFilterItem>,
}

export interface IFilter extends IFilterNode {
  name: string,
  keyword: string,
}

export interface IFilterMap {
  [key: string]: IFilter,
}

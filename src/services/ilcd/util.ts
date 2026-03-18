import type { Classification } from '../general/data';

export type ILCDCategoryNode = {
  '@id': string;
  '@name': string;
  category?: ILCDCategoryNode[] | null;
};

export function genClass(data?: ILCDCategoryNode[] | null): Classification[] {
  if (!data) {
    return [];
  }
  return data.map((item) => {
    return {
      id: item['@id'],
      value: item['@name'],
      label: item['@name'],
      children: genClass(item.category),
    };
  });
}

export function genClassZH(
  data?: ILCDCategoryNode[] | null,
  dataZH?: ILCDCategoryNode[] | null,
): Classification[] {
  if (!data) {
    return [];
  }
  return data.map((item) => {
    const zh = dataZH ? dataZH.find((candidate) => candidate['@id'] === item['@id']) : null;
    return {
      id: item['@id'],
      value: item['@name'],
      label: zh?.['@name'] ?? item['@name'],
      children: genClassZH(item.category, zh?.category),
    };
  });
}

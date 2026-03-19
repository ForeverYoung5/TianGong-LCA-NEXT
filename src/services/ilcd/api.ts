import { getCPCClassification, getCPCClassificationZH } from '../flows/classification/api';
import type { Classification } from '../general/data';
import { getCachedOrFetchIlcdFileData } from '../ilcdData/util';
import { getISICClassification, getISICClassificationZH } from '../processes/classification/api';
import { categoryTypeOptions } from './data';
import { genClass, genClassZH, type ILCDCategoryNode } from './util';

type ILCDFlowCategorizationDocument = {
  CategorySystem?: {
    categories?: {
      category?: ILCDCategoryNode[] | ILCDCategoryNode | null;
    } | null;
  } | null;
};

type ILCDClassificationGroup = {
  '@dataType'?: string;
  category?: ILCDCategoryNode[] | ILCDCategoryNode | null;
};

type ILCDClassificationDocument = {
  CategorySystem?: {
    categories?: ILCDClassificationGroup[] | ILCDClassificationGroup | null;
  } | null;
};

type ILCDLocationNode = Record<string, unknown> & {
  '@value'?: string;
  '#text'?: string;
};

type ILCDLocationDocument = {
  ILCDLocations?: {
    location?: ILCDLocationNode[] | ILCDLocationNode | null;
  } | null;
};

const ILCD_FLOW_CATEGORIZATION_FILES = {
  en: 'ILCDFlowCategorization.min.json.gz',
  zh: 'ILCDFlowCategorization_zh.min.json.gz',
} as const;

const ILCD_CLASSIFICATION_FILES = {
  en: 'ILCDClassification.min.json.gz',
  zh: 'ILCDClassification_zh.min.json.gz',
} as const;

const ILCD_LOCATION_FILES = {
  en: 'ILCDLocations.min.json.gz',
  zh: 'ILCDLocations_zh.min.json.gz',
} as const;

function normalizeIlcdLang(lang: string): 'en' | 'zh' {
  return lang === 'zh' ? 'zh' : 'en';
}

function normalizeFlowCategorizationNodes(
  category?: ILCDCategoryNode[] | ILCDCategoryNode | null,
): ILCDCategoryNode[] {
  if (Array.isArray(category)) {
    return category;
  }
  if (category) {
    return [category];
  }
  return [];
}

function normalizeClassificationGroups(
  categories?: ILCDClassificationGroup[] | ILCDClassificationGroup | null,
): ILCDClassificationGroup[] {
  if (Array.isArray(categories)) {
    return categories;
  }
  if (categories) {
    return [categories];
  }
  return [];
}

function normalizeLocationNodes(
  location?: ILCDLocationNode[] | ILCDLocationNode | null,
): ILCDLocationNode[] {
  if (Array.isArray(location)) {
    return location;
  }
  if (location) {
    return [location];
  }
  return [];
}

function filterFlowCategorizationNodes(
  nodes: ILCDCategoryNode[],
  getValues: string[],
): ILCDCategoryNode[] {
  if (getValues.includes('all')) {
    return nodes;
  }

  const filters = new Set(getValues);
  const filterNode = (node: ILCDCategoryNode): ILCDCategoryNode | null => {
    const childNodes = Array.isArray(node.category) ? node.category : [];
    const filteredChildren = childNodes
      .map((child) => filterNode(child))
      .filter((child): child is ILCDCategoryNode => child !== null);
    const isMatched = filters.has(node['@id']) || filters.has(node['@name']);

    if (isMatched) {
      return node;
    }

    if (filteredChildren.length > 0) {
      return {
        ...node,
        category: filteredChildren,
      };
    }

    return null;
  };

  return nodes
    .map((node) => filterNode(node))
    .filter((node): node is ILCDCategoryNode => node !== null);
}

function filterClassificationNodes(
  nodes: ILCDCategoryNode[],
  getValues: string[],
): ILCDCategoryNode[] {
  if (getValues.includes('all')) {
    return nodes;
  }

  const filters = new Set(getValues.filter(Boolean));
  if (filters.size === 0) {
    return [];
  }

  const filterNode = (node: ILCDCategoryNode): ILCDCategoryNode | null => {
    const childNodes = Array.isArray(node.category) ? node.category : [];
    const filteredChildren = childNodes
      .map((child) => filterNode(child))
      .filter((child): child is ILCDCategoryNode => child !== null);
    const isMatched = filters.has(node['@id']) || filters.has(node['@name']);

    if (isMatched) {
      return node;
    }

    if (filteredChildren.length > 0) {
      return {
        ...node,
        category: filteredChildren,
      };
    }

    return null;
  };

  return nodes
    .map((node) => filterNode(node))
    .filter((node): node is ILCDCategoryNode => node !== null);
}

async function getFlowCategorizationNodes(lang: 'en' | 'zh'): Promise<ILCDCategoryNode[]> {
  const fileName = ILCD_FLOW_CATEGORIZATION_FILES[lang];
  const document = await getCachedOrFetchIlcdFileData<ILCDFlowCategorizationDocument>(fileName);

  if (!document) {
    throw new Error(`Failed to load ILCD flow categorization from ${fileName}`);
  }

  return normalizeFlowCategorizationNodes(document.CategorySystem?.categories?.category);
}

async function getClassificationNodesByType(
  categoryType: string,
  lang: 'en' | 'zh',
): Promise<ILCDCategoryNode[]> {
  const fileName = ILCD_CLASSIFICATION_FILES[lang];
  const document = await getCachedOrFetchIlcdFileData<ILCDClassificationDocument>(fileName);

  if (!document) {
    throw new Error(`Failed to load ILCD classification data from ${fileName}`);
  }

  const group = normalizeClassificationGroups(document.CategorySystem?.categories).find(
    (item) => item['@dataType'] === categoryType,
  );

  return normalizeFlowCategorizationNodes(group?.category);
}

async function getLocationNodes(lang: 'en' | 'zh'): Promise<ILCDLocationNode[]> {
  const fileName = ILCD_LOCATION_FILES[lang];
  const document = await getCachedOrFetchIlcdFileData<ILCDLocationDocument>(fileName);

  if (!document) {
    throw new Error(`Failed to load ILCD location data from ${fileName}`);
  }

  return normalizeLocationNodes(document.ILCDLocations?.location);
}

export async function getILCDLocationEntries(
  lang: string,
  getValues: string[],
): Promise<ILCDLocationNode[]> {
  const normalizedLang = normalizeIlcdLang(lang);
  const nodes = await getLocationNodes(normalizedLang);

  if (getValues.includes('all')) {
    return nodes;
  }

  const filters = new Set(getValues.filter(Boolean));
  if (filters.size === 0) {
    return [];
  }

  return nodes.filter((node) => {
    const value = node['@value'];
    return typeof value === 'string' && filters.has(value);
  });
}

export async function getILCDClassification(
  categoryType: string,
  lang: string,
  getValues: string[],
): Promise<{ data: Classification[]; success: boolean }> {
  try {
    let result = null;

    if (categoryType === 'Process' || categoryType === 'LifeCycleModel') {
      result = getISICClassification(getValues);
    } else if (categoryType === 'Flow') {
      result = getCPCClassification(getValues);
    } else {
      result = {
        data: filterClassificationNodes(
          await getClassificationNodesByType(categoryType, 'en'),
          getValues,
        ),
      };
    }

    let newDatas: Classification[] = [];
    let resultZH = null;
    if (lang === 'zh') {
      let getIds: string[] = [];
      if (getValues.includes('all')) {
        getIds = ['all'];
      } else {
        getIds = (result?.data ?? []).map((item: ILCDCategoryNode) => item['@id']);
      }
      if (categoryType === 'Process' || categoryType === 'LifeCycleModel') {
        resultZH = getISICClassificationZH(getIds);
      } else if (categoryType === 'Flow') {
        resultZH = getCPCClassificationZH(getIds);
      } else {
        const categoryTypeZH = categoryTypeOptions.find((item) => item.en === categoryType)?.zh;
        resultZH = {
          data: filterClassificationNodes(
            await getClassificationNodesByType(categoryTypeZH ?? categoryType, 'zh'),
            getIds,
          ),
        };
      }
      newDatas = genClassZH(result?.data, resultZH?.data);
    } else {
      newDatas = genClass(result?.data);
    }

    return Promise.resolve({
      data: newDatas,
      success: true,
    });
  } catch (e) {
    console.error(e);
    return Promise.resolve({
      data: [],
      success: false,
    });
  }
}

export async function getILCDFlowCategorization(
  lang: string,
  getValues: string[],
): Promise<{ data: Classification[]; success: boolean }> {
  try {
    const resultData = filterFlowCategorizationNodes(
      await getFlowCategorizationNodes('en'),
      getValues,
    );

    let newDatas: Classification[] = [];
    if (lang === 'zh') {
      const resultZH = await getFlowCategorizationNodes('zh');
      newDatas = genClassZH(resultData, resultZH);
    } else {
      newDatas = genClass(resultData);
    }

    return Promise.resolve({
      data: newDatas,
      success: true,
    });
  } catch (e) {
    console.error(e);
    return Promise.resolve({
      data: [],
      success: false,
    });
  }
}

export async function getILCDFlowCategorizationAll(lang: string) {
  const result = await getILCDClassification('Flow', lang, ['all']);
  const resultElementaryFlow = await getILCDFlowCategorization(lang, ['all']);

  const newDatas = {
    category: result.data,
    categoryElementaryFlow: resultElementaryFlow.data,
  };

  return Promise.resolve({
    data: newDatas,
    success: true,
  });
}

export async function getILCDLocationAll(lang: string) {
  const normalizedLang = normalizeIlcdLang(lang);
  const fileName = normalizedLang === 'zh' ? 'ILCDLocations_zh' : 'ILCDLocations';

  try {
    const location = await getILCDLocationEntries(normalizedLang, ['all']);

    return Promise.resolve({
      data: [{ file_name: fileName, location }],
      success: true,
    });
  } catch (e) {
    console.error(e);
    return Promise.resolve({
      data: [],
      success: false,
    });
  }
}

export async function getILCDLocationByValues(lang: string, get_values: string[]) {
  try {
    const data = await getILCDLocationEntries(lang, get_values);

    return Promise.resolve({
      data,
      success: true,
    });
  } catch (e) {
    console.error(e);
    return Promise.resolve({
      data: [],
      success: false,
    });
  }
}

export async function getILCDLocationByValue(lang: string, get_value: string) {
  const result = await getILCDLocationByValues(lang, [get_value]);

  if (result.data?.[0]?.['#text']) {
    return Promise.resolve({
      data: get_value + ' (' + result.data?.[0]?.['#text'] + ')',
      success: result.success,
    });
  } else {
    return Promise.resolve({
      data: get_value,
      success: result.success,
    });
  }
}

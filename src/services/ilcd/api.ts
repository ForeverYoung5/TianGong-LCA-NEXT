import { supabase } from '@/services/supabase';
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

const ILCD_FLOW_CATEGORIZATION_FILES = {
  en: 'ILCDFlowCategorization.min.json.gz',
  zh: 'ILCDFlowCategorization_zh.min.json.gz',
} as const;

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

async function getFlowCategorizationNodes(lang: 'en' | 'zh'): Promise<ILCDCategoryNode[]> {
  const fileName = ILCD_FLOW_CATEGORIZATION_FILES[lang];
  const document = await getCachedOrFetchIlcdFileData<ILCDFlowCategorizationDocument>(fileName);

  if (!document) {
    throw new Error(`Failed to load ILCD flow categorization from ${fileName}`);
  }

  return normalizeFlowCategorizationNodes(document.CategorySystem?.categories?.category);
}

export async function getILCDClassification(
  categoryType: string,
  lang: string,
  getValues: string[],
): Promise<{ data: Classification[]; success: boolean }> {
  try {
    const thisCategoryType = categoryTypeOptions.find((i) => i.en === categoryType);

    let result = null;

    if (categoryType === 'Process' || categoryType === 'LifeCycleModel') {
      result = getISICClassification(getValues);
    } else if (categoryType === 'Flow') {
      result = getCPCClassification(getValues);
    } else {
      result = await supabase.rpc('ilcd_classification_get', {
        this_file_name: 'ILCDClassification',
        category_type: categoryType,
        get_values: getValues,
      });
    }

    let newDatas: Classification[] = [];
    let resultZH = null;
    if (lang === 'zh') {
      let getIds = [];
      if (getValues.includes('all')) {
        getIds = ['all'];
      } else {
        getIds = result?.data?.map((i: any) => i['@id']);
      }
      if (categoryType === 'Process' || categoryType === 'LifeCycleModel') {
        resultZH = getISICClassificationZH(getIds);
      } else if (categoryType === 'Flow') {
        resultZH = getCPCClassificationZH(getIds);
      } else {
        resultZH = await supabase.rpc('ilcd_classification_get', {
          this_file_name: 'ILCDClassification_zh',
          category_type: thisCategoryType?.zh,
          get_values: getIds,
        });
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
  let file_name = 'ILCDLocations';
  if (lang === 'zh') {
    file_name = 'ILCDLocations_zh';
  }
  const result = await supabase
    .from('ilcd')
    .select(
      `
      file_name,
      json_ordered->ILCDLocations->location
      `,
    )
    .eq('file_name', file_name);
  return Promise.resolve({
    data: result.data ?? [],
    success: true,
  });
}

export async function getILCDLocationByValues(lang: string, get_values: string[]) {
  let file_name = 'ILCDLocations';
  if (lang === 'zh') {
    file_name = 'ILCDLocations_zh';
  }
  const result = await supabase.rpc('ilcd_location_get', {
    this_file_name: file_name,
    get_values: get_values,
  });

  return Promise.resolve({
    data: result.data,
    success: true,
  });
}

export async function getILCDLocationByValue(lang: string, get_value: string) {
  let file_name = 'ILCDLocations';
  if (lang === 'zh') {
    file_name = 'ILCDLocations_zh';
  }
  const result = await supabase.rpc('ilcd_location_get', {
    this_file_name: file_name,
    get_values: [get_value],
  });

  if (result.data?.[0]?.['#text']) {
    return Promise.resolve({
      data: get_value + ' (' + result.data?.[0]?.['#text'] + ')',
      success: true,
    });
  } else {
    return Promise.resolve({
      data: get_value,
      success: true,
    });
  }
}

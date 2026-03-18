/**
 * ILCD Data Cache Layer
 *
 * Provides in-memory caching support for dynamic ILCD reference data.
 * Flow categorization is now sourced from the ILCD gzip cache managed by ILCDCacheMonitor.
 */

import { supabase } from '@/services/supabase';
import { getCPCClassification, getCPCClassificationZH } from '../flows/classification/api';
import type { Classification } from '../general/data';
import { getISICClassification, getISICClassificationZH } from '../processes/classification/api';
import { getILCDFlowCategorization, getILCDLocationEntries } from './api';
import type { ILCDCategoryNode } from './util';
import { genClass, genClassZH } from './util';

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class ILCDCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  private getCacheKey(
    prefix: string,
    ...args: Array<string | number | boolean | null | undefined>
  ): string {
    return `${prefix}:${args.join(':')}`;
  }

  private isExpired(entry: CacheEntry<unknown>): boolean {
    return Date.now() > entry.expiresAt;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // Cache method for ILCD Flow Categorization
  async getILCDFlowCategorizationAll(lang: string): Promise<Classification[]> {
    const result = await getILCDFlowCategorization(lang, ['all']);
    return result.data;
  }

  // Cache method for ILCD Classification
  async getILCDClassification(
    categoryType: string,
    lang: string,
    getValues: string[],
  ): Promise<Classification[]> {
    const cacheKey = this.getCacheKey(
      'ilcd_classification',
      categoryType,
      lang,
      getValues.join(','),
    );
    const cached = this.get<Classification[]>(cacheKey);

    if (cached) {
      console.log('[Cache Hit] ILCD Classification:', categoryType, lang);
      return cached;
    }

    console.log('[Cache Miss] ILCD Classification:', categoryType, lang);

    let result: { data: ILCDCategoryNode[] | null } | null = null;

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

    const resultData = result?.data ?? [];
    let newDatas: Classification[];
    let resultZH: { data: ILCDCategoryNode[] | null } | null = null;

    if (lang === 'zh') {
      let getIds: string[] = [];
      if (getValues.includes('all')) {
        getIds = ['all'];
      } else {
        getIds = resultData.map((item: ILCDCategoryNode) => item['@id']);
      }

      if (categoryType === 'Process' || categoryType === 'LifeCycleModel') {
        resultZH = getISICClassificationZH(getIds);
      } else if (categoryType === 'Flow') {
        resultZH = getCPCClassificationZH(getIds);
      } else {
        const categoryTypeZHMap: Record<string, string> = {
          Flow: '流',
          Process: '过程',
          LifeCycleModel: '生命周期模型',
          Contact: '联系信息',
          Source: '来源',
          FlowProperty: '流属性',
          UnitGroup: '单位组',
        };
        resultZH = await supabase.rpc('ilcd_classification_get', {
          this_file_name: 'ILCDClassification_zh',
          category_type: categoryTypeZHMap[categoryType] || categoryType,
          get_values: getIds,
        });
      }
      newDatas = genClassZH(resultData, resultZH?.data ?? null);
    } else {
      newDatas = genClass(resultData);
    }

    // Cache with default TTL (5 minutes)
    this.set(cacheKey, newDatas, this.defaultTTL);

    return newDatas;
  }

  // Cache method for ILCD Location
  async getILCDLocationByValues(
    lang: string,
    get_values: string[],
  ): Promise<Array<Record<string, unknown>>> {
    // Return empty array if input is empty
    if (!get_values || get_values.length === 0) {
      return [];
    }

    // Filter out undefined and null values
    const validValues = get_values.filter((v) => v !== null && v !== undefined);
    if (validValues.length === 0) {
      return [];
    }

    const cacheKey = this.getCacheKey('ilcd_location', lang, validValues.sort().join(','));
    const cached = this.get<Array<Record<string, unknown>>>(cacheKey);

    if (cached) {
      console.log('[Cache Hit] ILCD Location:', validValues.length, 'values');
      return cached;
    }

    console.log('[Cache Miss] ILCD Location:', validValues.length, 'values');

    const data =
      ((await getILCDLocationEntries(lang, validValues)) as Array<
        Record<string, unknown>
      > | null) ?? [];

    // Cache with default TTL (5 minutes)
    this.set(cacheKey, data, this.defaultTTL);

    return data;
  }

  // Combined query method: fetch all Flow reference data at once
  async getFlowReferenceDataAll(lang: string): Promise<{
    category: Classification[];
    categoryElementaryFlow: Classification[];
  }> {
    const cacheKey = this.getCacheKey('flow_ref_all', lang);
    const cached = this.get<{
      category: Classification[];
      categoryElementaryFlow: Classification[];
    }>(cacheKey);

    if (cached) {
      console.log('[Cache Hit] Flow Reference Data All');
      return cached;
    }

    console.log('[Cache Miss] Flow Reference Data All - fetching...');

    // Fetch all data in parallel
    const [classification, flowCategorization] = await Promise.all([
      this.getILCDClassification('Flow', lang, ['all']),
      this.getILCDFlowCategorizationAll(lang),
    ]);

    const data = {
      category: classification,
      categoryElementaryFlow: flowCategorization,
    };

    // Cache with default TTL (5 minutes)
    this.set(cacheKey, data, this.defaultTTL);

    return data;
  }
}

// Export singleton instance
export const ilcdCache = new ILCDCache();

// Convenience methods
export async function getCachedFlowCategorizationAll(lang: string) {
  return ilcdCache.getFlowReferenceDataAll(lang);
}

export async function getCachedLocationData(lang: string, locations: string[]) {
  return ilcdCache.getILCDLocationByValues(lang, locations);
}

export async function getCachedClassificationData(
  categoryType: string,
  lang: string,
  getIds: string[],
) {
  return ilcdCache.getILCDClassification(categoryType, lang, getIds);
}

// Helper methods to clear cache (useful when data is updated)
export function clearILCDCache() {
  ilcdCache.clear();
  console.log('[Cache] ILCD cache cleared');
}

export function clearILCDCacheByPrefix(
  prefix: 'ilcd_flow_cat' | 'ilcd_classification' | 'ilcd_location',
) {
  ilcdCache.clearPrefix(prefix);
  console.log(`[Cache] ILCD cache cleared for prefix: ${prefix}`);
}

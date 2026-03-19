/**
 * Tests for ILCD service API functions
 * Path: src/services/ilcd/api.ts
 *
 * Coverage focuses on:
 * - getILCDClassification: Used in LevelTextItem components for classification data
 * - getILCDFlowCategorization: Used for flow categorization data
 * - getILCDFlowCategorizationAll: Combined classification and categorization
 * - getILCDLocationAll: Used in LocationTextItem for location selection
 * - getILCDLocationByValues: Batch location lookup
 * - getILCDLocationByValue: Single location lookup with formatted output
 */

import {
  getILCDClassification,
  getILCDFlowCategorization,
  getILCDFlowCategorizationAll,
  getILCDLocationAll,
  getILCDLocationByValue,
  getILCDLocationByValues,
} from '@/services/ilcd/api';

// Mock dependencies
jest.mock('@/services/flows/classification/api', () => ({
  getCPCClassification: jest.fn(),
  getCPCClassificationZH: jest.fn(),
}));

jest.mock('@/services/processes/classification/api', () => ({
  getISICClassification: jest.fn(),
  getISICClassificationZH: jest.fn(),
}));

jest.mock('@/services/ilcdData/util', () => ({
  getCachedOrFetchIlcdFileData: jest.fn(),
}));

jest.mock('@/services/ilcd/util', () => ({
  genClass: jest.fn(),
  genClassZH: jest.fn(),
}));

const { getCPCClassification, getCPCClassificationZH } = jest.requireMock(
  '@/services/flows/classification/api',
);
const { getISICClassification, getISICClassificationZH } = jest.requireMock(
  '@/services/processes/classification/api',
);
const { getCachedOrFetchIlcdFileData } = jest.requireMock('@/services/ilcdData/util');
const { genClass, genClassZH } = jest.requireMock('@/services/ilcd/util');

const createFlowCategorizationDocument = (categories: any[]) => ({
  CategorySystem: {
    categories: {
      category: categories,
    },
  },
});

const createClassificationDocument = (dataType: string, categories: any[]) => ({
  CategorySystem: {
    categories: [
      {
        '@dataType': dataType,
        category: categories,
      },
    ],
  },
});

describe('ILCD API Service (src/services/ilcd/api.ts)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getILCDClassification', () => {
    it('should handle Process category type with English', async () => {
      const mockData = [{ '@id': 'proc1', '@name': 'Process Category' }];
      getISICClassification.mockReturnValue({ data: mockData }); // Changed from mockResolvedValue
      genClass.mockReturnValue([{ id: 'proc1', label: 'Process Category' }]);

      const result = await getILCDClassification('Process', 'en', ['all']);

      expect(getISICClassification).toHaveBeenCalledWith(['all']);
      expect(genClass).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({
        data: [{ id: 'proc1', label: 'Process Category' }],
        success: true,
      });
    });

    it('should handle Process category type with Chinese', async () => {
      const mockData = [{ '@id': 'proc1', '@name': 'Process Category' }];
      const mockDataZH = [{ '@id': 'proc1', '@name': '过程分类' }];
      getISICClassification.mockReturnValue({ data: mockData });
      getISICClassificationZH.mockReturnValue({ data: mockDataZH });
      genClassZH.mockReturnValue([{ id: 'proc1', label: '过程分类' }]);

      const result = await getILCDClassification('Process', 'zh', ['all']);

      expect(getISICClassification).toHaveBeenCalledWith(['all']);
      expect(getISICClassificationZH).toHaveBeenCalledWith(['all']);
      expect(genClassZH).toHaveBeenCalledWith(mockData, mockDataZH);
      expect(result).toEqual({
        data: [{ id: 'proc1', label: '过程分类' }],
        success: true,
      });
    });

    it('should handle Flow category type with English', async () => {
      const mockData = [{ '@id': 'flow1', '@name': 'Flow Category' }];
      getCPCClassification.mockReturnValue({ data: mockData });
      genClass.mockReturnValue([{ id: 'flow1', label: 'Flow Category' }]);

      const result = await getILCDClassification('Flow', 'en', ['val1']);

      expect(getCPCClassification).toHaveBeenCalledWith(['val1']);
      expect(genClass).toHaveBeenCalledWith(mockData);
      expect(result.success).toBe(true);
    });

    it('should handle Flow category type with Chinese', async () => {
      const mockData = [{ '@id': 'flow1', '@name': 'Flow Category' }];
      const mockDataZH = [{ '@id': 'flow1', '@name': '流分类' }];
      getCPCClassification.mockReturnValue({ data: mockData });
      getCPCClassificationZH.mockReturnValue({ data: mockDataZH });
      genClassZH.mockReturnValue([{ id: 'flow1', label: '流分类' }]);

      const result = await getILCDClassification('Flow', 'zh', ['flow1']);

      expect(getCPCClassification).toHaveBeenCalledWith(['flow1']);
      expect(getCPCClassificationZH).toHaveBeenCalledWith(['flow1']);
      expect(result.success).toBe(true);
    });

    it('should handle other category types with local ILCD classification data', async () => {
      const mockData = [{ '@id': 'cat1', '@name': 'Category 1' }];
      getCachedOrFetchIlcdFileData.mockResolvedValue(
        createClassificationDocument('FlowProperty', mockData),
      );
      genClass.mockReturnValue([{ id: 'cat1', label: 'Category 1' }]);

      const result = await getILCDClassification('FlowProperty', 'en', ['all']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDClassification.min.json.gz');
      expect(genClass).toHaveBeenCalledWith(mockData);
      expect(result.success).toBe(true);
    });

    it('should handle other category types with Chinese via local ILCD classification data', async () => {
      const mockData = [{ '@id': 'cat1', '@name': 'Category 1' }];
      const mockDataZH = [{ '@id': 'cat1', '@name': '分类 1' }];
      getCachedOrFetchIlcdFileData
        .mockResolvedValueOnce(createClassificationDocument('Contact', mockData))
        .mockResolvedValueOnce(createClassificationDocument('联系信息', mockDataZH));
      genClassZH.mockReturnValue([{ id: 'cat1', label: '分类 1' }]);

      const result = await getILCDClassification('Contact', 'zh', ['all']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenNthCalledWith(
        1,
        'ILCDClassification.min.json.gz',
      );
      expect(getCachedOrFetchIlcdFileData).toHaveBeenNthCalledWith(
        2,
        'ILCDClassification_zh.min.json.gz',
      );
      expect(genClassZH).toHaveBeenCalledWith(mockData, mockDataZH);
      expect(result.success).toBe(true);
    });

    it('should handle LifeCycleModel like Process', async () => {
      const mockData = [{ '@id': 'lcm1', '@name': 'Life Cycle Model' }];
      getISICClassification.mockResolvedValue({ data: mockData });
      genClass.mockReturnValue([{ id: 'lcm1', label: 'Life Cycle Model' }]);

      const result = await getILCDClassification('LifeCycleModel', 'en', ['all']);

      expect(getISICClassification).toHaveBeenCalledWith(['all']);
      expect(result.success).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      getCachedOrFetchIlcdFileData.mockRejectedValue(new Error('Cache read error'));

      const result = await getILCDClassification('Source', 'en', ['all']);

      expect(result).toEqual({
        data: [],
        success: false,
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should extract IDs from data for Chinese translation lookup', async () => {
      const mockData = [
        { '@id': 'id1', '@name': 'Name 1' },
        { '@id': 'id2', '@name': 'Name 2' },
      ];
      const mockDataZH = [
        { '@id': 'id1', '@name': '名称 1' },
        { '@id': 'id2', '@name': '名称 2' },
      ];
      getCachedOrFetchIlcdFileData
        .mockResolvedValueOnce(createClassificationDocument('UnitGroup', mockData))
        .mockResolvedValueOnce(createClassificationDocument('单位组', mockDataZH));
      genClassZH.mockReturnValue([]);

      await getILCDClassification('UnitGroup', 'zh', ['id1', 'id2']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenNthCalledWith(
        2,
        'ILCDClassification_zh.min.json.gz',
      );
      expect(genClassZH).toHaveBeenCalledWith(mockData, mockDataZH);
    });
  });

  describe('getILCDFlowCategorization', () => {
    it('should fetch flow categorization from ILCD gzip cache with English', async () => {
      const mockData = [{ '@id': 'elem1', '@name': 'Elementary Flow' }];
      getCachedOrFetchIlcdFileData.mockResolvedValue(createFlowCategorizationDocument(mockData));
      genClass.mockReturnValue([{ id: 'elem1', label: 'Elementary Flow' }]);

      const result = await getILCDFlowCategorization('en', ['all']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith(
        'ILCDFlowCategorization.min.json.gz',
      );
      expect(genClass).toHaveBeenCalledWith(mockData);
      expect(result).toEqual({
        data: [{ id: 'elem1', label: 'Elementary Flow' }],
        success: true,
      });
    });

    it('should fetch flow categorization from ILCD gzip cache with Chinese', async () => {
      const mockData = [{ '@id': 'elem1', '@name': 'Elementary Flow' }];
      const mockDataZH = [{ '@id': 'elem1', '@name': '基本流' }];
      getCachedOrFetchIlcdFileData
        .mockResolvedValueOnce(createFlowCategorizationDocument(mockData))
        .mockResolvedValueOnce(createFlowCategorizationDocument(mockDataZH));
      genClassZH.mockReturnValue([{ id: 'elem1', label: '基本流' }]);

      const result = await getILCDFlowCategorization('zh', ['all']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenNthCalledWith(
        1,
        'ILCDFlowCategorization.min.json.gz',
      );
      expect(getCachedOrFetchIlcdFileData).toHaveBeenNthCalledWith(
        2,
        'ILCDFlowCategorization_zh.min.json.gz',
      );
      expect(genClassZH).toHaveBeenCalledWith(mockData, mockDataZH);
      expect(result.success).toBe(true);
    });

    it('should keep only matched subtree when getValues is not all', async () => {
      const mockData = [
        {
          '@id': '1',
          '@name': 'Emissions',
          category: [
            {
              '@id': '1.1',
              '@name': 'Emissions to water',
            },
          ],
        },
        {
          '@id': '2',
          '@name': 'Resources',
        },
      ];
      getCachedOrFetchIlcdFileData.mockResolvedValue(createFlowCategorizationDocument(mockData));
      genClass.mockReturnValue([{ id: '1', label: 'Emissions' }]);

      await getILCDFlowCategorization('en', ['Emissions']);

      expect(genClass).toHaveBeenCalledWith([
        {
          '@id': '1',
          '@name': 'Emissions',
          category: [
            {
              '@id': '1.1',
              '@name': 'Emissions to water',
            },
          ],
        },
      ]);
    });

    it('should handle errors in flow categorization', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      getCachedOrFetchIlcdFileData.mockRejectedValue(new Error('Cache read error'));

      const result = await getILCDFlowCategorization('en', ['all']);

      expect(result).toEqual({
        data: [],
        success: false,
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getILCDFlowCategorizationAll', () => {
    it('should combine classification and categorization results', async () => {
      const mockClassData = [{ id: 'class1', label: 'Classification' }];
      const mockCatData = [{ id: 'cat1', label: 'Categorization' }];

      // Mock getILCDClassification
      getCPCClassification.mockResolvedValue({ data: [] });
      genClass.mockReturnValueOnce(mockClassData).mockReturnValueOnce(mockCatData);

      // Mock getILCDFlowCategorization
      getCachedOrFetchIlcdFileData.mockResolvedValue(createFlowCategorizationDocument([]));

      const result = await getILCDFlowCategorizationAll('en');

      expect(result).toEqual({
        data: {
          category: mockClassData,
          categoryElementaryFlow: mockCatData,
        },
        success: true,
      });
    });
  });

  describe('getILCDLocationAll', () => {
    it('should fetch all locations in English from ILCD gzip cache', async () => {
      const mockLocations = [
        { '@value': 'US', '#text': 'United States' },
        { '@value': 'CN', '#text': 'China' },
      ];
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: mockLocations,
        },
      });

      const result = await getILCDLocationAll('en');

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDLocations.min.json.gz');
      expect(result).toEqual({
        data: [{ file_name: 'ILCDLocations', location: mockLocations }],
        success: true,
      });
    });

    it('should fetch all locations in Chinese from ILCD gzip cache', async () => {
      const mockLocations = [{ '@value': 'CN', '#text': '中国' }];
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: mockLocations,
        },
      });

      const result = await getILCDLocationAll('zh');

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDLocations_zh.min.json.gz');
      expect(result).toEqual({
        data: [{ file_name: 'ILCDLocations_zh', location: mockLocations }],
        success: true,
      });
      expect(result.success).toBe(true);
    });

    it('should handle missing local data gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      getCachedOrFetchIlcdFileData.mockResolvedValue(null);

      const result = await getILCDLocationAll('en');

      expect(result).toEqual({
        data: [],
        success: false,
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getILCDLocationByValues', () => {
    it('should fetch locations by values in English from ILCD gzip cache', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [
            { '@value': 'US', '#text': 'United States' },
            { '@value': 'CN', '#text': 'China' },
          ],
        },
      });

      const result = await getILCDLocationByValues('en', ['US', 'CN']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDLocations.min.json.gz');
      expect(result).toEqual({
        data: [
          { '@value': 'US', '#text': 'United States' },
          { '@value': 'CN', '#text': 'China' },
        ],
        success: true,
      });
    });

    it('should fetch locations by values in Chinese from ILCD gzip cache', async () => {
      const mockData = [{ '@value': 'CN', '#text': '中国' }];
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [mockData[0], { '@value': 'US', '#text': '美国' }],
        },
      });

      const result = await getILCDLocationByValues('zh', ['CN']);

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDLocations_zh.min.json.gz');
      expect(result).toEqual({
        data: mockData,
        success: true,
      });
      expect(result.success).toBe(true);
    });

    it('should return empty array when get_values is empty', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [{ '@value': 'CN', '#text': 'China' }],
        },
      });

      const result = await getILCDLocationByValues('en', []);

      expect(result).toEqual({
        data: [],
        success: true,
      });
    });
  });

  describe('getILCDLocationByValue', () => {
    it('should format location with description when available', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [{ '@value': 'US', '#text': 'United States' }],
        },
      });

      const result = await getILCDLocationByValue('en', 'US');

      expect(result).toEqual({
        data: 'US (United States)',
        success: true,
      });
    });

    it('should return code only when description not available', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [{ '@value': 'XX' }],
        },
      });

      const result = await getILCDLocationByValue('en', 'XX');

      expect(result).toEqual({
        data: 'XX',
        success: true,
      });
    });

    it('should handle empty result array', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [],
        },
      });

      const result = await getILCDLocationByValue('en', 'UNKNOWN');

      expect(result).toEqual({
        data: 'UNKNOWN',
        success: true,
      });
    });

    it('should use Chinese file for Chinese language', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue({
        ILCDLocations: {
          location: [{ '@value': 'CN', '#text': '中国' }],
        },
      });

      const result = await getILCDLocationByValue('zh', 'CN');

      expect(getCachedOrFetchIlcdFileData).toHaveBeenCalledWith('ILCDLocations_zh.min.json.gz');
      expect(result.data).toBe('CN (中国)');
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle unknown category types', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue(createClassificationDocument('Contact', []));
      genClass.mockReturnValue([]);

      const result = await getILCDClassification('UnknownType', 'en', ['all']);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle empty get_values array', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue(createClassificationDocument('Source', []));
      genClass.mockReturnValue([]);

      const result = await getILCDClassification('Source', 'en', []);

      expect(result.success).toBe(true);
    });

    it('should handle empty local classification results', async () => {
      getCachedOrFetchIlcdFileData.mockResolvedValue(
        createClassificationDocument('LCIAMethod', []),
      );
      genClass.mockReturnValue([]);

      const result = await getILCDClassification('LCIAMethod', 'en', ['all']);

      expect(result).toEqual({
        data: [],
        success: true,
      });
    });
  });
});

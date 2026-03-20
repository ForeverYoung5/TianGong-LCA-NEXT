import { useResourceCacheMonitor } from '@/components/cacheMonitor/useResourceCacheMonitor';
import { act, render } from '@testing-library/react';

interface TestManifest {
  version: string;
  files: string[];
  cachedAt: number;
  decompressed: boolean;
}

const defaultLogMessages = {
  upToDate: 'cache up to date',
  start: 'cache start',
  success: (successCount: number, totalFiles: number) =>
    `cache success ${successCount}/${totalFiles}`,
  issues: (successCount: number, totalFiles: number, errorCount: number) =>
    `cache issues ${successCount}/${totalFiles}/${errorCount}`,
  failure: 'cache failure',
};

type HookOptions = Parameters<typeof useResourceCacheMonitor<TestManifest>>[0];

const TestResourceCacheMonitor = ({ options }: { options: HookOptions }) => {
  useResourceCacheMonitor<TestManifest>(options);
  return null;
};

describe('useResourceCacheMonitor', () => {
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

  const createOptions = (overrides: Partial<HookOptions> = {}): HookOptions => ({
    version: '1.0.0',
    files: ['a.json.gz', 'b.json.gz', 'c.json.gz'],
    batchSize: 2,
    getManifest: jest.fn<TestManifest | null, []>(() => null),
    setManifest: jest.fn<void, [TestManifest]>(),
    getCachedFileList: jest.fn<Promise<string[]>, []>().mockResolvedValue([]),
    cacheFile: jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true),
    logMessages: defaultLogMessages,
    startDelayMs: 3000,
    batchDelayMs: 100,
    maxCacheAgeHours: 24,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('skips recache when manifest is current and all files exist', async () => {
    const manifest: TestManifest = {
      version: '1.0.0',
      files: ['a.json.gz', 'b.json.gz', 'c.json.gz'],
      cachedAt: Date.now(),
      decompressed: true,
    };
    const options = createOptions({
      getManifest: jest.fn(() => manifest),
      getCachedFileList: jest.fn().mockResolvedValue(manifest.files),
    });

    render(<TestResourceCacheMonitor options={options} />);

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(options.getCachedFileList).toHaveBeenCalledTimes(1);
    expect(options.cacheFile).not.toHaveBeenCalled();
    expect(options.setManifest).not.toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(defaultLogMessages.upToDate);
  });

  it('recaches and persists manifest when files are missing', async () => {
    const manifest: TestManifest = {
      version: '1.0.0',
      files: ['a.json.gz', 'b.json.gz', 'c.json.gz'],
      cachedAt: Date.now(),
      decompressed: true,
    };
    const options = createOptions({
      getManifest: jest.fn(() => manifest),
      getCachedFileList: jest.fn().mockResolvedValue(['a.json.gz']),
    });

    render(<TestResourceCacheMonitor options={options} />);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(3000);
      await jest.runOnlyPendingTimersAsync();
    });

    expect(options.cacheFile).toHaveBeenCalledTimes(3);
    expect(options.cacheFile).toHaveBeenNthCalledWith(1, 'a.json.gz');
    expect(options.cacheFile).toHaveBeenNthCalledWith(2, 'b.json.gz');
    expect(options.cacheFile).toHaveBeenNthCalledWith(3, 'c.json.gz');
    expect(options.setManifest).toHaveBeenCalledTimes(1);
    expect(options.setManifest).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '1.0.0',
        files: ['a.json.gz', 'b.json.gz', 'c.json.gz'],
        decompressed: true,
      }),
    );
  });

  it('reports the configured failure log when manifest lookup throws', async () => {
    const error = new Error('manifest unavailable');
    const options = createOptions({
      getManifest: jest.fn(() => {
        throw error;
      }),
    });

    render(<TestResourceCacheMonitor options={options} />);

    await act(async () => {
      jest.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(defaultLogMessages.failure, error);
  });
});

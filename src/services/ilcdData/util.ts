export interface CachedJsonEntry<T = unknown> {
  filename: string;
  data: T;
  size: number;
  cachedAt: number;
}

const CACHE_KEY = 'ilcd_cache_manifest';
const CACHE_DB_NAME = 'ilcd_cache_db';
const CACHE_DB_VERSION = 1;
const CACHE_STORE_NAME = 'ilcd_files';

export interface IlcdCacheManifest {
  version: string;
  files: string[];
  cachedAt: number;
  decompressed: boolean;
}

export const initIndexedDbStore = (
  dbName: string,
  dbVersion: number,
  storeName: string,
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, { keyPath: 'filename' });
        store.createIndex('cachedAt', 'cachedAt', { unique: false });
      }
    };
  });
};

export const decompressGzipData = async (gzipData: ArrayBuffer): Promise<string> => {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream is not supported in this browser.');
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(gzipData));
      controller.close();
    },
  });

  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  const response = new Response(decompressedStream);
  return response.text();
};

export const putCachedJsonEntry = async (
  db: IDBDatabase,
  storeName: string,
  filename: string,
  data: unknown,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const cachedEntry: CachedJsonEntry = {
      filename,
      data,
      size: JSON.stringify(data).length,
      cachedAt: Date.now(),
    };

    const request = store.put(cachedEntry);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getCachedJsonEntry = async <T>(
  db: IDBDatabase,
  storeName: string,
  filename: string,
): Promise<CachedJsonEntry<T> | null> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(filename);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as CachedJsonEntry<T> | undefined;
      resolve(result ?? null);
    };
  });
};

export const getAllCachedKeys = async (db: IDBDatabase, storeName: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(((request.result as string[]) || []).map(String));
  });
};

export const getLocalStorageJson = <T>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
};

export const setLocalStorageJson = (key: string, value: unknown): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const initDB = (): Promise<IDBDatabase> => {
  return initIndexedDbStore(CACHE_DB_NAME, CACHE_DB_VERSION, CACHE_STORE_NAME);
};

export const getIlcdCacheManifest = (): IlcdCacheManifest | null => {
  return getLocalStorageJson<IlcdCacheManifest>(CACHE_KEY);
};

export const setIlcdCacheManifest = (manifest: IlcdCacheManifest): void => {
  setLocalStorageJson(CACHE_KEY, manifest);
};

export const getCachedIlcdFileList = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    return await getAllCachedKeys(db, CACHE_STORE_NAME);
  } catch (error) {
    console.error('Failed to get ILCD cached file list:', error);
    return [];
  }
};

export const getCachedIlcdFileData = async <T>(filename: string): Promise<T | null> => {
  try {
    const db = await initDB();
    const cachedEntry = await getCachedJsonEntry<T>(db, CACHE_STORE_NAME, filename);
    return cachedEntry?.data ?? null;
  } catch (error) {
    console.error(`Failed to read ILCD cached file ${filename}:`, error);
    return null;
  }
};

export const cacheAndDecompressIlcdFile = async (filename: string): Promise<boolean> => {
  try {
    const response = await fetch(`/ilcd/${filename}`);
    if (!response.ok) {
      console.warn(`ILCD source file not found: ${filename}`);
      return false;
    }

    const arrayBuffer = await response.arrayBuffer();
    const decompressedText = await decompressGzipData(arrayBuffer);
    const data = JSON.parse(decompressedText);

    const db = await initDB();
    await putCachedJsonEntry(db, CACHE_STORE_NAME, filename, data);

    return true;
  } catch (error) {
    console.error(`Failed to cache ILCD file ${filename}:`, error);
    return false;
  }
};

export const getCachedOrFetchIlcdFileData = async <T>(filename: string): Promise<T | null> => {
  const cachedData = await getCachedIlcdFileData<T>(filename);
  if (cachedData) {
    return cachedData;
  }

  const cached = await cacheAndDecompressIlcdFile(filename);
  if (!cached) {
    return null;
  }

  return getCachedIlcdFileData<T>(filename);
};

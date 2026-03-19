import {
  cacheAndDecompressIlcdFile,
  getCachedIlcdFileList,
  getIlcdCacheManifest,
  type IlcdCacheManifest,
  setIlcdCacheManifest,
} from '@/services/ilcdData/util';
import { useEffect } from 'react';

const ILCD_CACHE_VERSION = '1.1.0';
const ILCD_GZ_FILES = [
  'ILCDClassification.min.json.gz',
  'ILCDClassification_zh.min.json.gz',
  'ILCDFlowCategorization.min.json.gz',
  'ILCDFlowCategorization_zh.min.json.gz',
  'ILCDLocations.min.json.gz',
  'ILCDLocations_zh.min.json.gz',
];

const ILCDCacheMonitor = () => {
  useEffect(() => {
    const cacheIlcdFiles = async () => {
      try {
        const cachedManifest = getIlcdCacheManifest();
        const currentManifest: IlcdCacheManifest = {
          version: ILCD_CACHE_VERSION,
          files: ILCD_GZ_FILES,
          cachedAt: Date.now(),
          decompressed: true,
        };

        let shouldCache = false;

        if (!cachedManifest) {
          shouldCache = true;
        } else if (cachedManifest.version !== currentManifest.version) {
          shouldCache = true;
        } else if (JSON.stringify(cachedManifest.files) !== JSON.stringify(currentManifest.files)) {
          shouldCache = true;
        } else if (!cachedManifest.decompressed) {
          shouldCache = true;
        } else {
          const hoursSinceCache = (Date.now() - cachedManifest.cachedAt) / (1000 * 60 * 60);
          if (hoursSinceCache > 24) {
            shouldCache = true;
          } else {
            const cachedFiles = await getCachedIlcdFileList();
            const missingFiles = currentManifest.files.filter(
              (file) => !cachedFiles.includes(file),
            );

            if (missingFiles.length > 0) {
              shouldCache = true;
            } else {
              console.log('ILCD cache is up to date.');
              return;
            }
          }
        }

        if (!shouldCache) {
          return;
        }

        console.log('Starting ILCD files caching...');
        let successCount = 0;
        let errorCount = 0;

        const batchSize = 2;
        for (let i = 0; i < currentManifest.files.length; i += batchSize) {
          const batch = currentManifest.files.slice(i, i + batchSize);
          const results = await Promise.all(
            batch.map(async (file) => {
              try {
                return await cacheAndDecompressIlcdFile(file);
              } catch (error) {
                console.error(`Failed to cache ${file}:`, error);
                return false;
              }
            }),
          );

          for (const success of results) {
            if (success) {
              successCount++;
            } else {
              errorCount++;
            }
          }

          if (i + batchSize < currentManifest.files.length) {
            await new Promise<void>((resolve) => {
              setTimeout(() => {
                resolve();
              }, 100);
            });
          }
        }

        setIlcdCacheManifest(currentManifest);

        if (successCount === currentManifest.files.length) {
          console.log(`ILCD caching completed: ${successCount} files cached successfully.`);
        } else {
          console.log(
            `ILCD caching completed with issues: ${successCount}/${currentManifest.files.length} successful, ${errorCount} errors.`,
          );
        }
      } catch (error) {
        console.error('Failed to cache ILCD files:', error);
      }
    };

    const timer = setTimeout(() => {
      cacheIlcdFiles();
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return null;
};

export default ILCDCacheMonitor;

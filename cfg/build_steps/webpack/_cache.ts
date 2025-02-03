import { rwsPath, rwsRuntimeHelper } from '@rws-framework/console';
import fs from 'fs';
import path from 'path';
import md5 from 'md5';

interface CacheConfig {
  sourceHash: string;
  sourceFileName: string;
}
import chalk from 'chalk';
import { rmdir } from 'fs/promises';

interface CustomCompilationOptions {
  devDebug?: {
    rwsCache?: boolean;
  };
}

class RWSCacheSystem {
  private rwsDir: string;
  private customCompilationOptions: CustomCompilationOptions | undefined;
  private enabled: boolean;

  constructor(customCompilationOptions?: CustomCompilationOptions) {
    const WORKSPACE = rwsPath.findRootWorkspacePath(process.cwd());
    this.rwsDir = path.resolve(WORKSPACE, 'node_modules', '.rws');

    this.customCompilationOptions = customCompilationOptions;

    if (!fs.existsSync(this.rwsDir)) {
      fs.mkdirSync(this.rwsDir);
    }

    this.enabled = this.customCompilationOptions
      ? this.customCompilationOptions?.devDebug?.rwsCache === true
      : false;

    if (!this.enabled) {
      const frontCachePath = `${this.rwsDir}/front`;
      if (fs.existsSync(frontCachePath)) {
        console.log({ pat: frontCachePath });
        rmdir(frontCachePath, { recursive: true });
        console.log(chalk.red('[RWS CACHE] front cache removed.'));
      }
    }
  }

  hasCachedItem(filePath: string): boolean {
    return this.enabled ? rwsRuntimeHelper.getRWSVar(this.getCacheKey(filePath)) !== null : false;
  }

  getCachedItem(filePath: string, fileHash: string | null = null): string | null {
    if (!this.enabled) {
      return null;
    }

    const key = this.getCacheKey(filePath);
    const item = rwsRuntimeHelper.getRWSVar(key);
    let itemCfg: CacheConfig | null = null;
    const itemCfgStr = rwsRuntimeHelper.getRWSVar(`${key}.cfg.json`);

    if (itemCfgStr) {
      itemCfg = JSON.parse(itemCfgStr) as CacheConfig;
    }

    if (item) {
      if ((!itemCfg || !fileHash) || itemCfg.sourceHash !== fileHash) {
        return null;
      }

      return item;
    }
    
    return null;
  }

  cacheItem(filePath: string, processedContent: string, sourceContent: string): void {
    if (!this.enabled) {
      return;
    }

    const key = this.getCacheKey(filePath);

    rwsRuntimeHelper.setRWSVar(key, processedContent);
    rwsRuntimeHelper.setRWSVar(`${key}.cfg.json`, JSON.stringify({
      sourceHash: md5(sourceContent),
      sourceFileName: filePath
    }));
  }

  removeCacheItem(filePath: string): void {
    if (!this.enabled) {
      return;
    }

    const key = this.getCacheKey(filePath);
    rwsRuntimeHelper.removeRWSVar(key);
    rwsRuntimeHelper.removeRWSVar(`${key}.cfg.json`);
  }

  private getCacheKey(filePath: string): string {
    return `front/${md5(filePath)}`;
  }
}

interface RWSCacheType {
  _instance: RWSCacheSystem | null;
  cache(customCompilationOptions?: CustomCompilationOptions): RWSCacheSystem;
}

const RWSCache: RWSCacheType = {
  _instance: null,
  cache(customCompilationOptions?: CustomCompilationOptions): RWSCacheSystem {
    if (!this._instance) {
      this._instance = new RWSCacheSystem(customCompilationOptions);
    }

    return this._instance;
  }
};

export default RWSCache;

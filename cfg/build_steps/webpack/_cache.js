const { rwsPath, rwsRuntimeHelper } = require('@rws-framework/console');

const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const chalk = require('chalk');
const { rmdir } = require('fs/promises');

class RWSCacheSystem {        
    constructor(customCompilationOptions){        
        const WORKSPACE = rwsPath.findRootWorkspacePath(process.cwd());
        this.rwsDir = path.resolve(WORKSPACE, 'node_modules', '.rws');

        this.customCompilationOptions = customCompilationOptions;

        if(!fs.existsSync(this.rwsDir)){
            fs.mkdirSync(this.rwsDir);
        }

        this.enabled = this.customCompilationOptions ? (this.customCompilationOptions?.devDebug?.rwsCache) === true : false;

        if(!this.enabled){            
            if(fs.existsSync(this.rwsDir+'/front')){
                console.log({pat: this.rwsDir+'/front'});
                rmdir(this.rwsDir+'/front', { recursive: true });
                console.log(chalk.red('[RWS CACHE] front cache removed.'));
            }
        }
    }

    hasCachedItem(filePath){
        return this.enabled ? rwsRuntimeHelper.getRWSVar(this.getCacheKey(filePath)) !== null : false;
    }
    
    getCachedItem(filePath, fileHash = null){
        if(!this.enabled){
            return null;
        }

        const key = this.getCacheKey(filePath);
        const item = rwsRuntimeHelper.getRWSVar(key);
        let itemCfg = rwsRuntimeHelper.getRWSVar(key + '.cfg.json');
    
        if(itemCfg){
            itemCfg = JSON.parse(itemCfg);
        } 
    
        if(item){
            if((!itemCfg || !fileHash) || itemCfg.sourceHash !== fileHash){            
                return null;
            }
    
            return item;
        }else{
        return null;
        }
    }
    
    cacheItem(filePath, processedContent, sourceContent){  
        if(!this.enabled){
            return null;
        }

        const key = this.getCacheKey(filePath);
    
        rwsRuntimeHelper.setRWSVar(key, processedContent);
        rwsRuntimeHelper.setRWSVar(key + '.cfg.json', JSON.stringify({
            sourceHash: md5(sourceContent),
            sourceFileName: filePath
        }));
    }
    
    removeCacheItem(filePath){
        if(!this.enabled){
            return null;
        }

        rwsRuntimeHelper.removeRWSVar(this.getCacheKey(filePath));
        rwsRuntimeHelper.removeRWSVar(this.getCacheKey(filePath) + '.cfg.json');
    }
    
    getCacheKey(filePath){
        return `front/${md5(filePath)}`;
    }
}

const RWSCache = {
    _instance: null,
    cache: (customCompilationOptions) => {
        
        if(!this._instance){
            this._instance = new RWSCacheSystem(customCompilationOptions);
        }

        return this._instance;
    }
}

module.exports = RWSCache;
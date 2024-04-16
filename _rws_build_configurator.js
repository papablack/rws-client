const fs = require('fs');
const json5 = require('json5');

const _DEFAULT_CONFIG = require('./cfg/_default.cfg')._DEFAULT_CONFIG;
const STORAGE = require('./cfg/_storage');


function readConfigFile(filePath){
    if(!fs.existsSync(filePath)){
        return _DEFAULT_CONFIG;
    }

    const fileConfig = json5.parse(fs.readFileSync(filePath, 'utf-8'));

    return {        
        ...fileConfig
    }
}

function get(key){
    _init();

    return STORAGE.get(key);
}

function exportDefaultConfig(){
    return _DEFAULT_CONFIG;
}

function exportBuildConfig(){
    _init();

    return STORAGE.getAll();
}

function _init(){
    if(!STORAGE.isLoaded()){
        STORAGE.init(readConfigFile(process.cwd() + '/.rws.json'))        
    }
}

module.exports = {
    readConfigFile,
    exportDefaultConfig,
    exportBuildConfig,
    get,
    _DEFAULT_CONFIG
};
const fs = require('fs');
const json5 = require('json5');


const _STORAGE = { _loaded: false }

const _DEFAULT_CONFIG = {
    dev: false,
    hot: false,
    report: false,
    backendUrl: null,
    wsUrl: null,
    transports: ['websocket'],    
    parted: true,
    partedFileDir: './build',
    partedPrefix: 'rws',
    publicDir: './public',
    publicIndex: 'index.html',
    pubUrlPrefix: '/',    
    outputFileName: 'client.rws.js'
}

function readConfigFile(filePath){
    const fileConfig = json5.parse(fs.readFileSync(filePath, 'utf-8'));

    return {
        ..._DEFAULT_CONFIG,
        ...fileConfig
    }
}

function get(key){
    if(!_STORAGE._loaded){
        Object.assign(_STORAGE, readConfigFile(process.cwd() + '/.rws.json'));

        console.log(_STORAGE);
    }

    if(Object.keys(_STORAGE).includes(key)){
        return _STORAGE[key];
    }

    return null;
}


module.exports = {
    readConfigFile,
    get,
    _DEFAULT_CONFIG
};
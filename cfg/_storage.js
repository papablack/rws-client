class Storage {
    static _instance;

    _loaded = false;
    data = {}

    static create(){
        if(!this._instance){
            this._instance = new Storage();            
        }

        return this._instance;
    }
}

const _STORAGE = Storage.create();

function get(key){
    if(!has(key)){
        return null;
    }

    return _STORAGE.data[key];
}

function getAll(){    
    return _STORAGE.data;
}

function init(json){    
    _STORAGE.data = json;    
    _STORAGE._loaded = true;
}

function has(key){
    return Object.keys(_STORAGE.data).includes(key);
}

function isLoaded(){
    return _STORAGE._loaded;
}

module.exports = {get, getAll, has, init, isLoaded}
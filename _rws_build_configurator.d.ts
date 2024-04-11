declare const _DEFAULT_CONFIG: any;

declare function readConfigFile(filePath: string): any;
declare function get(key: string): any;
declare function exportConfig(): any;

export {
    readConfigFile,
    get,
    exportConfig,
    _DEFAULT_CONFIG
};

declare const _DEFAULT_CONFIG: any;

declare function readConfigFile(filePath: string): any;
declare function get(key: string): any;
declare function exportDefaultConfig(): any;
declare function exportBuildConfig(): any;

export {
    readConfigFile,
    get,
    exportDefaultConfig,
    exportBuildConfig,
    _DEFAULT_CONFIG
};

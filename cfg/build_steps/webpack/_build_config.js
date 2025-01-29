const chalk = require('chalk');
const { RWSConfigBuilder } = require('@rws-framework/console')
const { rwsPath } = require('@rws-framework/console');
const { _DEFAULT_CONFIG } = require('../../_default.cfg');

async function getBuildConfig(rwsFrontBuildConfig){
    const BuildConfigurator = new RWSConfigBuilder(rwsPath.findPackageDir(process.cwd()) + '/.rws.json', {..._DEFAULT_CONFIG, ...rwsFrontBuildConfig});
    const _packageDir = rwsPath.findPackageDir(process.cwd());

    const executionDir = rwsPath.relativize(BuildConfigurator.get('executionDir') || rwsFrontBuildConfig.executionDir || process.cwd(), _packageDir);
    const isWatcher = process.argv.includes('--watch') || false;  

    const isDev = isWatcher ? true : (BuildConfigurator.get('dev', rwsFrontBuildConfig.dev) || false);
    const isHotReload = BuildConfigurator.get('hot', rwsFrontBuildConfig.hot);
    const isReport = BuildConfigurator.get('report', rwsFrontBuildConfig.report);
    const isParted = BuildConfigurator.get('parted', rwsFrontBuildConfig.parted || false);

    const partedPrefix = BuildConfigurator.get('partedPrefix', rwsFrontBuildConfig.partedPrefix);
    const partedDirUrlPrefix = BuildConfigurator.get('partedDirUrlPrefix', rwsFrontBuildConfig.partedDirUrlPrefix);

    let partedComponentsLocations = BuildConfigurator.get('partedComponentsLocations', rwsFrontBuildConfig.partedComponentsLocations);
    const customServiceLocations = BuildConfigurator.get('customServiceLocations', rwsFrontBuildConfig.customServiceLocations); //@todo: check if needed
    const outputDir = rwsPath.relativize(BuildConfigurator.get('outputDir', rwsFrontBuildConfig.outputDir), _packageDir);

    const outputFileName = BuildConfigurator.get('outputFileName') || rwsFrontBuildConfig.outputFileName;
    const publicDir = BuildConfigurator.get('publicDir') || rwsFrontBuildConfig.publicDir;
    const serviceWorkerPath = BuildConfigurator.get('serviceWorker') || rwsFrontBuildConfig.serviceWorker;

    const publicIndex = BuildConfigurator.get('publicIndex') || rwsFrontBuildConfig.publicIndex;

    const devTools = isDev ? (BuildConfigurator.get('devtool') || 'source-map') : false;

    const _DEFAULT_DEV_DEBUG = { build: false, timing: false, rwsCache: false, profiling: false };

    let devDebug = isDev ? (BuildConfigurator.get('devDebug') || rwsFrontBuildConfig.devDebug || {}) : {};
    devDebug = {..._DEFAULT_DEV_DEBUG, ...devDebug}

    const devRouteProxy = BuildConfigurator.get('devRouteProxy') || rwsFrontBuildConfig.devRouteProxy;

    const tsConfigPath = rwsPath.relativize(BuildConfigurator.get('tsConfigPath') || rwsFrontBuildConfig.tsConfigPath, executionDir);

    const rwsPlugins = {};

    if(rwsFrontBuildConfig.rwsPlugins){
        for(const pluginEntry of rwsFrontBuildConfig.rwsPlugins){
          const pluginBuilder = (await import(`${pluginEntry}/build.js`)).default;      
          rwsPlugins[pluginEntry] = new pluginBuilder(BuildConfigurator, rwsFrontBuildConfig);
        }
      }

    return {
        executionDir,
        isWatcher,
        isDev,
        isHotReload,
        isReport,
        isParted,
        partedPrefix,
        partedDirUrlPrefix,
        partedComponentsLocations,
        customServiceLocations,
        outputDir,
        outputFileName,
        publicDir,
        serviceWorkerPath,
        publicIndex,
        devTools,
        devDebug,
        devRouteProxy,
        tsConfigPath,
        rwsPlugins,
        _packageDir,
        BuildConfigurator
    }
}

module.exports = { getBuildConfig }
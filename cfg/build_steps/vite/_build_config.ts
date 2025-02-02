import chalk from 'chalk';
import { RWSConfigBuilder, rwsPath } from '@rws-framework/console';
import { _DEFAULT_CONFIG } from '../../_default.cfg';

import { IRWSPlugin } from '../../../src/types/IRWSPlugin';

interface IRWSViteConfig {
  executionDir: string;
  isWatcher: boolean;
  isDev: boolean;
  isHotReload: boolean;
  isReport: boolean;
  isParted: boolean;
  partedPrefix?: string | null;
  partedDirUrlPrefix?: string | null;
  partedComponentsLocations?: string[];
  customServiceLocations?: string[];
  outputDir: string;
  outputFileName: string;
  publicDir?: string | null;
  serviceWorkerPath?: string | null,
  publicIndex?: string | null,
  devTools?: string | null,
  devDebug?: any,
  devRouteProxy?: any,
  tsConfigPath: string,
  rwsPlugins?: {
    [key: string]: IRWSPlugin
  },
  _packageDir?: string,
  BuildConfigurator: RWSConfigBuilder<any>
}

async function getBuildConfig(rwsFrontBuildConfig): Promise<IRWSViteConfig>
{
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
          const pluginBuilder = (await import(`${pluginEntry}`)).default;      
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

export { getBuildConfig }
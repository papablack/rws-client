import chalk from 'chalk';
import { RWSConfigBuilder, rwsPath } from '@rws-framework/console';
import { _DEFAULT_CONFIG } from '../../_default.cfg';

interface ConfigType {
  [key: string]: any;
}

interface RWSFrontBuildConfig extends ConfigType {
  executionDir?: string;
  dev?: boolean;
  hot?: boolean;
  report?: boolean;
  parted?: boolean;
  partedPrefix?: string;
  partedDirUrlPrefix?: string;
  partedComponentsLocations?: string[];
  customServiceLocations?: string[];
  outputDir?: string;
  outputFileName?: string;
  publicDir?: string;
  serviceWorker?: string;
  publicIndex?: string;
  devDebug?: DevDebug;
  devRouteProxy?: any;
  tsConfigPath?: string;
  rwsPlugins?: string[];
}

interface DevDebug {
  build?: boolean;
  timing?: boolean;
  rwsCache?: boolean;
  profiling?: boolean;
}

interface BuildConfig extends ConfigType {
  executionDir: string;
  isWatcher: boolean;
  isDev: boolean;
  isHotReload: boolean;
  isReport: boolean;
  isParted: boolean;
  partedPrefix: string | undefined;
  partedDirUrlPrefix: string | undefined;
  partedComponentsLocations: string[] | undefined;
  customServiceLocations: string[] | undefined;
  outputDir: string;
  outputFileName: string | undefined;
  publicDir: string | undefined;
  serviceWorkerPath: string | undefined;
  publicIndex: string | undefined;
  devTools: string | boolean;
  devDebug: DevDebug;
  devRouteProxy: any;
  tsConfigPath: string;
  rwsPlugins: Record<string, any>;
  _packageDir: string;
  BuildConfigurator: RWSConfigBuilder<ConfigType>;
}

interface PluginBuilder {
  new (configurator: RWSConfigBuilder<ConfigType>, config: RWSFrontBuildConfig): any;
}

export async function getBuildConfig(rwsFrontBuildConfig: RWSFrontBuildConfig): Promise<BuildConfig> {
  const BuildConfigurator = new RWSConfigBuilder<ConfigType>(
    `${rwsPath.findPackageDir(process.cwd())}/.rws.json`,
    { ..._DEFAULT_CONFIG, ...rwsFrontBuildConfig }
  );
  const _packageDir = rwsPath.findPackageDir(process.cwd());

  const executionDir = rwsPath.relativize(
    BuildConfigurator.get('executionDir') || rwsFrontBuildConfig.executionDir || process.cwd(),
    _packageDir
  );
  const isWatcher = process.argv.includes('--watch') || false;

  const isDev = isWatcher ? true : BuildConfigurator.get('dev', rwsFrontBuildConfig.dev) || false;
  const isHotReload = BuildConfigurator.get('hot', rwsFrontBuildConfig.hot);
  const isReport = BuildConfigurator.get('report', rwsFrontBuildConfig.report);
  const isParted = BuildConfigurator.get('parted', rwsFrontBuildConfig.parted || false);

  const partedPrefix = BuildConfigurator.get('partedPrefix', rwsFrontBuildConfig.partedPrefix);
  const partedDirUrlPrefix = BuildConfigurator.get('partedDirUrlPrefix', rwsFrontBuildConfig.partedDirUrlPrefix);

  const partedComponentsLocations = BuildConfigurator.get(
    'partedComponentsLocations',
    rwsFrontBuildConfig.partedComponentsLocations
  );
  const customServiceLocations = BuildConfigurator.get(
    'customServiceLocations',
    rwsFrontBuildConfig.customServiceLocations
  );
  const outputDir = rwsPath.relativize(
    BuildConfigurator.get('outputDir', rwsFrontBuildConfig.outputDir),
    _packageDir
  );

  const outputFileName = BuildConfigurator.get('outputFileName') || rwsFrontBuildConfig.outputFileName;
  const publicDir = BuildConfigurator.get('publicDir') || rwsFrontBuildConfig.publicDir;
  const serviceWorkerPath = BuildConfigurator.get('serviceWorker') || rwsFrontBuildConfig.serviceWorker;

  const publicIndex = BuildConfigurator.get('publicIndex') || rwsFrontBuildConfig.publicIndex;

  const devTools = isDev ? BuildConfigurator.get('devtool') || 'source-map' : false;

  const _DEFAULT_DEV_DEBUG: DevDebug = { build: false, timing: false, rwsCache: false, profiling: false };

  let devDebug = isDev
    ? BuildConfigurator.get('devDebug') || rwsFrontBuildConfig.devDebug || {}
    : {};
  devDebug = { ..._DEFAULT_DEV_DEBUG, ...devDebug };

  const devRouteProxy = BuildConfigurator.get('devRouteProxy') || rwsFrontBuildConfig.devRouteProxy;

  const tsConfigPath = rwsPath.relativize(
    BuildConfigurator.get('tsConfigPath') || rwsFrontBuildConfig.tsConfigPath,
    executionDir
  );

  const rwsPlugins: Record<string, any> = {};

  if (rwsFrontBuildConfig.rwsPlugins) {
    for (const pluginEntry of rwsFrontBuildConfig.rwsPlugins) {
      const { default: pluginBuilder } = await import(`${pluginEntry}/build.js`) as { default: PluginBuilder };
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
  };
}

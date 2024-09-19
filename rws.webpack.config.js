const { rwsPath } = require('@rws-framework/console');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');

const webpack = require('webpack');


const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const RWSWebpackPlugin = require('./webpack/rws_webpack_plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const buildInfo = require('./cfg/build_steps/webpack/_info');
const { loadAliases } = require('./cfg/build_steps/webpack/_aliases');
const { timingStart, timingStop, timeLog, toggleLogging } = require('./cfg/build_steps/webpack/_timing');
const { getRWSProductionSetup } = require('./cfg/build_steps/webpack/_production');
const { rwsExternals } = require('./cfg/build_steps/webpack/_rws_externals');

const tools = require('./_tools');
const { setComponentsChunks, scanComponents, generateRWSInfoFile, partedComponentsEvents } = require('./cfg/build_steps/webpack/_component_handling');
const { processEnvDefines } = require('./cfg/build_steps/webpack/_env_defines');
const { getBuildConfig } = require('./cfg/build_steps/webpack/_build_config');
const { createWebpackConfig } = require('./cfg/build_steps/webpack/_webpack_config');
const { executeRWSStartActions, timingActions, devActions } = require('./cfg/build_steps/webpack/_actions');
const { webpackDevServer } = require('./cfg/build_steps/webpack/_dev_servers');

const _MAIN_PACKAGE = rwsPath.findRootWorkspacePath(process.cwd());



const RWSWebpackWrapper = async (rwsFrontendConfig) => {
  const {
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
  } = await getBuildConfig(rwsFrontendConfig);

  timeLog({ devDebug });

  if (devDebug?.timing) {
    timingStart('build config');
  }

  // rwsPath.removeDirectory(outputDir, true);

  buildInfo.start(executionDir, tsConfigPath, outputDir, isDev, publicDir, isParted, partedPrefix, partedDirUrlPrefix, devTools, rwsFrontendConfig.rwsPlugins);

  //AFTER OPTION DEFINITIONS

  const _rws_defines = processEnvDefines(BuildConfigurator, rwsFrontendConfig, devDebug);

  let WEBPACK_PLUGINS = [
    // new ForkTsCheckerWebpackPlugin({
    //   async: false,
    //   typescript: {
    //     configFile: tsConfigPath,
    //     diagnosticOptions: {
    //       semantic: true,
    //       syntactic: true,
    //     },
    //   },
    // }),
    new webpack.DefinePlugin(_rws_defines),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
    new webpack.IgnorePlugin({
      resourceRegExp: /.*\.es6\.js$/,
      contextRegExp: /node_modules/
    }),
  ];

  if (isHotReload) {
    if (!publicDir) {
      throw new Error('No public dir set')
    }

    WEBPACK_PLUGINS.push(new HtmlWebpackPlugin({
      template: publicDir + '/' + publicIndex,
    }));
  }

  const WEBPACK_AFTER_ACTIONS = rwsFrontendConfig.actions || [];
  const WEBPACK_AFTER_ERROR_ACTIONS = rwsFrontendConfig.error_actions || [];

  const modules_setup = ['node_modules'];

  let optimConfig = null;
  let aliases = rwsFrontendConfig.aliases = {};

  aliases = { ...aliases, ...loadAliases(__dirname, path.resolve(_MAIN_PACKAGE, 'node_modules')) }

  const overridePlugins = rwsFrontendConfig.plugins || []

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];


  if (isReport) {
    WEBPACK_PLUGINS.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }));
  }

  executeRWSStartActions(WEBPACK_AFTER_ACTIONS, serviceWorkerPath, BuildConfigurator, rwsFrontendConfig);

  if (devDebug?.timing) {
    timingStop('build config');
  }

  if (isParted) {
    partedComponentsLocations = await partedComponentsEvents(partedComponentsLocations, rwsPlugins);
  }

  const RWSComponents = scanComponents(partedComponentsLocations, executionDir, __dirname);
  console.log(`${chalk.cyanBright('RWS Scanned')} ${chalk.yellowBright(RWSComponents.length)} components`);
  const { automatedChunks, automatedEntries } = setComponentsChunks(rwsFrontendConfig.entry, RWSComponents, isParted);

  generateRWSInfoFile(outputDir, automatedEntries);
  console.log(chalk.greenBright(`RWSInfo file generated.`));

  const tsValidated = tools.setupTsConfig(tsConfigPath, executionDir);

  if (!tsValidated) {
    throw new Error('RWS Webpack build failed.');
  }

  if (!isDev) {
    if (!optimConfig) {
      optimConfig = {};
    }

    optimConfig = getRWSProductionSetup(optimConfig, tsConfigPath);
  }

  const devExternalsVars = devActions(WEBPACK_AFTER_ACTIONS, executionDir, devDebug);
  timingActions(WEBPACK_AFTER_ACTIONS, WEBPACK_AFTER_ERROR_ACTIONS, devDebug);

  if (WEBPACK_AFTER_ACTIONS.length || WEBPACK_AFTER_ERROR_ACTIONS.length) {
    WEBPACK_PLUGINS.push(new RWSWebpackPlugin({ 
      actions: WEBPACK_AFTER_ACTIONS, 
      error_actions: WEBPACK_AFTER_ERROR_ACTIONS, 
      dev: isDev,
      devDebug 
    }));
  }

  let cfgExport = createWebpackConfig(
    executionDir,
    __dirname,
    _packageDir,
    isDev,
    devTools,
    devDebug,
    isParted,
    partedPrefix,
    outputDir,
    outputFileName,
    automatedChunks,
    modules_setup,
    aliases,
    tsConfigPath,
    WEBPACK_PLUGINS,
    rwsExternals,
    devExternalsVars
  );  

  if (optimConfig) {
    cfgExport.optimization = optimConfig;
  }

  for (const pluginKey of Object.keys(rwsPlugins)) {
    const plugin = rwsPlugins[pluginKey];
    cfgExport = await plugin.onBuild(cfgExport);
  }

  if (isDev) {
    webpackDevServer(BuildConfigurator, rwsFrontendConfig, cfgExport);
  }

  return cfgExport;
}



module.exports = RWSWebpackWrapper;
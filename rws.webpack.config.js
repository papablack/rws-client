const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const { rwsPath, RWSConfigBuilder } = require('@rws-framework/console');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const RWSAfterPlugin = require('./webpack/rws_after_plugin');

const chalk = require('chalk');

const tools = require('./_tools');

const buildInfo = require('./cfg/build_steps/webpack/_info');
const { loadAliases } = require('./cfg/build_steps/webpack/_aliases');
const { getRWSLoaders } = require('./cfg/build_steps/webpack/_loaders');
const { rwsExternals } = require('./cfg/build_steps/webpack/_rws_externals');

const { _DEFAULT_CONFIG } = require('./cfg/_default.cfg');
const { info } = require('console');

const _MAIN_PACKAGE = rwsPath.findRootWorkspacePath(process.cwd());
const RWSWebpackWrapper = async (config) => {
  const BuildConfigurator = new RWSConfigBuilder(rwsPath.findPackageDir(process.cwd()) + '/.rws.json', {..._DEFAULT_CONFIG, ...config});

  config.packageDir = rwsPath.findPackageDir(process.cwd());

  const executionDir = rwsPath.relativize(BuildConfigurator.get('executionDir') || config.executionDir || process.cwd(), config.packageDir);

  const isDev = BuildConfigurator.get('dev', config.dev);
  const isHotReload = BuildConfigurator.get('hot', config.hot);
  const isReport = BuildConfigurator.get('report', config.report);
  const isParted = BuildConfigurator.get('parted', config.parted || false);

  const partedPrefix = BuildConfigurator.get('partedPrefix', config.partedPrefix);
  const partedDirUrlPrefix = BuildConfigurator.get('partedDirUrlPrefix', config.partedDirUrlPrefix);

  let partedComponentsLocations = BuildConfigurator.get('partedComponentsLocations', config.partedComponentsLocations);
  const customServiceLocations = BuildConfigurator.get('customServiceLocations', config.customServiceLocations); //@todo: check if needed
  const outputDir = rwsPath.relativize(BuildConfigurator.get('outputDir', config.outputDir), config.packageDir);

  const outputFileName = BuildConfigurator.get('outputFileName') || config.outputFileName;
  const publicDir = BuildConfigurator.get('publicDir') || config.publicDir;
  const serviceWorkerPath = BuildConfigurator.get('serviceWorker') || config.serviceWorker;

  const publicIndex = BuildConfigurator.get('publicIndex') || config.publicIndex;

  const devTools = isDev ? (BuildConfigurator.get('devtool') || 'source-map') : false;
  const devDebug = isDev ? (BuildConfigurator.get('devDebug') || config.devDebug || { build: false }) : null;
  const devRouteProxy = BuildConfigurator.get('devRouteProxy') || config.devRouteProxy;

  let _rws_defines = {
    'process.env._RWS_DEFAULTS': JSON.stringify(BuildConfigurator.exportDefaultConfig()),
    'process.env._RWS_BUILD_OVERRIDE': JSON.stringify(BuildConfigurator.exportBuildConfig())
  }

  const rwsDefines = BuildConfigurator.get('rwsDefines') || config.rwsDefines || null;

  if(rwsDefines){
    _rws_defines = {..._rws_defines, ...rwsDefines};
  }

  console.log(_rws_defines);

  const tsConfigPath = rwsPath.relativize(BuildConfigurator.get('tsConfigPath') || config.tsConfigPath, executionDir);
  const rwsPlugins = {};

  if(config.rwsPlugins){
    for(const pluginEntry of config.rwsPlugins){
      const pluginBuilder = (await import(`${pluginEntry}/build.js`)).default;      
      rwsPlugins[pluginEntry] = new pluginBuilder(BuildConfigurator, config);
    }
  }

  rwsPath.removeDirectory(outputDir, true);

  buildInfo.start(executionDir, tsConfigPath, outputDir, isDev, publicDir, isParted, partedPrefix, partedDirUrlPrefix, devTools, config.rwsPlugins);

  //AFTER OPTION DEFINITIONS

  let WEBPACK_PLUGINS = [
    new webpack.DefinePlugin(_rws_defines),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
    new webpack.IgnorePlugin({
      resourceRegExp: /.*\.es6\.js$/,
      contextRegExp: /node_modules/
    })
  ];

  const WEBPACK_AFTER_ACTIONS = config.actions || [];
  const modules_setup = ['node_modules'];

  let optimConfig = null;
  let aliases = config.aliases = {};
  
  aliases = {...aliases, ...loadAliases(__dirname, path.resolve(_MAIN_PACKAGE, 'node_modules'))}

  const overridePlugins = config.plugins || []

  if (isHotReload) {
    if (!publicDir) {
      throw new Error('No public dir set')
    }

    WEBPACK_PLUGINS.push(new HtmlWebpackPlugin({
      template: publicDir + '/' + publicIndex,
    }));
  }

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];


  if (isReport) {
    WEBPACK_PLUGINS.push(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }));
  }

  if (serviceWorkerPath) {
    WEBPACK_AFTER_ACTIONS.push({
      type: 'service_worker',
      actionHandler: serviceWorkerPath
    });
  }

  const assetsToCopy = BuildConfigurator.get('copyAssets') || config.copyAssets;

  if (!!assetsToCopy) {
    WEBPACK_AFTER_ACTIONS.push({
      type: 'copy',
      actionHandler: assetsToCopy
    });
  } 

  const rwsInfoJson = outputDir + '/rws_info.json'
  const automatedEntries = {};
  const automatedChunks = {};

  const foundRWSUserClasses = tools.findComponentFilesWithText(executionDir, '@RWSView', ['dist', 'node_modules', '@rws-framework/client']);
  const foundRWSClientClasses = tools.findComponentFilesWithText(__dirname, '@RWSView', ['dist', 'node_modules']);
  let RWSComponents = [...foundRWSUserClasses, ...foundRWSClientClasses];    

  if (partedComponentsLocations) {
    partedComponentsLocations.forEach((componentDir) => {
      RWSComponents = [...RWSComponents, ...(tools.findComponentFilesWithText(path.resolve(componentDir), '@RWSView', ['dist', 'node_modules', '@rws-framework/client']))];
    });
  }

  RWSComponents.forEach((fileInfo) => {
    const isIgnored = fileInfo.isIgnored;

    if (isIgnored === true) {
      // console.warn('Ignored: '+ fileInfo.filePath);
      return;
    }

    automatedEntries[fileInfo.tagName] = fileInfo.filePath;

    if(isParted){
      automatedChunks[fileInfo.tagName] = fileInfo.filePath;
    }
  });

  if (isParted) {
    WEBPACK_PLUGINS.push(new webpack.BannerPlugin(tools.getPartedModeVendorsBannerParams(partedDirUrlPrefix, partedPrefix)));

    for (const pluginKey of Object.keys(rwsPlugins)){
      const plugin = rwsPlugins[pluginKey];
      partedComponentsLocations = await plugin.onComponentsLocated(partedComponentsLocations);
    }
    
    optimConfig = { splitChunks: {
      cacheGroups: {
        vendor: {
          test: (module) => {
            let importString = module.identifier();

            if (importString.split('!').length > 2) {
              importString = importString.split('!')[2];
            }

            const inNodeModules = importString.indexOf('node_modules') > -1;
            const inVendorPackage = importString.indexOf(__dirname) > -1;

            const inExecDir = importString.indexOf(executionDir) > -1;
            const isNoPartedComponent = !Object.keys(automatedEntries).find(key => importString.indexOf(path.resolve(path.dirname(automatedEntries[key]))) > -1);

            let isAvailableForVendors = (inNodeModules || inVendorPackage) && isNoPartedComponent;


            return isAvailableForVendors;
          },
          name: 'vendors',
          chunks: 'all',
        }
      }
    } };
  }

  fs.writeFileSync(rwsInfoJson, JSON.stringify({ components: Object.keys(automatedEntries) }, null, 2));

  const tsValidated = tools.setupTsConfig(tsConfigPath, executionDir);

  if (!tsValidated) {
    throw new Error('RWS Webpack build failed.');
  }  


    
  if(!isDev){
    if(!optimConfig){
      optimConfig = {};
    }

    optimConfig = {
      ...optimConfig,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            keep_classnames: true, // Prevent mangling of class names
            mangle: false, //@error breaks FAST view stuff if enabled for all assets              
            compress: !isDev ? {
              dead_code: true,
              pure_funcs:  ['console.log', 'console.info', 'console.warn']
            } : null,
            output: {
              comments: false,
              beautify: isDev
            },
          },        
          extractComments: false,
          parallel: true,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: ['default', {
              discardComments: { removeAll: false },
            }],
          },
        })      
      ]
    };
  }

  const devExternalsVars = {
    packed: [],
    ignored: [],
    frontendRequestContextCache: []
  }

  if(devDebug?.build){
    const debugDir = path.join(executionDir, '.debug');

    if(!fs.existsSync(debugDir)){
      fs.mkdirSync(debugDir)
    }

    WEBPACK_AFTER_ACTIONS.push({
      type: 'custom',
      actionHandler: () => {        
        fs.writeFileSync(path.join(debugDir, 'ignored.json'), JSON.stringify(devExternalsVars.ignored, null, 2));
        fs.writeFileSync(path.join(debugDir, 'packed.json'), JSON.stringify(devExternalsVars.packed, null, 2));
        fs.writeFileSync(path.join(debugDir, 'requestcache.json'), JSON.stringify(devExternalsVars.frontendRequestContextCache, null, 2));

        console.log(chalk.yellow('[RWS BUILD] (after)'), `saved in: ${debugDir}/(ignored/packed/requestcache).json`);
      }
    });
  }

  if (WEBPACK_AFTER_ACTIONS.length) {
    WEBPACK_PLUGINS.push(new RWSAfterPlugin({ actions: WEBPACK_AFTER_ACTIONS, dev: isDev }));
  }


  let cfgExport = {  
    context: executionDir,  
    entry: {
      client: config.entry,
      ...automatedChunks
    },
    mode: isDev ? 'development' : 'production',
    target: 'web',
    devtool: devTools,    
    output: {
      path: outputDir,
      filename: isParted ? (partedPrefix || 'rws') + '.[name].js' : outputFileName,
      sourceMapFilename: '[file].map',
    },
    resolve: {      
      extensions: ['.ts', '.js', '.scss', '.css'],
      modules: modules_setup,
      alias: {
        ...aliases
      }
    },
    module: {
      rules: getRWSLoaders(__dirname, path.resolve(config.packageDir, 'node_modules'), tsConfigPath),
    },
    plugins: WEBPACK_PLUGINS,    
    externals: rwsExternals(executionDir, modules_setup, {
      _vars: devExternalsVars
    })
  }

  if(optimConfig){
    cfgExport.optimization = optimConfig;
  }



  for (const pluginKey of Object.keys(rwsPlugins)){
    const plugin = rwsPlugins[pluginKey];
    cfgExport = await plugin.onBuild(cfgExport);
  }  

  if(isDev){
    const backendUrl = BuildConfigurator.get('backendUrl') || config.backendUrl;
    const apiPort = BuildConfigurator.get('apiPort') || config.apiPort;

    if(backendUrl && apiPort){
      // cfgExport.devServer = {
      //   hot: true, // Enable hot module replacement
      //   open: true, // Automatically open the browser
      // }
    }    
  }

  return cfgExport;
}



module.exports = RWSWebpackWrapper;
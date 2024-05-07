const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const uglify = require('uglify-js')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const chalk = require('chalk');
const RWSAfterPlugin = require('./webpack/rws_after_plugin');
const tools = require('./_tools');
const { _DEFAULT_CONFIG } = require('./cfg/_default.cfg');
const RWSConfigBuilder = require('@rws-framework/console').RWSConfigBuilder;
const RWSPath = require('@rws-framework/console').rwsPath;

const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');

const json5 = require('json5');
const { rwsPath } = require('@rws-framework/console');

const RWSWebpackWrapper = (config) => {
  const BuildConfigurator = new RWSConfigBuilder(RWSPath.findPackageDir(process.cwd()) + '/.rws.json', {..._DEFAULT_CONFIG, ...config});

  config.packageDir = RWSPath.findPackageDir(process.cwd());

  const executionDir = RWSPath.relativize(BuildConfigurator.get('executionDir') || config.executionDir || process.cwd(), config.packageDir);

  const isDev = BuildConfigurator.get('dev', config.dev);
  const isHotReload = BuildConfigurator.get('hot', config.hot);
  const isReport = BuildConfigurator.get('report', config.report);
  const isParted = BuildConfigurator.get('parted', config.parted || false);

  const partedPrefix = BuildConfigurator.get('partedPrefix', config.partedPrefix);
  const partedDirUrlPrefix = BuildConfigurator.get('partedDirUrlPrefix', config.partedDirUrlPrefix);

  const partedComponentsLocations = BuildConfigurator.get('partedComponentsLocations', config.partedComponentsLocations);
  const customServiceLocations = BuildConfigurator.get('customServiceLocations', config.customServiceLocations);
  const outputDir = RWSPath.relativize(BuildConfigurator.get('outputDir', config.outputDir), config.packageDir);

  const outputFileName = BuildConfigurator.get('outputFileName') || config.outputFileName;
  const publicDir = BuildConfigurator.get('publicDir') || config.publicDir;
  const serviceWorkerPath = BuildConfigurator.get('serviceWorker') || config.serviceWorker;

  const publicIndex = BuildConfigurator.get('publicIndex') || config.publicIndex;


  const tsConfigPath = rwsPath.relativize(BuildConfigurator.get('tsConfigPath') || config.tsConfigPath, executionDir);


  RWSPath.removeDirectory(outputDir, true);

  console.log(chalk.green('Build started with'))
  console.log({
    executionDir,
    tsConfigPath,
    outputDir,
    dev: isDev,
    publicDir,
    parted: isParted,
    partedPrefix,
    partedDirUrlPrefix
  });


  //AFTER OPTION DEFINITIONS

  let WEBPACK_PLUGINS = [
    new webpack.DefinePlugin({
      'process.env._RWS_DEFAULTS': JSON.stringify(BuildConfigurator.exportDefaultConfig()),
      'process.env._RWS_BUILD_OVERRIDE': JSON.stringify(BuildConfigurator.exportBuildConfig())
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/)
  ];

  const WEBPACK_AFTER_ACTIONS = config.actions || [];

  const aliases = config.aliases = {};
  aliases.fs = false;
  const modules_setup = [path.resolve(__dirname, 'node_modules'), 'node_modules'];
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

  if (WEBPACK_AFTER_ACTIONS.length) {
    WEBPACK_PLUGINS.push(new RWSAfterPlugin({ actions: WEBPACK_AFTER_ACTIONS }));
  }

  const rwsInfoJson = outputDir + '/rws_info.json'
  const automatedEntries = {};

  const foundRWSUserClasses = tools.findComponentFilesWithText(executionDir, '@RWSView', ['dist', 'node_modules', '@rws-framework/client']);
  const foundRWSClientClasses = tools.findComponentFilesWithText(__dirname, '@RWSView', ['dist', 'node_modules']);
  let RWSComponents = [...foundRWSUserClasses, ...foundRWSClientClasses];

  const servicePath = path.resolve(__dirname, 'src', 'services', '_service.ts');

  const servicesLocations = [
    path.resolve(__dirname, 'src', 'services'),
    path.resolve(executionDir, 'src', 'services')
  ];

  if (customServiceLocations) {
    customServiceLocations.forEach((serviceDir) => {
      servicesLocations.push(serviceDir);
    });
  }

  const optimConfig = {};

  if(!isDev){
    optimConfig.minimize = true;
    optimConfig.minimizer = [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true, // Prevent mangling of class names
          mangle: false, //@error breaks FAST view stuff if enabled for all assets             
          compress: {
            dead_code: true,
            pure_funcs: ['console.log', 'console.info', 'console.warn']
          },
          output: {
            comments: false
          },
        },
        extractComments: false,
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ];
  }
  

  if (isParted) {
    WEBPACK_PLUGINS.push(new webpack.BannerPlugin(tools.getPartedModeVendorsBannerParams(partedDirUrlPrefix, partedPrefix)));

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

      automatedEntries[fileInfo.sanitName] = fileInfo.filePath;
    });

    fs.writeFileSync(rwsInfoJson, JSON.stringify({ components: Object.keys(automatedEntries) }, null, 2));

    optimConfig.splitChunks = {
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
    };
  }

  const tsValidated = tools.setupTsConfig(tsConfigPath, executionDir);

  if (!tsValidated) {
    throw new Error('RWS Webpack build failed.');
  }

  const cfgExport = {
    entry: {
      client: config.entry,
      ...automatedEntries
    },
    mode: isDev ? 'development' : 'production',
    target: 'web',
    devtool: isDev ? (config.devtool || 'inline-source-map') : false,
    output: {
      path: outputDir,
      filename: isParted ? (partedPrefix || 'rws') + '.[name].js' : outputFileName,
      sourceMapFilename: '[file].map',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: modules_setup,
      alias: {
        ...aliases
      }
    },
    module: {
      rules: [    
        {
          test: /\.html$/,
          use: [
            path.resolve(__dirname, './webpack/loaders/rws_fast_html_loader.js')
          ],
        },
        {
          test: /\.css$/,
          use: [
            'css-loader',            
          ],
        },
        {
          test: /\.scss$/,
          use: [            
            path.resolve(__dirname, './webpack/loaders/rws_fast_scss_loader.js'),
          ],
        },
        {
          test: /\.(ts)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                allowTsInNodeModules: true,
                configFile: path.resolve(tsConfigPath)
              }
            },
            {
              loader: path.resolve(__dirname, './webpack/loaders/rws_fast_ts_loader.js'),
            }            
          ],
          exclude: /node_modules\/(?!\@rws-framework\/client)/,
        }
      ],
    },
    plugins: WEBPACK_PLUGINS,
    optimization: optimConfig,
  }

  // if(isDev){
    cfgExport.module.rules.push({
      test: /\.js$/,
      use: [
        path.resolve(__dirname, './webpack/loaders/rws_uncomments_loader.js'),                 
      ],
    })
  // }

  if (isHotReload) {
    cfgExport.devServer = {
      hot: true,
      static: publicDir
    }
  }

  return cfgExport;
}



module.exports = RWSWebpackWrapper;
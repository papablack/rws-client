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
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');

const json5 = require('json5');
const { rwsPath, RWSConfigBuilder } = require('@rws-framework/console');

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

  const devTools = isDev ? (config.devtool || 'inline-source-map') : false;

  const tsConfigPath = rwsPath.relativize(BuildConfigurator.get('tsConfigPath') || config.tsConfigPath, executionDir);
  const rwsPlugins = {};

  if(config.rwsPlugins){
    for(const pluginEntry of config.rwsPlugins){
      const pluginBuilder = (await import(`${pluginEntry}/build.js`)).default;      
      rwsPlugins[pluginEntry] = new pluginBuilder(BuildConfigurator, config);
    }
  }

  rwsPath.removeDirectory(outputDir, true);

  console.log(chalk.green('Build started with'))
  console.log({
    executionDir,
    tsConfigPath,
    outputDir,
    dev: isDev,
    publicDir,
    parted: isParted,
    partedPrefix,
    partedDirUrlPrefix,
    devtool: devTools
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

  const optimConfig = {};

  // if(!isDev){
    optimConfig.minimize = !isDev;
    optimConfig.minimizer = !isDev ? [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true, // Prevent mangling of class names
          mangle: false, //@error breaks FAST view stuff if enabled for all assets             
          compress: !isDev ? {
            dead_code: true,
            pure_funcs: ['console.log', 'console.info', 'console.warn']
          } : null,
          output: {
            comments: false
          },
        },
        extractComments: false,
        parallel: true,
      }),
      new CssMinimizerPlugin()      
    ] : [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true, // Prevent mangling of class names
          mangle: false, //@error breaks FAST view stuff if enabled for all assets            
          output: {
            comments: false
          },
        },
        extractComments: false,
        parallel: false,
      })
    ]
  // }
  

  if (isParted) {
    WEBPACK_PLUGINS.push(new webpack.BannerPlugin(tools.getPartedModeVendorsBannerParams(partedDirUrlPrefix, partedPrefix)));

    for (const pluginKey of Object.keys(rwsPlugins)){
      const plugin = rwsPlugins[pluginKey];
      partedComponentsLocations = await plugin.onComponentsLocated(partedComponentsLocations);
    }    

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

  let cfgExport = {  
    context: executionDir,  
    entry: {
      client: config.entry,
      ...automatedEntries
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
            {
              loader: 'html-loader'
            },
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
          exclude: [
            /node_modules\/(?!\@rws-framework\/[A-Z0-9a-z])/,
            /\.debug\.ts$/,  
          ],
        }
      ],
    },
    plugins: WEBPACK_PLUGINS,
    optimization: optimConfig,
  }

  // if(isDev){
    // cfgExport.module.rules.push({
    //   test: /\.js$/,
    //   use: [
    //     path.resolve(__dirname, './webpack/loaders/rws_uncomments_loader.js'),                 
    //   ],
    // })
  // }

  if (isHotReload) {
    cfgExport.devServer = {
      hot: true,
      static: publicDir
    }
  }

  for (const pluginKey of Object.keys(rwsPlugins)){
    const plugin = rwsPlugins[pluginKey];
    cfgExport = await plugin.onBuild(cfgExport);
  }

  return cfgExport;
}



module.exports = RWSWebpackWrapper;
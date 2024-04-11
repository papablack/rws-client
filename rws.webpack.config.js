const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const RWSAfterPlugin = require('./webpack/rws_after_plugin');
const { Console } = require('console');
const { Interface } = require('readline');
const ts = require('typescript');
const tools = require('./_tools');
const BuildConfigurator = require('./_rws_build_configurator');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlMinifier = require('html-minifier').minify;
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

let WEBPACK_PLUGINS = [];

/**
 *  The RWS webpack configurator.
 * 
 *  Example usage in importing file:
 * 
 *  RWSWebpackWrapper({
    dev: true,
    hot: false,
    tsConfigPath: executionDir + '/tsconfig.json',
    entry: `${executionDir}/src/index.ts`,
    executionDir: executionDir,
    publicDir:  path.resolve(executionDir, 'public'),
    outputDir:  path.resolve(executionDir, 'build'),
    outputFileName: 'jtrainer.client.js',
    copyToDir: {
      '../public/js/' : [
        './build/jtrainer.client.js',
        './build/jtrainer.client.js.map',
        './src/styles/compiled/main.css'
      ]
    },
    plugins: [
    
    ],
  });
 */
const RWSWebpackWrapper = (config) => {
  const executionDir = config.executionDir || process.cwd();

  const isDev = config.dev || BuildConfigurator.get('dev');
  const isHotReload = config.hot || BuildConfigurator.get('hot');
  const isReport = config.report || BuildConfigurator.get('report');
  const outputDir = config.outputDir || BuildConfigurator.get('outputDir');
  const outputFileName = config.outputFileName || BuildConfigurator.get('outputFileName');

  const publicDir = config.publicDir  || BuildConfigurator.get('publicDir');
  const serviceWorkerPath = config.serviceWorker  || BuildConfigurator.get('serviceWorker');

  const WEBPACK_AFTER_ACTIONS = config.actions || [];

  const publicIndex = config.publicIndex || BuildConfigurator.get('publicIndex');

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

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, new webpack.optimize.ModuleConcatenationPlugin(), ...overridePlugins];


  if (isDev && isReport) {
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

  if (!!config.copyToDir) {
    WEBPACK_AFTER_ACTIONS.push({
      type: 'copy',
      actionHandler: config.copyToDir
    });
  }

  if (WEBPACK_AFTER_ACTIONS.length) {
    WEBPACK_PLUGINS.push(new RWSAfterPlugin({ actions: WEBPACK_AFTER_ACTIONS }));
  }

  const splitInfoJson = config.outputDir + '/rws_chunks_info.json'
  const automatedEntries = {};

  const foundRWSUserClasses = tools.findComponentFilesWithText(executionDir, '@RWSView', ['dist', 'node_modules', '@rws-framework/client']);
  const foundRWSClientClasses = tools.findComponentFilesWithText(__dirname, '@RWSView', ['dist', 'node_modules']);
  let RWSComponents = [...foundRWSUserClasses, ...foundRWSClientClasses];

  const servicePath = path.resolve(__dirname, 'src', 'services', '_service.ts');

  const servicesLocations = [
    path.resolve(__dirname, 'src', 'services'),
    path.resolve(executionDir, 'src', 'services')
  ];

  if (config.customServiceLocations) {
    config.customServiceLocations.forEach((serviceDir) => {
      servicesLocations.push(serviceDir);
    });
  }

  const optimConfig = {
    minimizer: isDev ? [] : [
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
        extractComments: false
      }),
      new CssMinimizerPlugin(),

    ],
  };

  if (config.parted) {
    if (config.partedComponentsLocations) {
      config.partedComponentsLocations.forEach((componentDir) => {
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

    fs.writeFileSync(splitInfoJson, JSON.stringify(Object.keys(automatedEntries), null, 2));
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
  } else {
    if (fs.existsSync(splitInfoJson)) {
      fs.unlinkSync(splitInfoJson);
    }
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
      path: config.outputDir,
      filename: config.parted ? (config.partedPrefix || 'rws') + '.[name].js' : config.outputFileName,
      sourceMapFilename: '[file].map',
    },
    resolve: {
      extensions: ['.ts', '.js'],
      modules: modules_setup,
      alias: {
        ...aliases
      },
      plugins: [
        // new TsconfigPathsPlugin({configFile: config.tsConfigPath})
      ]
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [
            path.resolve(__dirname, './webpack/rws_fast_html_loader.js')
          ],
        },
        {
          test: /\.css$/,
          use: [
            'css-loader',
            // path.resolve(__dirname, './webpack/rws_fast_css_loader.js')
          ],
        },
        {
          test: /\.scss$/,
          use: [
            // 'css-loader',
            path.resolve(__dirname, './webpack/rws_fast_scss_loader.js'),
          ],
        },
        {
          test: /\.(ts)$/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                allowTsInNodeModules: true,
                configFile: path.resolve(config.tsConfigPath)
              }
            },
            {
              loader: path.resolve(__dirname, './webpack/rws_fast_ts_loader.js'),
            }
          ],
          exclude: /node_modules\/(?!\@rws-framework\/client)/,
        }
      ],
    },
    plugins: WEBPACK_PLUGINS,
    optimization: optimConfig,
  }

  if (isHotReload) {
    cfgExport.devServer = {
      hot: true,
      static: publicDir
    }
  }

  return cfgExport;
}



module.exports = RWSWebpackWrapper;
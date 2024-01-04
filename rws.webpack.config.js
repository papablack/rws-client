const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


let WEBPACK_PLUGINS = [
  
];

const RWSWebpackWrapper = (config) => {
  const executionDir = config.executionDir || process.cwd();

  const isDev = config.dev;
  const isHotReload = config.hot;

  const publicDir = config.publicDir || null;
  const publicIndex = config.publicIndex || 'index.html';
  
  const aliases = config.aliases = {};

  const modules_setup = [path.resolve(__dirname, 'node_modules'), 'node_modules'];

  const overridePlugins = config.plugins || []

  if (isHotReload){
    if(!publicDir){
      throw new Error('No public dir set')
    }
    
    WEBPACK_PLUGINS.push(new HtmlWebpackPlugin({
      template: publicDir + '/' + publicIndex,      
    }));
  }

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, new webpack.optimize.ModuleConcatenationPlugin(), ...overridePlugins];

  const splitInfoJson = config.outputDir + '/rws_chunks_info.json'
  const automatedEntries = {};

  const foundRWSUserClasses = findFilesWithText(executionDir, 'extends RWSViewComponent', ['dist', 'node_modules', '@rws-js-client']);
  const foundRWSClientClasses = findFilesWithText(__dirname, 'extends RWSViewComponent', ['dist', 'node_modules']);

  const RWSComponents = [...foundRWSUserClasses, ...foundRWSClientClasses];

  RWSComponents.forEach((file) => {
    const fileParts = file.split('/');

    const componentName = fileParts[fileParts.length-2].replace(/-/g, '_');
    automatedEntries[componentName] = file;
  });

  fs.writeFileSync(splitInfoJson, JSON.stringify(Object.keys(automatedEntries), null, 2));

  const optimConfig = {
    minimizer: [
      new JsMinimizerPlugin(),
      new CssMinimizerPlugin()
    ],    
  };

  if(config.parted){
    optimConfig['splitChunks'] = {
      cacheGroups: {
        fast: {
          test: /fast-components/,
          name: 'fast',
          chunks: 'all',
          enforce: true
        },
        vendor: {
          test: /[\\/]node_modules[\\/](?!@microsoft[\\/]fast-components[\\/])/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
  }

  const cfgExport = {
    entry: {
      ...automatedEntries,
      main_rws: config.entry
    },
    mode: isDev ? 'development' : 'production',
    target: 'web',
    devtool: config.devtool || 'inline-source-map',
    output: {
      path: config.outputDir,
      filename: config.parted ? 'rws.[name].js' : config.outputFileName,
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
            path.resolve(__dirname, './webpack/rws_fast_css_loader.js')
          ],
        },
        {
          test: /\.scss$/,
          use: [                 
            'css-loader',
            // 'sass-loader',       
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
          exclude: /node_modules\/(?!rws-js-client)/,
        }
      ],
    },
    plugins: WEBPACK_PLUGINS,
    optimization: optimConfig,    
  }

  if(isHotReload){
    cfgExport.devServer = {
      hot: true,      
      static: publicDir  
    }
  }
  
  return cfgExport;
}

function findFilesWithText(dir, text, ignored = [], fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
      const filePath = path.join(dir, file);
      const fileStat = fs.statSync(filePath);

      if (fileStat.isDirectory() && !ignored.includes(file)) {
          // Recursively search this directory
          findFilesWithText(filePath, text, ignored, fileList);
      } else if (fileStat.isFile() && filePath.endsWith('.ts')) {
          // Read file content and check for text
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes(text)) {
              fileList.push(filePath);
          }
      }
  });

  return fileList;
}

module.exports = RWSWebpackWrapper;
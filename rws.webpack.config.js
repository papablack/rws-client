const path = require('path');
const webpack = require('webpack');

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

  WEBPACK_PLUGINS = [...WEBPACK_PLUGINS, ...overridePlugins];

  const cfgExport = {
    entry: config.entry,
    mode: isDev ? 'development' : 'production',
    target: 'web',
    devtool: config.devtool || 'inline-source-map',
    output: {
      path: config.outputDir,
      filename: config.outputFileName,
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
    optimization: {
      minimizer: [
        new JsMinimizerPlugin(),
        new CssMinimizerPlugin()
      ]
    }    
  }

  if(isHotReload){
    cfgExport.devServer = {
      hot: true,      
      static: publicDir  
    }
  }
  
  return cfgExport;
}

module.exports = RWSWebpackWrapper;
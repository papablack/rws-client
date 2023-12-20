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

  const publicDir = config.publicDir || path.resolve(executionDir, 'public');
  const publicIndex = config.publicIndex || 'index.html';
  
  const aliases = config.aliases = {};

  const overridePlugins = config.plugins || []

  if (isHotReload){
    WEBPACK_PLUGINS.push(new HtmlWebpackPlugin({
      template: publicDir + '/' + publicIndex,
      // filename: publicIndex
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
      alias: {      
        '@rws': path.resolve(__dirname),
        ...aliases
      },      
      plugins: [
        new TsconfigPathsPlugin({configFile: executionDir + './tsconfig.json'})
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
          test: /\.(ts|js)$/,
          use: [
            'ts-loader',
            path.resolve(__dirname, './webpack/rws_fast_ts_loader.js'),          
          ],          
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
      static: executionDir + '/public'  
    }
  }

  return cfgExport;
}

module.exports = RWSWebpackWrapper;
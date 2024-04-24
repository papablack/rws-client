const path = require('path');
const webpack = require('webpack');
const tools = require('@rws-framework/client/_tools');
const gThis = require.resolve('globalthis')
const {rwsExternals} = require('@rws-framework/client/_rws_externals');


const executionDir = process.cwd();
const rootPackageNodeModules = path.resolve(tools.findRootWorkspacePath(process.cwd()), 'node_modules');

const mergeCodeBaseOptions = {
  incl: ['@rws-framework/client/src/services'],
  not_incl: ['./services/RoutingService'],
  exceptions_context: ['socket.io-', '@socket.io'],
  exceptions: ['@rws-framework/client/src/services', './service', './ws_handlers', 'socket.io-', '@socket.io','uuid',]
};

module.exports = {
  entry: process.env.SWPATH,
  mode: 'development',
  target: 'web',
  devtool: 'source-map',
  output: {
    path: path.resolve(executionDir, 'public'),
    filename: 'service_worker.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      document: false,
      globalThis:  gThis,
      '@cwd' : process.cwd(),
      // '@rws-framework/client': path.resolve(__dirname, '..') + '/index.ts',
      // '@rws-framework/client/*': path.resolve(__dirname, '..', '..')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      global: 'globalThis' // Use 'globalThis' as a fallback for the global object
    }),
    new webpack.DefinePlugin({
      '__SWPATH': "'" + process.env.SWPATH + "'",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts)$/,
        use: [                       
          {
            loader: 'ts-loader',
            options: {
              allowTsInNodeModules: true,
              configFile: path.resolve(__dirname, 'tsconfig.json')            
            }
          },
          {
            loader: path.resolve(tools.findPackageDir(),'webpack','rws_fast_ts_loader.js'),        
          }  
        ]         
      }
    ],
  },
  resolveLoader: {
    modules: [rootPackageNodeModules],
  }
};
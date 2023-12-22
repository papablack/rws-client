const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const RWSWebpackWrapper  = require('./rws.webpack.config');


const executionDir = process.cwd();

module.exports = RWSWebpackWrapper({
  dev: true,
  hot: false,
  entry: `./src/index.ts`,
  tsConfigPath: './tsconfig.json',
  executionDir: __dirname,  
  outputDir:  path.resolve(__dirname, 'build'),
  outputFileName: 'rws.client.js'
});
const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const RWSSassPlugin = require('./webpack/rws_sass_plugin');

module.exports = {
  entry: `${process.cwd()}/src/index.ts`,
  mode: 'development',
  target: 'web',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'rws.client.js',
  },
  resolve: {
    extensions: ['.ts', '.js'],  
    alias: {
      '@App': path.resolve(process.cwd(), 'src'),
    },  
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
          'sass-loader',
        ],
      },
      {
        test: /\.(ts|js)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ],
  },
  plugins: [
    new RWSSassPlugin()
  ],
  optimization: {
    minimizer: [
      new JsMinimizerPlugin(),
      new CssMinimizerPlugin()
    ]
  }
};
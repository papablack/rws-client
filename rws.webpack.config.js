const path = require('path');
const keysTransformer = require('ts-transformer-keys/transformer').default;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const JsMinimizerPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


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
          test: /\.(js|ts)$/,
          exclude: /node_modules/,        
          use: `${process.cwd()}/node_modules/ts-loader/dist/index.js`        
        },
        {
          test: /\.(scss|css)$/, 
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                // This ensures the outputted CSS file is in the same folder as the SCSS file
                publicPath: (resourcePath, context) => {
                  return path.relative(path.dirname(resourcePath), context) + '/';
                },
              },
            },
            'css-loader',
            'sass-loader',
          ],
        }       
      ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
  optimization: {
    minimizer: [
      new JsMinimizerPlugin(),
      new CssMinimizerPlugin()
    ]
  }
};
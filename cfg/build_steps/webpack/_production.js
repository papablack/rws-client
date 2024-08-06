const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');


function getRWSProductionSetup(optimConfig){

  return {
    ...optimConfig,
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true, // Prevent mangling of class names
          mangle: false, //@error breaks FAST view stuff if enabled for all assets              
          compress: {
            dead_code: true,
            pure_funcs:  ['console.log', 'console.info', 'console.warn']
          },
          output: {
            comments: false,
            beautify: false                  
          },
        },        
        extractComments: false,
        parallel: true,
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', {
            discardComments: { removeAll: false },
          }],
        },
      })      
    ]
  };
}

module.exports = { getRWSProductionSetup }
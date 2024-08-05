const path = require('path');

function getRWSLoaders(packageDir, nodeModulesPath, tsConfigPath){
  console.log(packageDir, nodeModulesPath, tsConfigPath);

  const scssLoader = packageDir + '/webpack/loaders/rws_fast_scss_loader.js';
  const tsLoader = packageDir + '/webpack/loaders/rws_fast_ts_loader.js';
  const htmlLoader = packageDir + '/webpack/loaders/rws_fast_html_loader.js';

  return [    
      {
          test: /\.html$/,
          use: [
              {
                  loader: htmlLoader, 
              },
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
            loader: tsLoader,
          }            
        ],
        exclude: [
          /node_modules\/(?!\@rws-framework\/[A-Z0-9a-z])/,
          /\.debug\.ts$/,  
          /\.d\.ts$/,  
        ],
      },
      {
        test: /\.scss$/i,
        use: [                                              
          scssLoader,
        ],
      },
  ]
}

module.exports = { getRWSLoaders }
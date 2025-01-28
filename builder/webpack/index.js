const scssLoader = require('./loaders/rws_fast_scss_loader');
const htmlLoader = require('./loaders/rws_fast_html_loader');
const tsLoader = require('./loaders/rws_fast_ts_loader');
const { RWSWebpackWrapper  } = require('./rws.webpack.config');

module.exports = {
    RWSWebpackWrapper,    
    scssLoader,
    htmlLoader,
    tsLoader
}


function webpackDevServer(BuildConfigurator, rwsFrontendConfig, cfgExport){
    const backendUrl = BuildConfigurator.get('backendUrl') || rwsFrontendConfig.backendUrl;
    const apiPort = BuildConfigurator.get('apiPort') || rwsFrontendConfig.apiPort;
    
    if (backendUrl && apiPort) {
        // cfgExport.devServer = {
        //   hot: true, // Enable hot module replacement
        //   open: true, // Automatically open the browser
        // }
    }
}

module.exports = { webpackDevServer }
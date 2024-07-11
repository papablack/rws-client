const _DEFAULT_CONFIG_VARS = {
    //Build configs
    dev: false,
    hot: false,
    report: false,   
    publicDir: './public',
    publicIndex: 'index.html',      
    outputFileName: 'rws.client.js',
    outputDir: './build',
    tsConfigPath: './tsconfig.json',
    //Frontend RWS client configs  
    backendUrl: null,
    wsUrl: null,
    partedDirUrlPrefix: '/',
    partedPrefix: 'rws',
    pubUrlFilePrefix: '/',
    //Universal configs
    transports: ['websocket'],    
    parted: false,        
    devRouteProxy: '/api',
    devApiPort: 3002,
    plugins: []
}

const _DEFAULT_CONFIG = Object.freeze(_DEFAULT_CONFIG_VARS);

module.exports = {_DEFAULT_CONFIG};
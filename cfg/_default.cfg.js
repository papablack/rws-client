const _DEFAULT_CONFIG_VARS = {
    //Build configs
    dev: false,
    hot: false,
    report: false,   
    publicDir: './public',
    publicIndex: 'index.html',      
    outputFileName: 'client.rws.js',
    outputDir: './build',
    //Frontend RWS client configs  
    backendUrl: null,
    wsUrl: null,
    partedDirUrlPrefix: '/lib/rws',
    partedPrefix: 'rws',
    pubUrlFilePrefix: '/',
    //Universal configs
    transports: ['websocket'],    
    parted: false,        
}

const _DEFAULT_CONFIG = Object.freeze(_DEFAULT_CONFIG_VARS);

module.exports = {_DEFAULT_CONFIG};
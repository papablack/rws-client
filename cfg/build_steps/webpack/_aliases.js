const path = require('path');

function loadAliases(packageDir, nodeModulesPath){
    return {
        fs: false,
        path: false,
        http: false,
        https: false,
        os: false,
        stream: false,
        '@rws-framework/foundation': path.resolve(packageDir, 'foundation', 'rws-foundation.js')
    }
}

module.exports = { loadAliases }
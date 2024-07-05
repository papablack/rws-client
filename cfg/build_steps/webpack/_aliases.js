const path = require('path');

function loadAliases(packageDir, nodeModulesPath){
    return {
        fs: false,
        '@rws-framework/foundation': path.resolve(packageDir, 'foundation', 'rws-foundation.js')
    }
}

module.exports = { loadAliases }
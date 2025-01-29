const { getRWSLoaders } = require('./_loaders');
const path = require('path');

function createWebpackConfig(
    executionDir,
    clientPkgPath,
    _packageDir,
    isDev,
    devTools,
    devDebug,
    isParted,
    partedPrefix,
    outputDir,
    outputFileName,
    automatedChunks,
    modules_setup,
    aliases,
    tsConfigPath,
    WEBPACK_PLUGINS,
    rwsExternals,
    devExternalsVars
) {
    return {
        context: executionDir,
        entry: {
            ...automatedChunks
        },
        mode: isDev ? 'development' : 'production',
        target: 'web',
        devtool: devTools,
        output: {
            path: outputDir,
            filename: isParted ? (partedPrefix || 'rws') + '.[name].js' : outputFileName,
            sourceMapFilename: '[file].map',
        },
        resolve: {
            extensions: ['.ts', '.js', '.scss', '.css'],
            modules: modules_setup,
            alias: {
                ...aliases
            }
        },
        module: {
            rules: getRWSLoaders(clientPkgPath, path.resolve(_packageDir, 'node_modules'), tsConfigPath, devDebug),
        },
        plugins: WEBPACK_PLUGINS,
        externals: rwsExternals(executionDir, modules_setup, automatedChunks, {
            _vars: devExternalsVars
        }),
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        }
    }
}

module.exports = { createWebpackConfig }
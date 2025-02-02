const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { processEnvDefines } = require('./_env_defines');
const path = require('path');

const RWS_WEBPACK_PLUGINS_BAG = {
    _plugins: [],
    add(plugin) {
        if (Array.isArray(plugin)) {
            if (!plugin.length) {
                return;
            }

            plugin.forEach((item) => {
                RWS_WEBPACK_PLUGINS_BAG.add(item);
            })
        } else {
            if (!plugin) {
                return;
            }

            if (!this._plugins.includes(plugin)) {
                this._plugins.push(plugin);
            }
        }
    },
    getPlugins() {
        return this._plugins
    }
}

function getPackageModPlugins() {
    return [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
        new webpack.IgnorePlugin({
            resourceRegExp: /.*\.es6\.js$/,
            contextRegExp: /node_modules/
        }),
    ]
}

function getDefinesPlugins(BuildConfigurator, rwsFrontendConfig, devDebug) {
    const _rws_defines = processEnvDefines(BuildConfigurator, rwsFrontendConfig, devDebug);

    return [
        new webpack.DefinePlugin(_rws_defines)
    ]
}

function getBuilderDevPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath, devDebug) {    
    if(!devDebug?.profiling){
        return [];
    }

    const profiling =  new webpack.debug.ProfilingPlugin({
        outputPath: path.join(BuildConfigurator.get('outputDir') || rwsFrontendConfig.outputDir, '.profiling/profileEvents.json'),
    });

    
    return [
        profiling
    ]
}

function getBuilderOptimPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath) {
    return [
        
    ]
}

function addStartPlugins(rwsFrontendConfig, BuildConfigurator, devDebug, isHotReload, isReport, tsConfigPath) {

    RWS_WEBPACK_PLUGINS_BAG.add([
        ...getDefinesPlugins(BuildConfigurator, rwsFrontendConfig, devDebug),
        ...getBuilderDevPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath, devDebug),
        ...getBuilderOptimPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath),
        ...getPackageModPlugins()
    ]);

    if (isHotReload) {
        if (!publicDir) {
            throw new Error('No public dir set')
        }

        RWS_WEBPACK_PLUGINS_BAG.add(new HtmlWebpackPlugin({
            template: publicDir + '/' + publicIndex,
        }));
    }

    const overridePlugins = rwsFrontendConfig.plugins || []

    RWS_WEBPACK_PLUGINS_BAG.add(overridePlugins);

    if (isReport) {
        RWS_WEBPACK_PLUGINS_BAG.add(new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }));
    }
}

module.exports = { RWS_WEBPACK_PLUGINS_BAG, addStartPlugins };
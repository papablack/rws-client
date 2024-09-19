const webpack = require('webpack')

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

function addStartPlugins(_rws_defines, rwsFrontendConfig, isHotReload, isReport) {
    RWS_WEBPACK_PLUGINS_BAG.add([
        // new ForkTsCheckerWebpackPlugin({
        //   async: false,
        //   typescript: {
        //     configFile: tsConfigPath,
        //     diagnosticOptions: {
        //       semantic: true,
        //       syntactic: true,
        //     },
        //   },
        // }),
        new webpack.DefinePlugin(_rws_defines),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
        new webpack.IgnorePlugin({
            resourceRegExp: /.*\.es6\.js$/,
            contextRegExp: /node_modules/
        }),
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
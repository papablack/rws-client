const RWSCssPlugin = require("../rws_scss_plugin");
const path = require('path');
const cssLoader = require('css-loader');

module.exports = function(content) {
    const callback = this.async();
    const plugin = new RWSCssPlugin();
    const filePath = this.resourcePath;

    const options = this.getOptions() || { minify: false };

    const isDev = this._compiler.options.mode === 'development';    

    const saveFile = content.indexOf('@save') > -1;  
    let fromTs = false;

    if (plugin.checkForImporterType(this._module, 'ts')) {
        fromTs = true;
    }

    try {
        const code = plugin.compileScssCode(content, path.dirname(filePath), null, filePath, !isDev);        

        if (fromTs) {
            if (saveFile && code) {
                plugin.writeCssFile(filePath, code); 
                
                const newContext = this;

                // Properly setup the context for css-loader
                const loaderContext = {
                    ...newContext,                              
                    query: { sourceMap: isDev }, 
                    async: () => (err, output) => {
                        if (err) {
                            callback(err);
                            return;
                        }
                        callback(null, output);
                    }
                };

                // Execute css-loader
                cssLoader.call(loaderContext, code);
            } else {
                const tsCode = `import { css } from '@microsoft/fast-element';\nexport default css\`${code}\`;`;
                callback(null, tsCode);
            }
        } else {
            callback(null, code);
        }
    } catch (e) {
        console.error(e);
        callback(e);
    }
};

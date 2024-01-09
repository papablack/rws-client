const RWSPlugin = require("./rws_plugin");
const path = require('path');
const cssLoader = require('css-loader');

module.exports = function(content) {
    const callback = this.async();
    const plugin = new RWSPlugin();
    const filePath = this.resourcePath;

    const saveFile = content.indexOf('@save') > -1;  
    let fromTs = false;

    if (plugin.checkForImporterType(this._module, 'ts')) {
        fromTs = true;
    }

    try {
        const code = plugin.compileScssCode(content, path.dirname(filePath));        

        if (fromTs) {
            if (saveFile && code) {
                plugin.writeCssFile(filePath, code);        

                // Properly setup the context for css-loader
                const loaderContext = {
                    ...this,
                    query: { sourceMap: true }, // Assuming you want source maps
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

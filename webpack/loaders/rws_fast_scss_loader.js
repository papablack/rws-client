const RWSCssPlugin = require("../rws_scss_plugin");
const path = require('path');
const cssLoader = require('css-loader');
// const { css } = require('@microsoft/fast-element') 

// function makeFastResource(context, code){
//     return function(){ return css`${code}`; }.bind(context)(); 
// }

module.exports = function(content) {
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
        const codeData = plugin.compileScssCode(content, path.dirname(filePath), null, filePath, !isDev);        

        const code = codeData.code;
        const deps = codeData.dependencies;        

        for (const dependency of deps){
            this.addDependency(dependency);
        }

        if (fromTs && saveFile && code) {
            plugin.writeCssFile(filePath, code);
        }

        // if(!fromTs){
        //     return (context) => makeFastResource(context, code); 
        // }

        // Properly setup the context for css-loader

        const callback = this.async();
        const loaderContext = {
            ...this,
            query: { sourceMap: isDev },
            async: () => (err, output) => {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, output);
            }
        };

        // Execute css-loader with the generated CSS code
        cssLoader.call(loaderContext, code);                   

    } catch (e) {
        console.error(e);
        callback(e);
    }
};

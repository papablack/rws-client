// custom-css-loader.js
const RWSPlugin = require("./rws_plugin");
const plugin = new RWSPlugin();

module.exports = function(content) {  

    if(this.resourcePath == '/app/frontend/src/styles/main.scss'){
        console.log('zzzzz',content, plugin.checkForImporterType(this._module, 'ts'));
    }

    if(!plugin.checkForImporterType(this._module, 'ts')){
        return content;
    }
    
    return `import { css } from '@microsoft/fast-element';\nexport default css\`${content}\`;`;
};

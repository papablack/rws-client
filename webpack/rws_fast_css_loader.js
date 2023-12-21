// custom-css-loader.js
const RWSPlugin = require("./rws_plugin");
const plugin = new RWSPlugin();

module.exports = function(content) {  

    if(!plugin.checkForImporterType('ts')){
        return content;
    }
    
    return `import { css } from '@microsoft/fast-element';\nexport default css\`${content}\`;`;
};

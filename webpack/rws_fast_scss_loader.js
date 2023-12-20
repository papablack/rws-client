// custom-css-loader.js
const RWSSassPlugin = require("./rws_sass_plugin");
const path = require('path');

module.exports = function(content) { 
    const plugin = new RWSSassPlugin();
    const filePath = this.resourcePath;

    const saveFile = content.indexOf('@save') > -1;   
    

    try{

        const code = plugin.compileCode(content, path.dirname(filePath));

        if(saveFile && code){
            plugin.writeCssFile(filePath, code);        
        }else{         
        }        

        return `import { css } from '@microsoft/fast-element';\nexport default css\`${code}\`;`;


    }catch(e){
        console.error(e);
        return `import { css } from '@microsoft/fast-element';\nexport default css\`\`;`;

    }
        
};

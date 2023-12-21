// custom-css-loader.js
const RWSPlugin = require("./rws_plugin");
const path = require('path');

module.exports = function(content) { 
    const plugin = new RWSPlugin();
    const filePath = this.resourcePath;

    const saveFile = content.indexOf('@save') > -1;  
    let fromTs = false;

    if(plugin.checkForImporterType('ts')){
       fromTs = true;
    }
    
    try{

        // if(fromTs){
            const code = plugin.compileScssCode(content, path.dirname(filePath));

            if(saveFile && code){
                plugin.writeCssFile(filePath, code);        
            }else{         
            }

            return code;
        // }else{
        //     return content;
        // }        

    }catch(e){
        console.error(e);
        return '';
    }
        
};

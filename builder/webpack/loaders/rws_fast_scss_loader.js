const path = require('path');
const fs = require('fs');
const RWSScssPlugin = require('../rws_scss_plugin');

module.exports = async function(content) {      
    const filePath = this.resourcePath;
    const componentDir = path.resolve(path.dirname(filePath), '..');
    const componentPath = path.resolve(componentDir, 'component.ts');
    const isDev = this._compiler.options.mode === 'development';    
    const saveFile = content.indexOf('@save') > -1; 
    const plugin = new RWSScssPlugin(); 
    let fromTs = false;    

    if(saveFile){
        try {        
            const codeData = await plugin.compileScssCode(content, path.dirname(filePath), null, filePath, !isDev);                                

            const code = codeData.code;
            const deps = codeData.dependencies;        

            for (const dependency of deps){
                this.addDependency(dependency);
            }

            if (saveFile && code) {
                plugin.writeCssFile(filePath, code);
            }
        } catch(e){
            console.error(e);
            return '';
        }
    }

    if(fs.existsSync(componentPath)){
        const fileCnt = fs.readFileSync(componentPath, 'utf-8');

        if(fileCnt){
            fs.writeFile(componentPath, fileCnt, () => {})  
        }        
    }
    
    return '';   
};

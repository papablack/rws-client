const path = require('path');
const fs = require('fs');

module.exports = function(content){
    const filePath = this.resourcePath;
    const componentDir = path.dirname(filePath);
    const componentPath = path.resolve(componentDir, 'component.ts');

    if(fs.existsSync(componentPath)){
        const fileCnt = fs.readFileSync(componentPath, 'utf-8');

        if(fileCnt){
            fs.writeFile(componentPath, fileCnt, () => {})  
        }    
    }
    
    return '';
}
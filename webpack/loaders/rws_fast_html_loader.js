const path = require('path');
const fs = require('fs');

module.exports = function(content){
    const filePath = this.resourcePath;
    const componentDir = path.dirname(filePath);
    const componentPath = path.resolve(componentDir, 'component.ts');

    if(fs.existsSync(componentPath)){
        fs.writeFileSync(componentPath, fs.readFileSync(componentPath, 'utf-8'))  
    }
    
    return '';
}
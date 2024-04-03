const path = require('path');
const fs = require('fs');

module.exports = function(content) { 
    const filePath = this.resourcePath;

    const dirPath = path.dirname(filePath);
    const tsPath = `${dirPath}/component.ts`;

    fs.readFile(tsPath, { encoding: 'utf-8' }, (err, content) => {
        fs.writeFileSync(tsPath, content);

        if (err) {
            throw new Error('Error reading file:', tsPath);            
          }
    });


    return '';
};
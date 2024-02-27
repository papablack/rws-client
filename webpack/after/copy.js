const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

module.exports = async (copyList = {}) => {
    const copyQueue = [];

    Object.keys(copyList).forEach((targetPath) => {
        const sources = copyList[targetPath];
        
        sources.forEach((sourcePath) => {
          const fileName = path.basename(sourcePath);          
          if(fs.existsSync(targetPath + '/' + fileName)){
            fs.unlinkSync(targetPath + '/' + fileName);
          }
          
          copyQueue.push({ from: sourcePath, to: targetPath + '/' + fileName });
        })  
    });

    copyQueue.forEach((copyset) => {
        if(fs.existsSync(copyset.to)){
            fs.unlinkSync(copyset.to);
        }

        fs.copyFileSync(copyset.from, copyset.to);

        console.log(`${chalk.yellow('[RWS]')} Copied "${chalk.blue(copyset.from)}" to "${chalk.blue(copyset.to)}"`)
    })
}
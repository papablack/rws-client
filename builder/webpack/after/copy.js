const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

function collectFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  files.forEach(file => {
    if (file.isDirectory()) {
      collectFiles(path.join(dir, file.name), fileList);
    } else {
      fileList.push(path.join(dir, file.name));
    }
  });
  return fileList;
}

module.exports = async (copyList = {}, pluginCfg) => {
  const copyQueue = [];

  Object.keys(copyList).forEach((targetPath) => {
    const copyListKey = targetPath;

    if (targetPath[0] === '.') {
      targetPath = path.resolve(pluginCfg.packageDir, targetPath);
    }

    const sources = copyList[copyListKey];

    sources.forEach((sourcePath) => {
      const stat = fs.statSync(sourcePath);
      if (stat.isDirectory()) {
        // If sourcePath is a directory, collect all files recursively
        const allFiles = collectFiles(sourcePath);
        allFiles.forEach((file) => {
          const relativePath = path.relative(sourcePath, file);
          const targetFilePath = path.join(targetPath, relativePath);
          const targetFileDir = path.dirname(targetFilePath);

          // Ensure the target directory exists
          if (!fs.existsSync(targetFileDir)) {
            fs.mkdirSync(targetFileDir, { recursive: true });
          }

          // Check if the file already exists in the target location
          if (fs.existsSync(targetFilePath)) {
            fs.unlinkSync(targetFilePath);
          }

          // Add to copy queue
          copyQueue.push({ from: file, to: targetFilePath });
        });
      } else {
        // If sourcePath is not a directory, proceed as before
        const fileName = path.basename(sourcePath);
        const targetFilePath = path.join(targetPath, fileName);

        // Check if the file already exists in the target location
        if (fs.existsSync(targetFilePath)) {
          fs.unlinkSync(targetFilePath);
        }

        // Add to copy queue
        copyQueue.push({ from: sourcePath, to: targetFilePath });
      }
    });
  });

    copyQueue.forEach((copyset) => {
        if(fs.existsSync(copyset.to)){
            fs.unlinkSync(copyset.to);
        }        

        fs.copyFileSync(copyset.from, copyset.to);

        console.log(`${chalk.yellow('[RWS]')} Copied "${chalk.blue(copyset.from)}" to "${chalk.blue(copyset.to)}"`)
    })

    return new Promise((resolve) => resolve());
}
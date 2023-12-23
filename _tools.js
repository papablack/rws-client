const path = require('path');
const fs = require('fs');

function findRootWorkspacePath(currentPath) {        
    const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');        
    const parentPackageDir = path.basename(parentPackageJsonPath);

    if (fs.existsSync(parentPackageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

      if (packageJson.workspaces) {
        return findRootWorkspacePath(parentPackageDir);
      }
    }

    return currentPath;
  }

module.exports = {
    findRootWorkspacePath
}
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function findRootWorkspacePath(currentPath) {        
  const parentPackageJsonPath = path.join(currentPath + '/..', 'package.json');        
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return this.findRootWorkspacePath(parentPackageDir);
    }
  }

  return currentPath;
}

function findPackageDir()
{
  return path.resolve(path.dirname(module.id));
}

function getActiveWorkSpaces(currentPath, mode = 'all') { 
  if(!currentPath){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "currentPath" argument is required.`);
  }

  if(!(['all', 'frontend', 'backend'].includes(mode))){
    throw new Error(`[_tools.js:getActiveWorkSpaces] "mode" argument can be only: "frontend", "backend" or "all".`);
  }

  const rootPkgDir = findRootWorkspacePath(currentPath)
  const parentPackageJsonPath = path.join(rootPkgDir, 'package.json');        
  const parentPackageDir = path.dirname(parentPackageJsonPath);

  if (fs.existsSync(parentPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(parentPackageJsonPath, 'utf-8'));

    if (packageJson.workspaces) {
      return packageJson.workspaces.map((workspaceName) => path.join(rootPkgDir, workspaceName)).filter((workspaceDir) => {
        if(mode === 'all'){
          return true;
        }

        let rwsPkgName = 'rws-js-server';

        if(mode === 'frontend'){
          rwsPkgName = 'rws-js-client';
        }

        let hasDesiredPackage = false;

        const workspaceWebpackFilePath = path.join(workspaceDir, 'package.json');        
        const workspacePackageJson = JSON.parse(fs.readFileSync(workspaceWebpackFilePath, 'utf-8'));

        if (workspacePackageJson.dependencies && (!!workspacePackageJson.dependencies[rwsPkgName])) {
          hasDesiredPackage = true;
        }

        return hasDesiredPackage;
      });
    }
  }

  return [currentPath];
}

async function runCommand(command, cwd = null, silent = false, extraArgs = { env: {}}) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    
    if(!cwd){
      console.log(`[RWS] Setting default CWD for "${command}"`);
      cwd = process.cwd();
    }

    
    const env = { ...process.env, ...extraArgs.env };

    console.log(`[RWS] Running command "${command}" from "${cwd}"`);

    const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd, env });

    spawned.on('exit', (code) => {
      if (code !== 0) {
        return reject(new Error(`Command failed with exit code ${code}`));
      }
      resolve();
    });

    spawned.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
    findRootWorkspacePath,
    findPackageDir,
    getActiveWorkSpaces,
    runCommand
}
#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const utils = require('./_tools');

const log = console.log;


const moduleCfgDir = `${path.resolve(process.cwd())}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  
const webpackPath = path.resolve(__dirname);

const main = async () => {    
    await installDeps();

    return;
}

const executionDir = process.cwd();

const rootPackageDir = utils.findRootWorkspacePath(executionDir);

async function installDeps(){
    // log('[RWS] Installing RWS client TS dependencies...', rootPackageDir);

    // if(!fs.existsSync(`${process.cwd() + '/node_modules/ts-transformer-keys'}`)){        
    //     await runShellCommand(`npm install ts-transformer-keys`);
    // }

    // await rwsPackageSetup();
    // await runShellCommand(`yarn`, __dirname);    
    
    // log('[RWS] Installed RWS client TS dependencies.');

    log('[RWS] Building RWS client TS dependencies...')

    await runShellCommand(`yarn build`, __dirname);

    log('[RWS] Built RWS client TS dependencies.');

    await runShellCommand(`yarn build`);
}

const rwsPackageSetup = async () => {    
    if(getRWSVar('_rws_deps_installed') === 'True'){
        console.log('[RWS] Deps are already installed.');

        return;
    }

    try {
        const cwd = process.cwd();
        console.log('cwd', process.cwd());
        const originalPackageJsonPath = path.join(cwd, 'package.json');
        const backupPackageJsonPath = path.join(cwd, '_package.json');
        const rwsPackageJsonPath = path.join(webpackPath, 'package.json');
        
        const cwdPackage = JSON.parse(fs.readFileSync(originalPackageJsonPath, 'utf-8'));
        const rwsPackage = JSON.parse(fs.readFileSync(rwsPackageJsonPath, 'utf-8'));

        cwdPackage.scripts.postinstall = '';

        cwdPackage.dependencies = {
            ...rwsPackage.dependencies,
            ...cwdPackage.dependencies,            
        }

        
        cwdPackage.devDependencies = {
            ...rwsPackage.devDependencies,
            ...cwdPackage.devDependencies,            
        }
          
        if (fs.existsSync(originalPackageJsonPath)) {
            fs.renameSync(originalPackageJsonPath, backupPackageJsonPath);
            fs.writeFileSync(originalPackageJsonPath, JSON.stringify(cwdPackage, null, 2));
            await runShellCommand(`yarn install`);
            fs.unlinkSync(originalPackageJsonPath);
            fs.renameSync(backupPackageJsonPath, originalPackageJsonPath);
            setRWSVar('_rws_deps_installed', 'True');

        } else {
            console.warn('[RWS] No package.json found in the current working directory.');
            return;
        }
  
     
    } catch (error) {
      console.error('[RWS] An error occurred:', error);
    }
  };

   async function runShellCommand(command, cwd = null, silent = false) {
    if(!cwd){
      cwd = process.cwd();
    }
    
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      
      const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });

      spawned.on('exit', (code) => {
        if (code !== 0) {
          return reject(new Error(`[RWS] Command failed with exit code ${code}`));
        }
        resolve();
      });

      spawned.on('error', (error) => {
        reject(error);
      });
    });
  }

  function getRWSVar(fileName)
  {    
    const moduleCfgDir = `${rootPackageDir}/node_modules/.rws`;

    if(!fs.existsSync(moduleCfgDir)){
      fs.mkdirSync(moduleCfgDir);
    }

    if(!fs.existsSync(`${moduleCfgDir}/${fileName}`)){
      return null;
    }

    try{
      return fs.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
    } catch (e){
      return null;
    }
  }   
  
  function setRWSVar(fileName, value)
  {     
    const moduleCfgDir = `${rootPackageDir}/node_modules/.rws`;

    if(!fs.existsSync(moduleCfgDir)){
      fs.mkdirSync(moduleCfgDir);
    }

    fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
  }



main().then(() => {
    log('Frontend install command finished')
});
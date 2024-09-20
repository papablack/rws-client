#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const tools = require('./_tools');

const moduleDir = path.resolve(__dirname);
const executionDir = path.resolve(process.cwd());
const workspaceRoot = tools.findRootWorkspacePath(executionDir);

const command2map = process.argv[2];
const firstArg = process.argv[3] || '';

const extraArgsAggregated = [];

if(process.argv.length > 4){
    for(let i = 4; i <= process.argv.length-1;i++){
      extraArgsAggregated.push(process.argv[i]);
    }
}

const CMD_LIST = [
  'init',
  'build:sw'
]

async function main() {
    if(!CMD_LIST.includes(command2map) || command2map === 'help'){
      const helpTxt = `RWS Client CLI. \n\n Main features: \n - framerwork init \n - tests \n\n`;
      const cmdList = `Command list: \n ${CMD_LIST.map((el) => `"rws-client ${el}"`).join('\n')}`;
      const currentColor = command2map === 'help' ? chalk.yellow : chalk.red

      if(command2map === 'help'){
        console.log(currentColor(helpTxt));
      }

      console.log(currentColor(cmdList))
      return false;
    }

    switch(command2map){
      case 'init': await initCmd(); break;
      case 'build:sw': await buildSwCmd(); break;
    }
    
    return true;
}

async function initCmd(){
  let workspaced = false;  
    if(workspaceRoot !== executionDir){
      workspaced = true;
    }  
  
    if(workspaced){    
      if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
        const rcjs = fs.readFileSync(`${moduleDir}/.setup/.eslintrc.json`, 'utf-8');
        fs.writeFile(`${executionDir}/.eslintrc.json`, rcjs.replace('{{frontend_dir}}', executionDir));
        console.log(chalk.green('RWS CLI'), 'Installed eslint base workspace config file.');
      }
    }else{
      if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
        fs.copyFile(`${moduleDir}/.eslintrc.json`, `${executionDir}/.eslintrc.json`);
        console.log(chalk.green('[RWS Client]'), 'Installed eslint config file.');
      }        
    }

    if(!fs.existsSync(`${executionDir}/tsconfig.json`)){
      fs.copyFile(`${moduleDir}/.setup/tsconfig.json`, `${executionDir}/tsconfig.json`);
      console.log(chalk.green('[RWS Client]'), 'Installed tsconfig.');
    }   
}

async function buildSwCmd(){
  const webpackCmd = `yarn webpack`;
  
  try {
    console.log(chalk.yellow('[RWS Client]'), 'Installing service worker...');
    await tools.runCommand(`${webpackCmd} --config ${path.resolve(moduleDir, 'service_worker')}/webpack.config.js`, executionDir, false, { env: { SWPATH: firstArg } });
    console.log(chalk.green('[RWS Client]'), 'Service worker installed.');
  }catch(e){
    console.error('runerror',e);
  }
}

main().then((result) => {});
#!/usr/bin/env node

const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const tools = require('./_tools');


const command2map = process.argv[2];
let args = process.argv[3] || '';

const extraArgsAggregated = [];

if(process.argv.length > 4){
    for(let i = 4; i <= process.argv.length-1;i++){
      extraArgsAggregated.push(process.argv[i]);
    }
}

const CMD_LIST = [
  'init'
]

async function main() {
    const moduleDir = path.resolve(__dirname);
    const executionDir = path.resolve(process.cwd());

    if(!CMD_LIST.includes(command2map) || command2map === 'help'){
      const helpTxt = `RWS Client CLI. \n\n Main features: \n - framerwork init \n - tests \n\n`;
      const cmdList = `Command list: \n ${CMD_LIST.map((el) => `"rws-client ${el}"`).join('\n')}`;
      const currentColor = command2map === 'help' ? chalk.yellow : chalk.red

      if(command2map === 'help'){
        console.log(currentColor(helpTxt));
      }else{
        console.log(currentColor('[RWS CLI ERROR]: command not found'))
      }

      console.log(currentColor(cmdList))
      return false;
    }

    let workspaced = false;
    const workspaceRoot = tools.findRootWorkspacePath(executionDir);
  
    if(workspaceRoot !== executionDir){
      workspaced = true;
    }  
  
    if(workspaced){    
      if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
        const rcjs = fs.readFileSync(`${moduleDir}/.setup/.eslintrc.json`, 'utf-8');
        fs.writeFileSync(`${executionDir}/.eslintrc.json`, rcjs.replace('{{frontend_dir}}', executionDir));
        console.log(chalk.green('RWS CLI'), 'Installed eslint base workspace config file.');
      }
    }else{
      if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
        fs.copyFileSync(`${moduleDir}/.eslintrc.json`, `${executionDir}/.eslintrc.json`);
        console.log(chalk.green('[RWS Client]'), 'Installed eslint config file.');
      }        
    }

    if(!fs.existsSync(`${executionDir}/tsconfig.json`)){
      fs.copyFileSync(`${moduleDir}/.setup/tsconfig.json`, `${executionDir}/tsconfig.json`);
      console.log(chalk.green('[RWS Client]'), 'Installed tsconfig.');
    }    
    
    return true;
}

main().then((result) => {    
    if(result){
      console.log(chalk.green('[RWS Client]'), ' Frontend install finished')
    }    
});
const md5 = require('md5');
const chalk = require('chalk');
const tools = require('../_tools');
const { rwsPath } = require('@rws-framework/console');
const path = require('path');
const fs = require('fs');

function setupTsConfig(tsConfigPath, executionDir) {

    if (!fs.existsSync(tsConfigPath)) {
        throw new Error(`Typescript config file "${tsConfigPath}" does not exist`);
    }

    const tsConfigContents = fs.readFileSync(tsConfigPath, 'utf-8');

    try {
        let tsConfig = JSON.parse(tsConfigContents);

        const declarationsPath = path.resolve(__dirname, '..', 'types') + '/declarations.d.ts';
        const testsPath = path.resolve(__dirname, '..', 'tests');
        const declarationsPathMD5 = md5(fs.readFileSync(declarationsPath, 'utf-8'));
        const testsPathMD5 = fs.existsSync(testsPath) ? md5(fs.readFileSync(testsPath, 'utf-8')) : null;

        const relativeDeclarationsPath = path.relative(path.dirname(tsConfigPath), declarationsPath);
        const relativeTestsPath = path.relative(path.dirname(tsConfigPath), testsPath);

        const includedMD5 = [];

        let changed = false;

        if (!tsConfig['include'].includes('src')) {
            console.log(chalk.blueBright('[RWS TS CONFIG]'), 'adding RWS project typescript code to project tsconfig.json');
            tsConfig['include'].unshift('src');
            changed = true;
        }   

        if (!Object.keys(tsConfig).includes('include')) {
            tsConfig['include'] = [];
        } else {
            tsConfig['include'] = tsConfig['include'].filter((inc) => {
                 if(inc === 'src'){
                    return true;
                 }

                 return fs.existsSync(rwsPath.relativize(inc, executionDir))
            })
        }     

        if (!Object.keys(tsConfig).includes('exclude')) {
            tsConfig['exclude'] = [];
        }      

        let probablyLinked = false;

        tsConfig['include'].forEach(element => {
            if(element !== 'src' && element.indexOf('declarations.d.ts') > -1 && md5(fs.readFileSync(rwsPath.relativize(element, executionDir), 'utf-8')) === md5(fs.readFileSync(declarationsPath, 'utf-8'))){
                probablyLinked = true;
            }            
        }); 

        if (!tsConfig['include'].includes(relativeDeclarationsPath) && !probablyLinked) {
            console.log(chalk.blueBright('[RWS TS CONFIG]'), 'adding RWS typescript declarations to project tsconfig.json');
            tsConfig['include'].push(relativeDeclarationsPath);
            includedMD5.push(md5(fs.readFileSync(declarationsPath, 'utf-8')));
            changed = true;
        }      

    

        if (changed) {
            fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
            console.log(chalk.yellowBright('Typescript config file'), `"${chalk.blueBright(tsConfigPath)}"`, chalk.yellowBright('has been changed'));
        }

        return true;
    } catch (e) {
        console.log(chalk.red('Error in tsconfig.json:'));
        console.log(chalk.blueBright(e.message));

        return false;
    }
}

function getPartedModeVendorsBannerParams(partedDirUrlPrefix, partedPrefix) {
    return {
        banner: `if(!window.RWS_PARTS_LOADED){         
              const script = document.createElement('script');
              script.src = '${partedDirUrlPrefix}/${partedPrefix}.vendors.js';        
              script.type = 'text/javascript';
              document.body.appendChild(script);
              window.RWS_PARTS_LOADED = true;
              console.log('[RWS INIT SCRIPT]', 'vendors injected...');
            }`.replace('\n', ''),
        raw: true,
        entryOnly: true,
        include: `${partedPrefix}.client.js`
    };
}

module.exports = {
    setupTsConfig
}
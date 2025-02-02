const chalk = require('chalk');

const { rwsRuntimeHelper } = require('@rws-framework/console');


function executeRWSStartActions(WEBPACK_AFTER_ACTIONS, serviceWorkerPath, BuildConfigurator, rwsFrontConfig) {
    if (serviceWorkerPath) {
        WEBPACK_AFTER_ACTIONS.push({
            type: 'service_worker',
            actionHandler: serviceWorkerPath
        });
    }

    const assetsToCopy = BuildConfigurator.get('copyAssets') || rwsFrontConfig.copyAssets;

    if (!!assetsToCopy) {
        WEBPACK_AFTER_ACTIONS.push({
            type: 'copy',
            actionHandler: assetsToCopy
        });
    }
}


function timingActions(WEBPACK_AFTER_ACTIONS, WEBPACK_AFTER_ERROR_ACTIONS, devDebug){
    if(devDebug?.timing){
        rwsRuntimeHelper.setRWSVar('_timer_css', 'none|0');
    
        WEBPACK_AFTER_ACTIONS.push({
          type: 'custom',
          actionHandler: () => {  
            
            const cssTimesList = rwsRuntimeHelper.getRWSVar('_timer_css');        
            
            if(cssTimesList){
              const cssTime = cssTimesList.split('\n').map((elString) => {
                const item = elString.split('|')[1];
                return item === '' ? 0 : parseInt(item)
              }).reduce((acc, curr) => acc + curr, 0);
              rwsRuntimeHelper.setRWSVar('_timer_css', 'none|0');                 
              console.log(chalk.yellow('[RWS BUILD] (after)'), `CSS TIME: ${Math.round(cssTime)}`);
    
            }
          }
        });
      }
    
      WEBPACK_AFTER_ERROR_ACTIONS.push({
        type: 'custom',
        actionHandler: () => {
          console.log('CUSTOM ERROR');
          rwsRuntimeHelper.setRWSVar('_timer_css', 'none|0');
        }
      });
}

function devActions(WEBPACK_AFTER_ACTIONS, executionDir, devDebug){
    const devExternalsVars = {
        packed: [],
        ignored: [],
        frontendRequestContextCache: []
      }
    
      if(devDebug?.build){
        const debugDir = path.join(executionDir, '.debug');
    
        if(!fs.existsSync(debugDir)){
          fs.mkdirSync(debugDir)
        }
    
        WEBPACK_AFTER_ACTIONS.push({
          type: 'custom',
          actionHandler: () => {        
            fs.writeFile(path.join(debugDir, 'in_vendors.json'), JSON.stringify(devExternalsVars.ignored, null, 2));
            fs.writeFile(path.join(debugDir, 'rws_processed.json'), JSON.stringify(devExternalsVars.packed, null, 2));
            fs.writeFile(path.join(debugDir, 'requestcache.json'), JSON.stringify(devExternalsVars.frontendRequestContextCache, null, 2));
    
            console.log(chalk.yellow('[RWS BUILD] (after)'), `packaging debug saved in: ${debugDir}`);
          }
        });
      }

      return devExternalsVars;
}

module.exports = { devActions, timingActions, executeRWSStartActions }
const rwsAfterCopy = require('./after/copy');
const rwsAfterSW = require('./after/sw');


const _DEFAULT_CONFIG = {actions: []}

const _DEFAULT_ACTION = {
    type: 'copy',
    actionHandler: {
        'targetDir': [
            'filePath0',
            'filePath1'
        ]
    },
    event: 'done'
}

class RWSAfterPlugin {
    config = _DEFAULT_CONFIG;
    _allowedActionTypes = ['copy', 'custom', 'service_worker'];

    constructor(config = {}){
        this.config = Object.assign(this.config, config);
    }

    apply(compiler) {        
        const actionsEvents = this.config.actions.map(item => item.event ? item.event : 'done');        

        Array.from(new Set(actionsEvents)).forEach((eventName) => {
            compiler.hooks[eventName].tapPromise('RWSAfterPlugin', async (buildInfo) => {     
                const proms = this.config.actions.filter(item => item.event === _DEFAULT_ACTION.event || !item.event).map(async (rwsAfterAction) => {
                    return await this._runActionType(rwsAfterAction.type, rwsAfterAction.actionHandler);
                });
    
                return await Promise.all(proms);            
            });       
        });        

        compiler.hooks.emit.tapAsync('RWSAfterPlugin', (compilation, callback) => {      
            Object.keys(compilation.assets).forEach((filename) => {
            
              if (filename.endsWith('.js')) {
                const asset = compilation.assets[filename];
                let source = asset.source();
                if(source.indexOf('css`') > -1 || source.indexOf('html`') > -1){   
                    console.log('replacing', filename);
                  const updatedSource = source.replace(/\n/g, '');
        
                  // Update the asset with the new content
                  compilation.assets[filename] = {
                    source: () => updatedSource,
                    size: () => updatedSource.length
                  };
                }          
              }
            });
      
            callback();
        });
    }

    async _runActionType(actionType, action){    
        if(!this._allowedActionTypes.includes(actionType)){
            throw new Error(`[RWSAfter webpack plugin] Action type ${actionType} is not allowed`);
        }

        switch (actionType){
            case 'copy': {
                const copyFiles = typeof action === 'function' ? await action() : action;
    
                await rwsAfterCopy(copyFiles);
                return;
            };

            //@TODO
            case 'service_worker': {
             
                const serviceWorkerPath = typeof action === 'function' ? await action() : action;                
                await rwsAfterSW(serviceWorkerPath);
                return;
            };            

            case 'custom': {

                if(typeof action !== 'function'){
                    console.error('Custom RWS action must be a function.')
                    return;
                }

                await action();
                return;
            }

            default:
                console.warn('RWSAfterPlugin::_runActionType could not act upon input. Please resolve.');
                console.log({ actionType, action })
                return;            
        }        
    }
}

module.exports = RWSAfterPlugin;
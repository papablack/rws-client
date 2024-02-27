const rwsAfterCopy = require('./after/copy');
const rwsAfterSW = require('./after/sw');


const _DEFAULT_CONFIG = { actions: [] }



class RWSAfterPlugin {
    config = _DEFAULT_CONFIG;
    _allowedActionTypes = ['copy', 'custom', 'service_worker'];

    constructor(config = {}){
        this.config = Object.assign(this.config, config);
    }
    apply(compiler) {      
        compiler.hooks.afterEmit.tap('RWSAfterPlugin', async  (compilation) => {               
            let copy_actions = null;
            const proms = [];
            
            this.config.actions.forEach(([actionType, action]) => {                
                if(actionType === 'copy'){
                    copy_actions = action;
                }else{
                    proms.push([actionType, action]);
                }
            });

            if(copy_actions){            
                proms.push(['copy', copy_actions]);
            }
            for (const actionData of proms){
                const [actionType, action] = actionData;
                await this._runActionType(actionType, action);
            }
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
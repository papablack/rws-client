const rwsAfterCopy = require('./after/copy');
const rwsAfterSW = require('./after/sw');
const deepmerge = require('deepmerge');


const _DEFAULT_CONFIG = { actions: [], executionDir: process.cwd(), packageDir: process.cwd(), dev: false, devDebug: null }

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

class RWSWebpackPlugin {
    config = _DEFAULT_CONFIG;
    _allowedActionTypes = ['copy', 'custom', 'service_worker'];

    constructor(config = {}) {
        this.config = deepmerge(this.config, config);
        this.customOptions = {
            devDebug: this.config.devDebug
        }
    }

    apply(compiler) {
        const actionsEvents = this.config.actions.map(item => item.event ? item.event : 'done');
        const errorActionsEvents = this.config.error_actions.map(item => item.event ? item.event : null).filter(item => !!item);

        compiler.hooks.compilation.tap('RWSWebpackPlugin', (compilation) => {            
            compilation['customOptions'] = this.customOptions;            
        });

        Array.from(new Set(actionsEvents)).forEach((eventName) => {
            compiler.hooks[eventName].tapPromise('RWSWebpackPlugin', async (buildInfo) => {
                const proms = this.config.actions.filter(item => item.event === _DEFAULT_ACTION.event || !item.event).map(async (rwsAfterAction) => {
                    return await this._runActionType(rwsAfterAction.type, rwsAfterAction.actionHandler);
                });

                return await Promise.all(proms);
            });
        });

        if (!this.config.dev) {
            compiler.hooks.emit.tapAsync('RWSWebpackPlugin', (compilation, callback) => {
                Object.keys(compilation.assets).forEach((filename) => {

                    if (filename.endsWith('.js')) {
                        const asset = compilation.assets[filename];
                        let source = asset.source();

                        if ((source.indexOf('css`') > -1 || source.indexOf('html`') > -1)) {
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

        // compiler.hooks.done.tap('RWSWebpackPlugin', (stats) => {
        //     // Check if there were any errors
        //     if (stats.hasErrors()) {
        //         console.error('Build failed with errors:');

        //         // Log the errors
        //         const info = stats.toJson();
        //         console.error(info.errors);

        //         Array.from(new Set(actionsEvents)).forEach((eventName) => {
        //             compiler.hooks[eventName].tapPromise('RWSWebpackPlugin', async (buildInfo) => {
        //                 const proms = this.config.actions.filter(item => item.event === _DEFAULT_ACTION.event || !item.event).map(async (rwsAfterAction) => {
        //                     return await this._runActionType(rwsAfterAction.type, rwsAfterAction.actionHandler);
        //                 });

        //                 return await Promise.all(proms);
        //             });
        //         });

        //         // Optionally exit the process with a non-zero status
        //         process.exit(1);
        //     } else {
        //         console.log('Build completed successfully.');
        //     }
        // });
    }

    async _runActionType(actionType, action) {
        if (!this._allowedActionTypes.includes(actionType)) {
            throw new Error(`[RWSAfter webpack plugin] Action type ${actionType} is not allowed`);
        }

        switch (actionType) {
            case 'copy': {
                const copyFiles = typeof action === 'function' ? await action() : action;

                await rwsAfterCopy(copyFiles, this.config);
                return;
            };

            //@TODO
            case 'service_worker': {

                const serviceWorkerPath = typeof action === 'function' ? await action() : action;
                await rwsAfterSW(serviceWorkerPath);
                return;
            };

            case 'custom': {

                if (typeof action !== 'function') {
                    console.error('Custom RWS action must be a function.')
                    return;
                }

                await action();
                return;
            }

            default:
                console.warn('RWSWebpackPlugin::_runActionType could not act upon input. Please resolve.');
                return;
        }
    }
}

module.exports = RWSWebpackPlugin;
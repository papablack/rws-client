const fs = require('fs');
const chalk = require('chalk');

class RWSPluginBuilder {
    pluginInfo = {name: null};

    constructor(pluginPath, buildConfigurator, baseBuildConfig){
        this.pluginPath = pluginPath;
        this.buildConfigurator = buildConfigurator;
        this.baseBuildConfig = baseBuildConfig;

        this.pluginInfo = JSON.parse(fs.readFileSync(this.pluginPath + '/plugin-info.json', 'utf-8'));
    }

    async onComponentsLocated(partedComponentsLocations = []){
        return partedComponentsLocations;
    }

    async onServicesLocated(servicesLocations){        
        return servicesLocations;
    }

    async onBuild(webpackOptions){
        return webpackOptions;
    }

    log(msg){
        console.log(chalk.blue('RWS Plugin'), chalk.green(this.pluginInfo.name) + ':', msg);
    }
}

module.exports = { RWSPluginBuilder };
# RWS Plugin system

Plugin systems lets users add functionality without writing too much code. Target of the functionality is to run with one config line per plugin.

## Table of contents

1. [TS work part](#ts-work-plugin-part)
2. [JS build plugin part](#js-build-plugin-part)
3. [Adding plugin to TS](#adding-plugin-to-ts)
4. [Adding plugin to build order](#adding-plugin-to-build-order)
5. [Examples](#examples)

***Currently there are separate frontend and build plugin parts. To be included in .rws.json***

## TS work plugin part

**src/plugin.ts**

```typescript
import { RWSClient, RWSClientInstance, RWSPlugin, DefaultRWSPluginOptionsType, NotifyService, NotifyServiceInstance, ConfigService, ConfigServiceInstance } from '@rws-framework/client';
import WSService, { WSServiceInstance, WSEvent, WSStatus } from './services/WSService';

WSService;

interface WSOptions extends DefaultRWSPluginOptionsType {

}

class RWSWebsocketsPlugin extends RWSPlugin<WSOptions> {
    async onClientStart(): Promise<void> 
    {       
        const wsService: WSServiceInstance = this.container.get(WSService);
        const notifyService: NotifyServiceInstance = this.container.get(NotifyService);
        const appConfig: ConfigServiceInstance = this.container.get(ConfigService);

        wsService.on('ws:disconnected', (instance, params) => {
            notifyService.notify(`Your websocket client disconnected from the server. Your ID was <strong>${params.socketId}</strong>`, 'error');
        });

        wsService.on('ws:connected', (instance, params) => {
            notifyService.notify('You are connected to websocket. Your ID is: <strong>' + instance.socket().id + '</strong>', 'info');
        });

        wsService.on('ws:reconnect', (instance, params) => {
            console.info('WS RECONNECTION ' + (params.reconnects + 1));
            notifyService.notify('Your websocket client has tried to reconnect to server. Attempt #' + (params.reconnects+1), 'warning');
        });  

        wsService.init(appConfig.get('wsUrl'), appConfig.get('user'), appConfig.get('transports'));        
    };
}

export { RWSWebsocketsPlugin, WSService, WSServiceInstance, WSEvent, WSStatus };
```

## JS build plugin part

**./build.js**

```javascript
const {RWSPluginBuilder} = require('@rws-framework/client/src/plugins/_builder');
class BrowserRouterBuilder extends RWSPluginBuilder{
    constructor(buildConfigurator, baseBuildConfig){
        super(__dirname, buildConfigurator, baseBuildConfig);
    }

    async onComponentsLocated(partedComponentsLocations = []){       
        if(!partedComponentsLocations){
            partedComponentsLocations = [];
        } 
        return [...partedComponentsLocations,`${this.pluginPath}/src/components`];
    }

    async onServicesLocated(servicesLocations){        
        return [...servicesLocations,`${this.pluginPath}/src/services`];
    }
    
    async onBuild(buildOptions){     
        this.log('webpack build modified');       
        return buildOptions;
    }
}

module.exports = BrowserRouterBuilder;
```

## Adding plugin to TS

```typescript
import RWSClient, { RWSContainer, RWSPlugin, RWSPluginEntry } from '@rws-framework/client';
import { RWSBrowserRouter, BrowserRouterOpts } from '@rws-framework/browser-router';

import './styles/main.scss';

import routes from './routing/routes';

import backendImports from './backendImport';
import notifierMethod from './_notifier';
import _initComponents from './application/_initComponents';
import { loadRWSRichWindow } from '@rws-framework/client/src/interfaces/RWSWindow';


async function initializeApp() {
    const theClient = RWSContainer().get(RWSClient);

   //(...)
   
   theClient.onInit(async () => {
        console.log(loadRWSRichWindow().RWS);
        RWSPlugin.getPlugin<RWSBrowserRouter>(RWSBrowserRouter).addRoutes(routes);
        _initComponents(theClient.appConfig.get('parted'));
    }); 

    theClient.setup({  
        partedPrefix: 'rws',  
        partedDirUrlPrefix: '/js',
        parted: true,
        plugins: [ // RWS Plugins option for TS
            RWSBrowserRouter //Plugin class name from package
        ]
    }); 
}

initializeApp();
```

## Adding plugin to build order

**webpack.config.ts**

```javascript
const path = require('path');

const RWSWebpackWrapper  = require('@rws-framework/client/rws.webpack.config');
const executionDir = process.cwd();

module.exports = RWSWebpackWrapper({
  dev: false,
  hot: false,
  report: false,
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/index.ts`,
  executionDir: executionDir,
  publicDir:  path.resolve(executionDir, 'public'),
  outputDir:  path.resolve(executionDir, 'public', 'js'),
  outputFileName: 'warlock.client.js',  
  parted: true,
  partedDirUrlPrefix: '/js',
  copyAssets: {
    './public/js/' : [      
      './src/styles/compiled/main.css'
    ]
  },
  rwsPlugins: [
    '@rws-framework/nest-interconnectors',
    '@rws-framework/browser-router'
  ]
});
```
## Examples

### Example plugin package.json

```javascript
{
    "name": "@rws-framework/some-plugin",
    "version": "0.2.0",
    "private": false,
    "description": "",
    "main": "src/plugin.ts",
    "author": "papablack"
}
```

> [!CAUTION]
> EVERY plugin needs plugin-info.json

### Example plugin plugin-info.json

```javascript
{
    "name": "some-plugin"
}
```

### Example plugin:

https://github.com/papablack/rws-browser-router

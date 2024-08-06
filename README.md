# Realtime Web Suit client setup and configuration guide

Realtime Web Suit is a web-component powered, MS FAST powered fullstack-oriented framework that you can use to create domain-agnostic modular asynchoronous components with intershared authorized states.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Key Components: RWSClient & RoutingService](#key-components-rwsclient--routingservice)
4. [Component Initialization](#component-initialization)
5. [DI](#dependency-injection)
6. [Frontend routes](#frontend-routes)
7. [Backend Imports](#backend-imports)
8. [Utilizing APIService](#utilizing-apiservice)
9. [Notifier](#notifier)
10. [Service Worker](#service-worker)
11. [Example: WebChat Component](#example-webchat-component)
12. [Other configs](#other-configs)
13. [Plugins](#plugin-system)
14. [Links](#links)

## Overview

The RWS Frontend Framework is designed to create dynamic and responsive web applications. It integrates seamlessly with the backend and provides a robust set of tools for developing comprehensive web solutions.

## Getting Started

To get started with the RWS Frontend Framework, ensure you have the necessary environment set up, including Node.js and any other dependencies specific to the framework.

from your project dir do:

```bash
yarn
```

Initiate cfg files and webpack build:
```bash
rws-client init
```

to install once and then to build after preparing components:

```bash
yarn build
```
or to watch for dev

```bash
yarn watch
```
or to just start server
```bash
yarn server
```

then start engine in the site javascript (can be inline):

```javascript
window.RWS.client.start(CFG); // it is async function
```

*or for initial setup then start on certain event (example)* 

```javascript
window.RWS.client.setup(CFG).then(() => {     // it is async function
    $.on('loaded', function(data){
        const optionalNewCfg = { backendRoutes: data.backendRoutes };
        window.RWSClient.start(optionalNewCfg).then();
    })    
});
```

### default config for RWS:

```javascript
const _DEFAULT_CONFIG_VARS = {
    //Build configs
    dev: false,
    hot: false,
    report: false,   
    publicDir: './public',
    publicIndex: 'index.html',      
    outputFileName: 'client.rws.js',
    outputDir: process.cwd() + '/build',
    //Frontend RWS client configs  
    backendUrl: null,
    wsUrl: null,
    partedDirUrlPrefix: '/lib/rws',
    partedPrefix: 'rws',
    pubUrlFilePrefix: '/',
    //Universal configs
    transports: ['websocket'],    
    parted: false,        
}

```

*The options description:*

|  **Option**  | **Description** |  **Default**  |
|--------------|-----------------|---------------|
| backendUrl | Url for backend integration (API calls) | null |
| wsUrl | Url for backend integration (Websocket calls) | null |
| backendRoutes | Backend routes object imported from backend node for integration with API calls | null |
| apiPrefix | Prefix for API calls | / |
| routes | Routes for frontend routing | {} |
| transports | Websockets transports method | ['websockets'] |
| user | User object for backend auth / frontend data source | null |
| ignoreRWSComponents | Do not declare base RWS components (uploader, progress) | false |
| pubUrlFilePrefix | the url for accessing files from browser URL | / |
| pubUrl | the url for accessing public dir from browser URL | / |
| outputDir | build dir | ./build |
| outputFileName | output file name | rws.client.js |
| publicDir | public dir for HTML serving | ./public |
| tsConfigPath | tsconfig.json path | ./tsconfig.njson |
| entry | default TS entry for transpilation | ./src/index.ts |
| parted | "Parted" mode if enabled. "Monolith" if disabled. Parted mode outputs every component as separate js file and asynchronously adds them to browser. Monolith is single file js build. | false |
| partedPrefix | parted file prefix ([prefix].[cmp name].js) | rws |
| partedDirUrlPrefix | URL for generated js parted files directory | / |
| copyAssets | An option for defining structure that will be copied after build | {} |

*copyAssets example*

```json
"copyAssets": {
    "./public/js/": [ // target directory
      "./build/", // copy this directory to target
      "./src/styles/compiled/main.css" //copy this file to target
    ]
}
```

### The FRONT config TS interface:

```typescript
interface IRWSConfig {
    defaultLayout?: typeof RWSViewComponent
    backendUrl?: string
    wsUrl?: string
    backendRoutes?: any[]
    apiPrefix?: string
    routes?: IFrontRoutes
    transports?: string[]
    user?: any
    ignoreRWSComponents?: boolean
    pubUrl?: string
    pubUrlFilePrefix?: string
    partedDirUrlPrefix?: string
    dontPushToSW?: boolean
    parted?: boolean
    partedFileDir?: string
    partedPrefix?: string
    routing_enabled?: boolean
    _noLoad?: boolean    
}
```
### The FRONT webpack config:

```javascript
const path = require('path');

const RWSWebpackWrapper  = require('@rws-framework/client/rws.webpack.config');


const executionDir = process.cwd();

module.exports = RWSWebpackWrapper({  
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/index.ts`,  
  publicDir:  path.resolve(executionDir, 'public'),
  outputDir:  path.resolve(executionDir, 'build'),
  outputFileName: 'jtrainer.client.js'
});
```



## Key Components

### RWSClient
##
`RWS.client` is the heart of the framework, managing configuration and initialization. It sets up routes, backend connections, and other essential framework services.


### RoutingService

`RoutingService` handles the navigation and routing within your application. It ensures that URL changes reflect the correct component rendering.

**Depreciation Notice**

***RoutingService will be moved to @rws-framework/browser-router near future***

### WSService

`WSService` handles Websockets messenging to the backend.

**Depreciation Notice**
***WSService will be moved to @rws-framework/nest-interconnectors in near future***

### APIService

`APIService` handles API requests to the backend.

Implementing the Framework

**Main File:**

The main file (`index.ts`) is where you initialize the RWSClient. Here, you configure your routes, backend routes, and component initializations.

Following is example of full usage of the framework

```typescript
async function initializeApp() {           
    const theClient = RWSContainer().get(RWSClient);    

    theClient.addRoutes(frontendRoutes);
    theClient.setBackendRoutes(backendRoutes());

    theClient.enableRouting();
    
    theClient.onInit(async () => {        

        // For single file output:
        initComponents(theClient.appConfig.get('parted'));  // start components for monolith mode      
        theClient.defineComponents(); // start RWS conponents

        //custom outside components registering
        provideFASTDesignSystem()
            .register(fastButton())
            .register(fastTab())
            .register(fastSlider())
            .register(fastSelect())
            .register(fastDivider())
            .register(fastMenu())
            .register(fastMenuItem())
        ;

        // Service worker code
        // const swFilePath: string = `${theClient.appConfig.get('pubUrl')}/service_worker.js`;          

        // await theClient.swService.registerServiceWorker();        

        //if(theClient.getUser()){
            // theClient.pushUserToServiceWorker({...theClient.getUser(), instructor: false});  
        //}

    });

    theClient.setNotifier((message: string, logType: NotifyLogType, uiType: NotifyUiType = 'notification', onConfirm: (params: any) => void, notifierOptions: any = {}) => {
        switch(uiType){
        case 'notification':
            let notifType = 'success';

            if(logType === 'error'){
                notifType = 'error';
            }

            if(logType === 'warning'){
                notifType = 'warning';
            }

            return alertify.notify(message, notifType, 5, onConfirm);
               
        case 'alert':                
            const alertObj = alertify.alert('Junction AI Notification', message, onConfirm);

            Object.keys(notifierOptions).forEach(key => {
                const optionValue = notifierOptions[key];

                if(key === 'width'){
                    
                    alertObj.elements.dialog.style = `max-width: ${optionValue};`;
                    
                    return;
                }

                alertObj.set(key, optionValue);
            });

            alertObj.show();

            return alertObj;    
        case 'silent':
            if(logType == 'warning'){
                console.warn(message);
            }else if(logType == 'error'){
                console.error(message);
            }else{
                console.log(message);
            }            
            return;    
        }
    });
    
    theClient.assignClientToBrowser();
}

initializeApp().catch(console.error);
```

## Component Initialization

In `application/_initComponents.ts`, you initialize the custom components used in your application. If components added in here will include other components they dont need to be listed here. A component imported in this mode needs to be imported once.

**This should be conditioned not to execute imported code when using parted mode.**

### Default component structure

```
component-dir/
    component.ts
    template.html
    styles/
        layout.scss
```

**WARNING** *All html templates refer to variable "T" as to FASTElement templating html scope. It contains all the functions FAST templates uses in html. F.e:* **T.html**, **T.when**, **T.repeat**

```html
<div class="convo-area-wrap">
    <header>  
        <div class="header-inner"></div>      
        ${T.when(x => x.noChoose === 'false',  (item, index) => T.html`<div>
            <chat-convo-models :chosenModel="${x => x.chosenModel}"></chat-convo-models>
        </div>`)}
        <div>
            <h2>${ x => x.chatContext ? x.chatContext.label : 'loading...' }</h2>
            <h3><strong>${ x => x.messageList.length }</strong> messages in total</h3>
        </div>   
        <fast-divider></fast-divider>             
    </header>
    <section>
        <div class="scroll-area">
            <div class="scroll-content">
                ${T.repeat(x => x.messageList,  (item, index) => T.html`
                    <chat-convo-message :contentReturn="${item => item}" :item="${item => item}"/>
                `)}      
                
                ${T.when(x => !x.messageList.length,  (item, index) => T.html`
                    <p class="no-chat">No messages</p>
                `)}   
            </div>
        </div>
    </section>  

</div>
```

### application/_initComponents.ts

Only if parted mode is false.

```typescript
import { ChatNav } from '../components/chat-nav/component';
import { DefaultLayout } from '../components/default-layout/component';
import { RWSIcon } from '../components/rws-icon/component';
import { LineSplitter } from '../components/line-splitter/component';
import { WebChat } from '../components/webchat/component';

export default (partedMode: boolean = false) => {
    if(!partedMode){
        WebChat;
        LineSplitter;
        DefaultLayout;
        ChatNav;
        RWSIcon;        
    }
};
```

## RWS Decorators

**Component needs to extend RWSViewComponent and use @RWSView decorator**:

```typescript
import { RWSViewComponent,  RWSView, observable, attr } from '@rws-framework/client';

const options?: RWSDecoratorOptions;

@RWSView('tag-name', options)
class WebChat extends RWSViewComponent {
    @attr tagAttr: string; //HTML tag attr
    @ngAttr fromNgAttr: string; //HTML attr from angular template
    @externalAttr fromExAttr: string; //HTML attr with change observation
    @sanitizedAttr htmlAttr: string; //HTML attr that's sanitized with every val change
    @observable someVar: any; //Var for templates/value change observation
    @externalObservable someExVar: string; //Var for templates/value change observation with external watch
}
```

The decorator options type:

```typescript
interface RWSDecoratorOptions{
    template?: string, //relative path to HTML template file (default: ./template.html)
    styles?: string //relative path to SCSS file (./styles/layout.scss)
    fastElementOptions?: any //the stuff you would insert into static definition in FASTElement class.
}

```

# Dependency Injection

## Default service usage:

```typescript
import { RWSViewComponent, RWSView } from 'rws-js-client';

@RWSView('your-tag');
class YourComponent extends RWSViewComponent {
    someMethod(url: string): void
    {
        this.apiService.get(url);
    }
}
 
```

A default service can be used in legacy like this:

```javascript
window.RWS.client.get('ApiService').dateMethodFromRWS();
```

Default services: https://github.com/papablack/rws-client/blob/7d16d9c6d83c81c9fe470eb0f507756bc6c71b35/src/components/_component.ts#L58

## Custom service usage:

```typescript
import { 
    RWSView, RWSViewComponent, RWSInject,
    DateService, DateServiceInstance
} from 'rws-js-client';

import DateService, {DateServiceInstance} from '../../my-custom-services/DateService';


@RWSView('your-tag')
class YourComponent extends RWSViewComponent {
    //usage in props:
    private @RWSInject(ServiceFASTDIPointer) serviceProperty: ServiceClassType; 

    //usage in constructor:
    constructor(
        private @RWSInject(DateService) protected dateService: DateServiceInstance
    ) {
        super();
    }

    someMethod(url: string): void
    {
        this.dateService.get(url);
    }
}
 
```

Custom service needs to export .getSingleton() as default export and have service class exported as classic export for TS typing:

```typescript
import { RWSService } from '@rws-framework/client';


class DateService extends RWSService {
    static _IN_CLIENT: boolean = true //If set engine will let legacy use the service through RWSClient.get method
    //(...)
}

export default DateService.getSingleton(); // Fast DI service pointer (it points to instanced service in DI container)
export { DateService as DateServiceInstance }; // the custom service class type
```

**Custom service for legacy**

If service has static **_IN_CLIENT** set for **true** you can use it like this:

```javascript
window.RWS.client.get('DateService').dateMethodFromRWS();
```

## Frontend routes

if you are passing routes this is example routing file for frontend:

```typescript
export default {
    '/': renderRouteComponent('Home page', WebChat),    
    '/the/path': renderRouteComponent('Component title', ComponentClassName),   
}
```

Router tag:

```html
    <section>
        <rws-router></rws-router>
    </section>
```

## Backend Imports

`backendImports.ts` consolidates various backend interfaces, routes, and models, allowing for a synchronized frontend and backend from package https://github.com/papablack/rws

```typescript
import IBook from '../../backend/src/models/interfaces/IBook';

import { 
    IBookInfo,  
  } from '../../backend/src/interfaces/IBookInfo';

import backendRoutes from '../../backend/src/routing/routes';

export { 
    IBook,
    IBookInfo,
    backendRoutes
}

```

usage:


```typescript
    import { backendRoutes} from '../../backendImport';

    //index.ts
    const theClient = new RWSClient();
    theClient.setBackendRoutes(backendRoutes());

```


## Utilizing APIService

`APIService` is used for making HTTP requests to the backend. It simplifies the process of interacting with your API endpoints.

after control method we have dynamic types those are: <**ResponseType**, **PayloadType**>

Example Usage by controller route

```typescript
  const apiPromise: Promise<ITalkApiResponse> = this.apiService.back.post<ITalkApiResponse, IApiTalkPayload>('talk:models:prompt', {        
        message: msg,
        model: this.chosenModel,
      });
```

Example Usage by url

```typescript
  const apiPromise: Promise<ITalkApiResponse> = this.apiService.post<ITalkApiResponse, IApiTalkPayload>('/api/path/to/action', {        
        message: msg,
        model: this.chosenModel,
      });
```

## Notifier

### Overview

The Notifier feature in the RWS Client is a versatile tool for handling notifications within the application. It allows for different types of user interface interactions like alerts, notifications, and silent logging, with varying levels of visibility and user interaction.
Usage

### Setting the Notifier

```typescript
theClient.setNotifier((message: string, logType: NotifyLogType, uiType: NotifyUiType = 'notification', onConfirm: (params: any) => void) => {
    // Implementation based on uiType
});

```

This function allows setting a custom notifier in the RWS Client. It handles the logic based on `uiType`.

Alert, Notify, and Silent

- alert: Displays an alert dialog with the message.
- notify: Shows a notification with the message.
- silent: Silently logs the message to the console.

Each method can be configured with a `message`, `logType`, and an optional `onConfirm` callback function.

Note

Ensure that a notifier is set in the RWS Client to use the `NotifyService` effectively. If no notifier is set, it will default to a warning in the console.

## Service Worker

If you pass ```{serviceWorker: 'service_worker_class_path.ts'}``` to RWS Webpack wrapper function param, the code will build ServiceWorker to pubDir.

example ServiceWorker class:

```typescript
import SWService, { ServiceWorkerServiceInstance } from '@rws-framework/client/src/services/ServiceWorkerService'
import {TimeTracker} from '../services/TimeTrackerService';
import RWSServiceWorker from '@rws-framework/client/src/service_worker/src/_service_worker';
import { RWSWSService as WSService } from '@rws-framework/client/src/services/WSService'

declare const self: ServiceWorkerGlobalScope;

class MyServiceWorker extends RWSServiceWorker {
   public tracker: { currentTracker: TimeTracker | null };    
    public trackersToSync: TimeTracker[];

    protected regExTypes: { [key: string]: RegExp } = {
        SOME_VIEW: new RegExp('.*:\\/\\/.*\\/#\\/([a-z0-9].*)\\/route\\/action$')
    };
    ignoredUrls = [
        new RegExp('(.*(?=.[^.]*$).*)/#/login'),
        new RegExp('(.*(?=.[^.]*$).*)/#/logout'),
    ];   

    constructor(){        
        super(self, RWSContainer());
    }
  
    checkForbidden(url: string): boolean {
        if (!url) {
            return true;
        }
  
        console.log('[SW] Check forbidden', url);

        return this.ignoredUrls.some((item) => url.match(item));
    }

    isExtraType(id: string){
        let result: string | null = null;
        const _self = this;
      
        Object.keys(this.regExTypes).forEach(function(key){
            if(result === null && _self.regExTypes[key].exec(id) !== null){
                result = key;
            }
        });
      
        return result;
    }    

    startServiceWorker(regExTypes: { [key: string]: RegExp }, forbiddenUrls: RegExp[]): JunctionServiceWorker 
    {        
        this.tracker = { currentTracker: null };
        this.ignoredUrls = forbiddenUrls;
        this.trackersToSync = [];
        this.regExTypes = regExTypes;       

        return this;
    }     

    async onInit(): Promise<void>
    {
        const _self: JunctionServiceWorker = this;
        let THE_USER: IJunctionUser | null = null;        
        const toSync: TimeTracker[] = [];

        let WS_URL: string | null;   
        
        console.log('Initiating ServiceWorker');

        this.workerScope.addEventListener('message', (event: MSGEvent) => {
            // console.log(event);
            if(!event.data){
                console.warn('[SW] Got empty message');
                return;
            }  

            if (event.data.command){
                console.log('[SW] OP Message:', event.data.command);
            
                switch (event.data.command) {
                case 'SET_WS_URL':
                    WS_URL = event.data.params.url;
                    break;
                case 'SET_USER':      
                    if(!this.getUser()){
                        THE_USER = event.data.params;                        
                        this.setUser(THE_USER);
                    }
                    _self.checkWs(WS_URL, this.getUser());
                    break;
                case 'START_TRACKING':
                    _self.checkWs(WS_URL, this.getUser());
                    if(!this.wsService.socket() && this.getUser()){
                        break;
                    }
                    _self.trackActivity(event.data.asset_type, event.data.params.page_location, event.data.params, toSync);
                    break;
                case 'TRACKER_SAVED':
                    const { clientId, tracker } = event.data.params;
        
                    _self.sendMessageToClient(clientId, { message: 'TRACKER_SAVED_RESPONSE', data: tracker });
                    break;  
                }
            }
        });  
    }

    async onActivate(): Promise<void>
    {        
        console.log('Activated ServiceWorker');
     
        this.startServiceWorker(this.regExTypes, this.ignoredUrls);
    }

    private checkWs(WS_URL: string, THE_USER: IJunctionUser): boolean 
    {
        if(!this.wsService.socket() && WS_URL){
            this.wsService.init(WS_URL, THE_USER);

            return true;
        }

        return false;
    };
}

MyServiceWorker.create();
```

**We point to this file in webpack / .rws.json "service_worker" option**

## Example: WebChat Component

The WebChat component demonstrates a practical use of `APIService` in a real-world scenario. It shows how to send and receive data from the backend.

### WebChat Component Implementation

```typescript
import { RWSViewComponent, ApiService, NotifyService, RWSView, WSService } from '@rws-framework/client';
import { observable, css  } from '@microsoft/fast-element';

import './children/convo-footer/component';

import WebChatEvents from './events';
import { IContext } from './children/left-bar/component';
import { IMessage } from '../chat-message/component';
import { ITalkApiResponse, BedrockBaseModel, IHyperParameter, 

@RWSView('web-chat')
class WebChat extends RWSViewComponent {

    static fileList: string[] = [
        'svg/icon_talk_1.svg'
    ];

    @observable messages: IMessage[] = [];
    @observable hyperParameters: { key: string, value: any } | any = {};
    @observable bookId: string = null;
    @observable chapterNr: string = null;

    @observable chosenModel: BedrockBaseModel = null;
    @observable chatContext: IContext = { label: 'Book chat' };

    @observable bookModel: IBook = null;

    @observable minified: boolean = true;

    @ngAttr custombookid: string = null;
    @ngAttr customchapternr: string = null;

    @observable customTemperature: number = 0.7;
    @observable customTopK: number = 250;
    @observable customMaxTokensToSample: number = 1024;
    @observable customTopP: number = 0.7;

    @ngAttr hTemperature?: string = '0.7';
    @ngAttr hTopK?: string = '250';
    @ngAttr hMaxTokensToSample?: string = '1024';
    @ngAttr hTopP?: string = '0.7';

    @observable convoId: string;
    @observable wsId: string;

    @ngAttr dev: PseudoBool = 'false';
    @ngAttr opened: PseudoBool = 'false';

    @ngAttr userImage: string | null = null;
    @ngAttr initials: string | null = 'U';

    handlers: (this: WebChat) => IWebChatHandlers = assignHandlers;
    streamCall: (msg: IMessage) => Promise<void> = callStreamApi;

    getDefaultHyperParams = getDefaultParams;
    setHyperParam = setHyperParam;

    public msgOptions: IConvoMsgOptions = {
        headerEnabled: false,
        dateEnabled: false
    };

    connectedCallback() {
        super.connectedCallback();

        if (this.routeParams?.dev || this.dev === 'true') {
            this.dev = 'true';
        } else {
            this.dev = 'false';
        }

        this.checkForBookId();
        this.checkForBookChapter();

        this.chosenModel = ClaudeModel;

        const provider = this.chosenModel?.providerName?.toLowerCase() || null;
        const defParams = this.getDefaultHyperParams(provider);

        const defaultParams: { [key: string]: any } = {};

        Object.keys(defParams).forEach(paramKey => {
            if (defParams[paramKey]) {
                defaultParams[paramKey] = this.setHyperParam(paramKey, defParams[paramKey]);
            }
        });

        this.hyperParameters = { ...defaultParams, ...this.hyperParameters };

        this.wsId = uuid();

        this.on<{ item: IMessage }>(WebChatEvents.message.send, (event: CustomEvent<{ item: IMessage }>) => {


            this.streamCall(event.detail.item);
        });

        if (this.routeParams?.opened || this.opened === 'true') {
            this.minified = false;
        }

        if (this.hTemperature) {
            this.hHandlers.hTemperature(null, this.hTemperature);
        }

        if (this.hMaxTokensToSample) {
            this.hHandlers.hMaxTokensToSample(null, this.hMaxTokensToSample);
        }

        if (this.hTopK) {
            this.hHandlers.hTopK(null, this.hTopK);
        }

        if (this.hTopP) {
            this.hHandlers.hTopP(null, this.hTopP);
        }
    }
    checkForBookId() {
        this.bookId = this.routeParams.bookId || this.custombookid || null;

        if (this.bookId) {
            this.apiService.back.get<IBook>('train:get:book', { routeParams: { bookId: this.bookId } }).then((data: IBook) => {
                this.bookModel = data;
            });
        }
    }

    checkForBookChapter() {
        this.chapterNr = this.routeParams.chapterNr || this.customchapternr || null;
    }

    custombookidChanged(oldVal: string, newVal: string) {
        if (newVal) {
            this.custombookid = newVal;
            this.checkForBookId();
        } else {
            this.custombookid = null;
        }
    }

    customchapternrChanged(oldVal: string, newVal: string) {
        if (newVal) {
            this.customchapternr = newVal;
            this.checkForBookChapter();
        } else {
            this.customchapternr = null;
        }
    }

    devChanged(oldVal: string, newVal: string) {
        if (oldVal !== newVal) {
            this.dev = newVal === 'true' ? 'true' : 'false';
        }
    }

    hHandlers: IHyperHandler = getParamChangeHandlers.bind(this)();

    hTemperatureChanged: ChangeHandlerType<string> = this.hHandlers.hTemperature;
    hMaxTokensToSampleChanged: ChangeHandlerType<string> = this.hHandlers.hMaxTokensToSample;
    hTopKChanged: ChangeHandlerType<string> = this.hHandlers.hTopK;
    hTopPChanged: ChangeHandlerType<string> = this.hHandlers.hTopP;

    userImageChanged(oldVal: string, newVal: string) {
        if (newVal && oldVal !== newVal) {
            this.userImage = newVal;
        }
    }

    initialsChanged(oldVal: string, newVal: string) {
        if (newVal && oldVal !== newVal) {
            this.initials = newVal;
        }
    }

    convoIdChanged(oldVal: string, newVal: string) {
        if (newVal && oldVal !== newVal) {
            console.log(this.convoId);
            this.convoId = newVal;
        }
    }
}

WebChat.defineComponent();


export { WebChat, IContext };

```

### Controller route

The route ApiService.back.get|post|put|delete methods can be found in backend controllers:

```typescript
 @Route('talk:models:prompt', 'POST')
    public async modelTalkAction(params: IRequestParams): Promise<ITalkApiResponse>
    {
        // (...)
    }       
```

and src/config/config

```typescript
    const http_routes = [    
        {
            prefix: '/prefix',
            routes: [
                {
                    name: 'action:route:name',
                    path: '/path/to/action'
                },
                 {
                    name: 'action:route:name',
                    path: '/path/to/action'
                }       
            ]
        },        
        {
            name: 'home:index',
            path: '/*', //if no routes detected pass request to frontend
            noParams: true, //do not read params from the request leave it to the front
        },       
    ]
```

### Socket route

Socket route from

```typescript
 WSService.sendMessage<PayloadType>('send_msg', {
      modelId: this.chosenModel.modelId,
      prompt: msg.content
    });

```

are defined in backend/src/config/config

```typescript
    const ws_routes = {
        'send_msg' : ChatSocket,
        'process_book' : TrainSocket,
    }
```

## Other configs

### example tsconfig.json

```json
{
    "compilerOptions": {
      "baseUrl": "../",
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true,
      "target": "ES2018",
      "module": "es2022",       
      "moduleResolution": "node",     
      "strict": true,
      "esModuleInterop": true,
      "sourceMap": true,
      "outDir": "dist",
      "strictNullChecks": false,    
      "allowSyntheticDefaultImports": true,    
      "lib": ["DOM", "ESNext", "WebWorker"], 
      "paths": {        
      }       
    },
    "include": [
      "src",          
      "../node_modules/@rws-framework/client/declarations.d.ts", //TEMPORARILY NEEDED TO WORK
    ],  
    "exclude": [
      "../node_modules/@rws-framework/client/src/tests"    
    ]
  }
```

**Remember to have lib field set in tsconfig.json**

```json
{
 "lib": ["DOM", "ESNext"]
}
```

## Plugin system

[PLUGIN SYSTEM README](https://github.com/papablack/rws-client/blob/master/PLUGINS.md)

## Links
- https://www.fast.design/docs/fast-element/getting-started ( Base FAST documentation, mostly valid not considering passing styles and templates as RWS handles it with Webpack loaders )
- https://www.webcomponents.org (open-source WebComponents repository)
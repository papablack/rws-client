# RWS Frontend Framework README

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Key Components: RWSClient & RoutingService](#key-components-rwsclient--routingservice)
4. [Component Initialization](#component-initialization)
5. [Frontend routes](#frontend-routes)
6. [Backend Imports](#backend-imports)
7. [Utilizing APIService](#utilizing-apiservice)
8. [Notifier](#notifier)
9. [Service Worker](#service-worker)
10. [Example: WebChat Component](#example-webchat-component)
11. [Links](#links)

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
then start engine in the site javascript (can be inline):

```javascript
window.RWSClient.start(CFG).then();
```

*or for initial setup then start on certain event (example)* 

```javascript
window.RWSClient.setup(CFG).then(() => {    
    $.on('loaded', function(data){
        const optionalNewCfg = { backendRoutes: data.backendRoutes };
        window.RWSClient.start(optionalNewCfg).then();
    })    
});
```

example config with interface:

```javascript
const CFG = {
    backendUrl: 'http://localhost:1337',
    wsUrl: 'http://localhost:1338',
    transports: ['websocket'],
    user: rwsUser,
    parted: true,
    splitFileDir: '/lib/rws',
    splitPrefix: 'myapp'     
}
```

### The FRONT config interface:

```typescript
interface IRWSConfig {
    defaultLayout?: typeof RWSViewComponent
    backendUrl?: string // url to backend request/response gateway
    wsUrl?: string // url to backend websockets gateway
     backendRoutes?: any[] // routes from backend
    apiPrefix?: string // f.e /api after host
    routes?: IFrontRoutes, //override front routes
    transports?: string[], //ws transports setup
    user?: any, //user data if logged
    ignoreRWSComponents?: boolean //do not register base RWS components
    pubUrl?: string //the url for accessing public dir from browser URL (default: /)
    pubPrefix?: string 
    parted?: boolean //sets async partitioning mode for components. Those wil be parted and loaded in BG.
    splitFileDir?: string //the url for accessing split dir from browser URL (default: /)
    splitPrefix?: string // prefix for parted file (`${pubPrefix}.${cmpName}.ts`)
    routing_enabled?: boolean
    _noLoad?: boolean    
}
```
### The FRONT webpack config:

```javascript
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const RWSWebpackWrapper  = require('rws-js-client/rws.webpack.config');
const { RuntimeGlobals } = require('webpack');


const executionDir = process.cwd();

const libdir = path.resolve(executionDir, '..', '..', 'frontend', 'app', 'lib', 'rws');
const pubdir = path.resolve(executionDir, '..', '..', 'frontend', 'app');

if(!fs.existsSync(libdir)){
  fs.mkdirSync(libdir);
}

const copies = {
  [libdir]: [
    './build',
    './src/styles/compiled/main.rws.css',
  ],
  [pubdir]: [
    './public/service_worker.js',
    './public/service_worker.js.map'
  ]
}

const myappFrontPath = path.resolve(__dirname, '../myapp/frontend');

module.exports = RWSWebpackWrapper({
  dev: true,
  hot: false,
  tsConfigPath: executionDir + '/tsconfig.json',
  entry: `${executionDir}/src/index.ts`,
  executionDir: executionDir,
  publicDir:  path.resolve(executionDir, 'public'),
  outputDir:  path.resolve(executionDir, 'build'),
  outputFileName: 'junction.client.js',
  copyToDir: copies,
  serviceWorker: './src/service_worker/MyServiceWorker.ts',
  parted: true,
  partedPrefix: 'myapp',
  partedComponentsLocations: ['../myapp', './src'],
  customServiceLocations: ['${myappFrontPath}/src/services']
});
```



## Key Components

### RWSClient
##
`RWSClient` is the heart of the framework, managing configuration and initialization. It sets up routes, backend connections, and other essential framework services.


### RoutingService
##
`RoutingService` handles the navigation and routing within your application. It ensures that URL changes reflect the correct component rendering.

Implementing the Framework

**Main File:**

The main file (`index.ts`) is where you initialize the RWSClient. Here, you configure your routes, backend routes, and component initializations.

Following is example of full usage of the framework

```typescript
import RWSClient, { NotifyUiType, NotifyLogType, RWSContainer } from 'rws-js-client';

//@ts-ignore
import alertify from 'alertifyjs';

import './styles/main.rws.scss';
import { backendRoutes } from './backendImport';
import { provideFASTDesignSystem, allComponents } from '@microsoft/fast-components';

// For single file output (will inject itself to DI on import):
//import initComponents from './application/_initComponents'

async function initializeApp() {       
    const theClient = RWSContainer().get(RWSClient);
    
    theClient.setBackendRoutes(backendRoutes());
    
    theClient.onInit(async () => {        

        // For single file output:
        //initComponents();

        provideFASTDesignSystem().register(allComponents);

        // const swFilePath: string = `${theClient.appConfig.get('pubUrl')}/service_worker.js`;          

        await theClient.swService.registerServiceWorker();        

        if(theClient.getUser()){
            theClient.pushUserToServiceWorker({...theClient.getUser(), instructor: false});  
        }

    });

    theClient.setNotifier((message: string, logType: NotifyLogType, uiType: NotifyUiType = 'notification', onConfirm: (params: any) => void) => {
        switch(uiType){
            case 'notification':
                let notifType = 'success';

                if(logType === 'error'){
                    notifType = 'error';
                }

                if(logType === 'warning'){
                    notifType = 'warning';
                }

                alertify.notify(message, notifType, 5, onConfirm);
                return;
            case 'alert':
                alertify.alert('Junction AI Notification', message, onConfirm);
                return;    
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
import jTrainerComponents from '../../../jtrainer/frontend/src/application/_initComponents';

import { WebChat } from '../../../jtrainer/frontend/src/components/webchat/component';
import { JunctionTrainer } from '../../../jtrainer/frontend/src/components/trainer/component';

import { BookLoader } from '../components/book-loader/component'
import { ChatLoader } from '../components/chat-loader/component'

import {RWSClientInstance} from 'rws-js-client/src/client';

export default () => {
    jTrainerComponents();
    WebChat;
    JunctionTrainer;
    BookLoader;    
    ChatLoader;

    RWSClientInstance.defineAllComponents();
}

```

```typescript
//index.ts

 const theClient = new RWSClient();

    
    theClient.addRoutes(routes);    //routes are optional
    
    theClient.onInit(async () => {
        initComponents(); //user components from _initComponents.ts (dont run and import when parted: true)
        provideFASTDesignSystem().register(allComponents); // @microsoft/fast-components ready components init
    });    

```

**Component needs to extend RWSViewComponent and use @RWSView decorator**:

```typescript
import { RWSViewComponent,  RWSDecoratorOptions, RWSView, observable, attr, ngAttr, sanitizedAttr } from 'rws-js-client';

const options?: RWSDecoratorOptions;

@RWSView('tag-name', options)
class WebChat extends RWSViewComponent {
    @attr tagAttr: string; //HTML tag attr
    @ngAttr fromNgAttr: string; //HTML attr from angular template
    @sanitizedAttr htmlAttr: string; //HTML attr that's sanitized with every val change
    @observable someVar: any; //Var for templates/value change observation
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

## DI

### Default service usage:

```typescript
import { RWSViewComponent, RWSView } from 'rws-js-client

@RWSView('your-tag')
class YourComponent extends RWSViewComponent {
    someMethod(url: string): void
    {
        this.apiService.get(url);
    }
}
 
```

Default services: https://github.com/papablack/rws-client/blob/7d16d9c6d83c81c9fe470eb0f507756bc6c71b35/src/components/_component.ts#L58

### Custom service usage:

```typescript
import { 
    NotifyService, RWSView, RWSViewComponent, 
    WSService, ApiService, ConfigService, 
    ConfigServiceInstance, UtilsServiceInstance, ApiServiceInstance, 
    UtilsService, DOMServiceInstance, DOMService, 
    NotifyServiceInstance, WSServiceInstance, RoutingService, 
    RoutingServiceInstance, RWSInject
} from 'rws-js-client';

import DateService, {DateServiceInstance} from '../../my-custom-services/DateService';


@RWSView('your-tag')
class YourComponent extends RWSViewComponent {
    constructor(
        @RWSInject(DateService) protected dateService: DateServiceInstance, //custom service - default services from RWSViewComponent below
        @RWSInject(ConfigService) protected config: ConfigServiceInstance,
        @RWSInject(RoutingService) protected routingService: RoutingServiceInstance,
        @RWSInject(DOMService) protected domService: DOMServiceInstance,
        @RWSInject(UtilsService) protected utilsService: UtilsServiceInstance,
        @RWSInject(ApiService) protected apiService: ApiServiceInstance,
        @RWSInject(WSService) protected wsService: WSServiceInstance,
        @RWSInject(NotifyService) protected notifyService: NotifyServiceInstance
    ) {
        super(config, routingService, domService, utilsService, apiService, wsService, notifyService);
        applyConstructor(this);   //fix-incoming: DI constructor data inheritance problem - applyConstructor in super is bugged. Need tmp workaround.
    }

    someMethod(url: string): void
    {
        this.dateService.get(url);
    }
}
 
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

`backendImports.ts` consolidates various backend interfaces, routes, and models, allowing for a synchronized frontend and backend.

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

**Remember to have lib field set in tesconfig.json**

```json
{
 "lib": ["DOM", "ESNext", "WebWorker"]
}
```

example ServiceWorker class:

```typescript
import SWService, { ServiceWorkerServiceInstance } from 'rws-js-client/src/services/ServiceWorkerService'
import {TimeTracker} from '../services/TimeTrackerService';
import RWSServiceWorker from 'rws-js-client/src/service_worker/src/_service_worker';
import { RWSWSService as WSService } from 'rws-js-client/src/services/WSService'

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

## Example: WebChat Component

The WebChat component demonstrates a practical use of `APIService` in a real-world scenario. It shows how to send and receive data from the backend.

### WebChat Component Implementation

```typescript
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

## Links

- https://www.webcomponents.org (open-source WebComponents repository)
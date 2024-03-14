import { Transformer as HTMLTagTransformerType, Tag as HTMLTag, Attributes as HTMLAttributes } from 'sanitize-html';
import { observable, attr } from '@microsoft/fast-element';
import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { provideRWSDesignSystem } from './components/_design_system';
import RWSService from './services/_service';
import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import RoutingService, { RoutingServiceInstance } from './services/RoutingService';
import NotifyService, {NotifyServiceInstance} from './services/NotifyService';
import DOMService, { DOMServiceInstance, DOMOutputType, TagsProcessorType }  from './services/DOMService';
import ApiService,  { IBackendRoute, ApiServiceInstance, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import UtilsService, {UtilsServiceInstance} from './services/UtilsService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';
import WSService, {WSServiceInstance, WSStatus} from './services/WSService';
import { ngAttr } from './components/_attrs/angular-attr';
import RWSClient from './client';
import RWSServiceWorker, { SWMsgType } from './service_worker/src/_service_worker';
import IRWSUser from './interfaces/IRWSUser';
import RWSContainer from './components/_container';

import { 
    IFrontRoutes, renderRouteComponent, RouteReturn, 
    _ROUTING_EVENT_NAME, IRoutingEvent,
    RWSRouter, IRWSRouteResult
} from './services/RoutingService';

// import { RWSComponents } from './components';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';
import { RWSDecoratorOptions, RWSIgnore, RWSView, RWSInject } from './components/_decorator';



export default RWSClient;
export { 
    NotifyUiType,
    NotifyLogType,

    RouteReturn,
    _ROUTING_EVENT_NAME,
    IRoutingEvent,
    
    RoutingServiceInstance,
    RoutingService,
    ApiServiceInstance,
    ApiService,    
    WSServiceInstance,
    WSService,
    UtilsServiceInstance,    
    UtilsService,    
    DOMServiceInstance,
    DOMService,
    DOMOutputType,
    NotifyServiceInstance,
    NotifyService,
    ConfigServiceInstance,
    ConfigService,
    ServiceWorkerServiceInstance,
    ServiceWorkerService,

    RWSNotify,
    RWSRouter,
    IFrontRoutes as IRWSFrontRoutes,
    IBackendRoute as IRWSBackendRoute,
    RWSDecoratorOptions as IRWSDecoratorOptions,
    IRWSRouteResult,
    IHTTProute as IRWSHttpRoute,
    IPrefixedHTTProutes as IRWSPrefixedHTTProutes,
    WSStatus as IRWSWebsocketStatus,
    IAssetShowOptions as IRWSAssetShowOptions,
    IRWSConfig,
    IRWSUser,
    TagsProcessorType,
    HTMLTagTransformerType,
    HTMLTag,
    HTMLAttributes,
         
    RWSView,
    RWSIgnore,
    RWSInject,
    ngAttr,    

    renderRouteComponent,
    
    // RWSComponents,

    observable,
    attr,

    RWSServiceWorker,
    SWMsgType,

    RWSService,
    RWSViewComponent,   
    provideRWSDesignSystem,

    RWSContainer
};
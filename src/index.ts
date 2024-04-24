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
import { sanitizedAttr } from './components/_attrs/sanitize-html';import WSService, {WSServiceInstance, WSStatus} from './services/WSService';
import { ngAttr } from './components/_attrs/angular-attr';
import RWSClient from './client';

import IRWSUser from './interfaces/IRWSUser';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';

import RWSContainer from './components/_container';

import { 
    IFrontRoutes, renderRouteComponent, RouteReturn, 
    _ROUTING_EVENT_NAME, IRoutingEvent,
    RWSRouter, IRWSRouteResult
} from './services/RoutingService';


import { RWSDecoratorOptions, RWSIgnore, RWSInject, RWSView } from './components/_decorator';

import { declareRWSComponents } from './components';

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
    sanitizedAttr,
    RWSIgnore,
    RWSInject,
    ngAttr,    

    renderRouteComponent,

    observable,
    attr,
    
    RWSService,
    RWSViewComponent,   
    provideRWSDesignSystem,
    declareRWSComponents,

    RWSContainer
};
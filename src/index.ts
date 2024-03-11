import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyService, {NotifyServiceInstance} from './services/NotifyService';
import RoutingService, { 
    IFrontRoutes, renderRouteComponent, RouteReturn, 
    _ROUTING_EVENT_NAME, IRoutingEvent, RoutingServiceInstance,
    RWSRouter, IRWSRouteResult
} from './services/RoutingService';
import DOMService, { DOMServiceInstance, DOMOutputType, TagsProcessorType }  from './services/DOMService';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';
import RWSView, { RWSDecoratorOptions, RWSIgnore } from './components/_decorator';
import ApiService,  { IBackendRoute, ApiServiceInstance, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import RWSService from './services/_service';
import UtilsService, {UtilsServiceInstance} from './services/UtilsService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';

import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import WSService, {WSServiceInstance, WSStatus} from './services/WSService';
import { RouterComponent } from './components/router/component';
import registerRWSComponents, { RWSUploader } from './components';
import { ngAttr } from './components/_attrs/angular-attr';
import RWSClient from './client';
import RWSServiceWorker, { SWMsgType } from './service_worker/src/_service_worker';
import IRWSUser from './interfaces/IRWSUser';
import { Transformer as HTMLTagTransformerType, Tag as HTMLTag, Attributes as HTMLAttributes } from 'sanitize-html';

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

    RWSViewComponent,        
    RWSView,
    RWSIgnore,
    ngAttr,
    RWSService,

    RouterComponent,
    RWSUploader,

    renderRouteComponent,
    registerRWSComponents,

    observable,
    attr,

    RWSServiceWorker,
    SWMsgType
};
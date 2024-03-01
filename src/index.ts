import IRWSConfig from './interfaces/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import { observable, attr } from '@microsoft/fast-element';
import NotifyServiceInstance, {NotifyService} from './services/NotifyService';
import RoutingServiceInstance, { 
    IFrontRoutes, renderRouteComponent, RouteReturn, 
    _ROUTING_EVENT_NAME, IRoutingEvent, RWSRoutingService as RoutingService,
    RWSRouter, IRWSRouteResult
} from './services/RoutingService';
import DOMServiceInstance, { DOMService, DOMOutputType }  from './services/DOMService';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';
import RWSView, {RWSDecoratorOptions} from './components/_decorator';
import ApiServiceInstance,  { IBackendRoute, ApiService, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import RWSService from './services/_service';
import UtilsServiceInstance, {RWSUtilsService as UtilsService} from './services/UtilsService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';

import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import WSServiceInstance, {RWSWSService as WSService, WSStatus} from './services/WSService';
import { RouterComponent } from './components/router/component';
import registerRWSComponents, { RWSUploader } from './components';
import { ngAttr } from './components/_attrs/angular-attr';
import RWSClient from './client';
import RWSServiceWorker, { SWMsgType } from './service_worker/src/_service_worker';
import IRWSUser from './interfaces/IRWSUser';
import { ILineInfo, TagsProcessorType } from './helpers/tags/TagsProcessorHelper';

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
    ConfigService as getRWSConfig,
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
    ILineInfo, 
    TagsProcessorType,

    RWSViewComponent,        
    RWSView,
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
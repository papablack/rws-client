import { Transformer as HTMLTagTransformerType, Tag as HTMLTag, Attributes as HTMLAttributes } from 'sanitize-html';
import { observable, attr } from '@microsoft/fast-element';
import IRWSConfig from './types/IRWSConfig';
import RWSNotify, { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import RWSService from './services/_service';
import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import NotifyService, {NotifyServiceInstance} from './services/NotifyService';
import DOMService, { DOMServiceInstance, DOMOutputType, TagsProcessorType }  from './services/DOMService';
import ApiService,  { IBackendRoute, ApiServiceInstance, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import UtilsService, {UtilsServiceInstance} from './services/UtilsService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';
import { sanitizedAttr } from './components/_attrs/sanitize-html';
import { ngAttr } from './components/_attrs/angular-attr';
import { externalObservable } from './components/_attrs/external-observable';
import { externalAttr } from './components/_attrs/external-attr';
import { RWSPlugin, DefaultRWSPluginOptionsType } from './plugins/_plugin';
import { IRWSPlugin, IStaticRWSPlugin } from './types/IRWSPlugin';
import RWSClient, { RWSClientInstance } from './client';
import { RWSPluginEntry } from './types/IRWSConfig';
import IRWSUser from './types/IRWSUser';
import RWSViewComponent, { IAssetShowOptions } from './components/_component';

import RWSContainer from './components/_container';


import { RWSDecoratorOptions, RWSIgnore, RWSInject, RWSView } from './components/_decorator';

import { declareRWSComponents } from './components';

export default RWSClient;
export { 
    RWSClient,
    RWSClientInstance,

    RWSPlugin,
    RWSPluginEntry,
    IRWSPlugin, IStaticRWSPlugin,
    DefaultRWSPluginOptionsType,
    
    NotifyUiType,
    NotifyLogType,

    ApiServiceInstance,
    ApiService,    
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
    IBackendRoute as IRWSBackendRoute,
    RWSDecoratorOptions as IRWSDecoratorOptions,
    IHTTProute as IRWSHttpRoute,
    IPrefixedHTTProutes as IRWSPrefixedHTTProutes,    
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
    observable,
    externalObservable,
    externalAttr,
    attr,
    ngAttr,
    
    RWSService,
    RWSViewComponent,       
    declareRWSComponents,

    RWSContainer
};
// Regular imports for classes and functions
import { observable, attr } from '@microsoft/fast-element';
import { Transformer as HTMLTagTransformerType, Tag as HTMLTag, Attributes as HTMLAttributes } from 'sanitize-html';
import RWSService from './services/_service';
import ConfigService, { ConfigServiceInstance } from './services/ConfigService';
import NotifyService, { NotifyServiceInstance } from './services/NotifyService';
import DOMService, { DOMServiceInstance } from './services/DOMService';
import ApiService, { ApiServiceInstance } from './services/ApiService';
import UtilsService, { UtilsServiceInstance } from './services/UtilsService';
import ServiceWorkerService, { ServiceWorkerServiceInstance } from './services/ServiceWorkerService';
import { sanitizedAttr } from './components/_attrs/sanitize-html';
import { ngAttr } from './components/_attrs/angular-attr';
import { externalObservable } from './components/_attrs/external-observable';
import { externalAttr } from './components/_attrs/external-attr';
import { RWSPlugin } from './plugins/_plugin';
import RWSClient, { RWSClientInstance } from './client';
import RWSViewComponent from './components/_component';
import RWSContainer from './components/_container';
import { RWSIgnore, RWSInject, RWSView } from './components/_decorator';
import { declareRWSComponents } from './components';

// Type imports
import type { DOMOutputType, TagsProcessorType } from './services/DOMService';
import type { IBackendRoute, IHTTProute, IPrefixedHTTProutes } from './services/ApiService';
import type { DefaultRWSPluginOptionsType } from './plugins/_plugin';
import type { IRWSPlugin, IStaticRWSPlugin } from './types/IRWSPlugin';
import type { RWSPluginEntry } from './types/IRWSConfig';
import type { NotifyUiType, NotifyLogType } from './types/RWSNotify';
import type { RWSDecoratorOptions } from './components/_decorator';
import type { IAssetShowOptions } from './components/_component';
import type IRWSConfig from './types/IRWSConfig';
import type IRWSUser from './types/IRWSUser';
import type RWSNotify from './types/RWSNotify';

// Default export
export default RWSClient;

// Class and function exports
export {
    RWSClient,
    RWSClientInstance,
    RWSPlugin,
    ApiService,
    UtilsService,
    DOMService,
    NotifyService,
    ConfigService,
    ServiceWorkerService,
    RWSService,
    RWSViewComponent,
    RWSContainer,
    RWSView,
    RWSIgnore,
    RWSInject,
    sanitizedAttr,
    externalObservable,
    externalAttr,
    observable,
    attr,
    ngAttr,
    declareRWSComponents,
    
    // Service instances
    ApiServiceInstance,
    UtilsServiceInstance,
    DOMServiceInstance,
    NotifyServiceInstance,
    ConfigServiceInstance,
    ServiceWorkerServiceInstance,
    
    // External types
    HTMLTagTransformerType,
    HTMLTag,
    HTMLAttributes
};

// Type exports
export type {
    // Plugin types
    RWSPluginEntry,
    IRWSPlugin,
    IStaticRWSPlugin,
    DefaultRWSPluginOptionsType,
    
    // Notification types
    NotifyUiType,
    NotifyLogType,
    RWSNotify,
    
    // Service and API types
    DOMOutputType,
    TagsProcessorType,
    IBackendRoute as IRWSBackendRoute,
    IHTTProute as IRWSHttpRoute,
    IPrefixedHTTProutes as IRWSPrefixedHTTProutes,
    
    // Component and decorator types
    RWSDecoratorOptions as IRWSDecoratorOptions,
    IAssetShowOptions as IRWSAssetShowOptions,
    
    // Config and user types
    IRWSConfig,
    IRWSUser
};
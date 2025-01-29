import { Observable } from '@microsoft/fast-element';
import RWSViewComponent from '../_component';
import DOMService from '../../services/DOMService';
import RWSContainer from '../_container';
import { IOptions } from 'sanitize-html';

import * as he from 'he';

type SanitizeOptions = IOptions & { fullEncode?: boolean };

const heOpt: he.EncodeOptions = {
    useNamedReferences: false, 
    encodeEverything: true,
};

function enc(html: string): string
{
    return he.encode(html, heOpt);
}


const transformAnyTag = (tagName: string, attribs: { [key: string]: string }) => {
    // Example: Wrap the original tag with `span` and indicate the original tag name in a data attribute
    return {
        tagName: 'span', // Change this to any tag you want to transform to
        attribs: {
            ...attribs,
            'data-original-tag': tagName
        }
    };
};

function sanitizedAttr(configOrTarget?: SanitizeOptions | RWSViewComponent, prop?: string): void | any 
{    
    if (arguments.length > 1) {
        // Decorator used directly without factory invocation
        // Apply the decorator immediately without returning anything
        applyDecorator(configOrTarget as RWSViewComponent, prop!);
    } else {
        // Decorator factory invocation
        const config = configOrTarget as SanitizeOptions;
        // Return a function that applies the decorator, conforming to TypeScript's expectations for decorator factories
        return (target: RWSViewComponent, property: string) => applyDecorator(target, property, config);
    }
}

function applyDecorator(target: RWSViewComponent, prop: string, config: SanitizeOptions = null): void 
{    
    if(config.fullEncode){
        const encAllOpts = {transformTags: { '*' : transformAnyTag }, textFilter: function(text: string, tagName?: string) { return tagName ? `${enc('<')}${tagName}${enc('>')}${text}${enc('</')}${tagName}${enc('>')}` : text; }};
        config = {...config, ...encAllOpts};
        delete config.fullEncode;
    }

    modifyPropertyDescriptor(target, prop, config as IOptions);
}

function modifyPropertyDescriptor(target: any, propertyKey: string, config: IOptions = null): void {
    const privatePropName = `_${String(propertyKey)}`;
    Object.defineProperty(target, privatePropName, {
        writable: true,
        value: target[propertyKey],
    });

    Object.defineProperty(target, propertyKey, {
        get() {
            return this[privatePropName];                             
        },
        set(value: any) {                
            if (typeof value === 'string') {                                    
                this[privatePropName] = RWSContainer().get(DOMService).sanitizeHTML(value, null, config);                
            } else {
                this[privatePropName] = null;
            }
            Observable.notify(this, propertyKey);
        },
    });
}
  

export { sanitizedAttr };
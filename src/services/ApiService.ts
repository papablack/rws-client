import TheService from "./_service";
import config from '../services/ConfigService';
import ConfigService from "../services/ConfigService";

interface RequestOptions {
    method?: string;
    headers: HeadersInit;
    body?: string;
}

interface IAPIOptions {
    headers?: Headers,
    routeParams?: {
        [key: string]: string
    }, 
}

interface  IBackendRoute
{
    path: string;
    name: string;
}

const _DEFAULT_CONTENT_TYPE = 'application/json';

class ApiService extends TheService {
    private token?: string;    

    constructor() {
        super();        
    }

    private addHeader(headers: Headers | [string, string][] | {[key: string]: string}, key: string, val: string)
    {
        if (headers instanceof Headers) {
            headers.append(key, val);
        } else if (Array.isArray(headers)) {
            headers.push([key, val]);
        } else {
            headers[key] = val;
        }
    }

    // Function to get headers
    private getHeaders(optHeaders: HeadersInit = {}): HeadersInit {
        const headers: HeadersInit = { ...optHeaders };

        if (!('Content-Type' in headers)) {
           this.addHeader(headers, 'Content-Type', _DEFAULT_CONTENT_TYPE)
        }

        if (this.token) {
            this.addHeader(headers, 'Authorization', `Bearer ${this.token}`)            
        }
        return headers;
    }

    public setToken(token: string)
    {
        this.token = token;
    }

    public async get(url: string, options: IAPIOptions = {}): Promise<any> {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(options.headers),
            });
            return await response.json();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    
    public async post(url: string, payload: any = {}, options: IAPIOptions = {}): Promise<any> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(options.headers),
                body: JSON.stringify(payload),
            });
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
    
    public async put(url: string, payload: any = {}, options: IAPIOptions = {}): Promise<any> {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(options.headers),
                body: JSON.stringify(payload),
            });
            return await response.json();
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }
    
    public async delete(url: string, options: IAPIOptions = {}): Promise<any> {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(options.headers),
            });
            return await response.json();
        } catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }

    private getBackendUrl(routeName: string, params: {[key:string]: string} = {})
    {
        type BackendRoute = {
            name: string,
            path: string
        }

        const route = ConfigService().get('backendRoutes').find((item: BackendRoute) => item.name === routeName)        

        if(!route){
            throw new Error(`Backend route '${routeName}' does not exist.`);
        }

        let apiPath = route.path;

        Object.keys(params).forEach((paramKey: string) => {
            const paramValue = params[paramKey];

            apiPath = apiPath.replace(`:${paramKey}`, paramValue);
        })

        return `${config().get('backendUrl')}${config().get('apiPrefix') || ''}${apiPath}`;
    }

    public back = {
        get: (routeName: string, options: IAPIOptions = {}) => this.get(this.getBackendUrl(routeName, options.routeParams), options),
        post: (routeName: string, payload: any = {}, options: IAPIOptions = {}) => this.post(this.getBackendUrl(routeName, options.routeParams), payload, options),
        put: (routeName: string, payload: any = {}, options: IAPIOptions = {}) => this.put(this.getBackendUrl(routeName, options.routeParams), payload, options),
        delete: (routeName: string, options: IAPIOptions = {}) => this.delete(this.getBackendUrl(routeName, options.routeParams), options),
    };
}

export default ApiService.getSingleton();
export { IBackendRoute }
import TheService from './_service';

//@4DI
import ConfigService, { ConfigServiceInstance } from '../services/ConfigService';

import { upload, UploadResponse } from 'upload';


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

interface IHTTProute {
    name: string;
    path: string;    
}


interface IPrefixedHTTProutes {
    prefix: string;
    routes: IHTTProute[];
}

type IBackendRoute = IHTTProute | IPrefixedHTTProutes;


const _DEFAULT_CONTENT_TYPE = 'application/json';

class ApiServiceInstance extends TheService {
    private token?: string;    

    constructor(@ConfigService private config: ConfigServiceInstance) {
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
            this.addHeader(headers, 'Content-Type', _DEFAULT_CONTENT_TYPE);
        }            
 
        if (this.token) {
            this.addHeader(headers, 'Authorization', `Bearer ${this.token}`);            
        }        

        if((headers as any)['Content-Type']){
            this.addHeader(headers, 'Accept', '*/*');
        }else{
            this.addHeader(headers, 'Accept', (headers as any)['Content-Type']);
        }

        return headers;
    }

    public setToken(token: string)
    {
        this.token = token;
    }

    public async pureGet(url: string, options: IAPIOptions = {}): Promise<string> {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(options.headers),
            });
            return await response.text();
        } catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }

    public async isGetTargetReachable(url: string, options: IAPIOptions = {}): Promise<boolean> {
        try {    
            return !!(await this.pureGet(url, options));
        } catch (error) {
            return false;
        }
    }

    public async get<T>(url: string, options: IAPIOptions = {}): Promise<T> {
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
    
    public async post<T, P extends object = object>(url: string, payload?: P, options: IAPIOptions = {}): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(options.headers),
                body: payload ? JSON.stringify(payload) : null,
            });
            return await response.json();
        } catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
    
    public async put<T, P extends object = object>(url: string, payload?: P, options: IAPIOptions = {}): Promise<T> {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(options.headers),
                body: payload ? JSON.stringify(payload) : null,
            });
            return await response.json();
        } catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }
    
    public async delete<T>(url: string, options: IAPIOptions = {}): Promise<T> {
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

    private getBackendUrl(routeName: string, params: {[key: string]: string} = {})
    {
       

        const routesPackage = this.config.get('backendRoutes');

        let routes: IHTTProute[] = [];       

        routesPackage.forEach((item: IBackendRoute) => {
            // Check if item is an instance of IPrefixedHTTProutes
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem: IHTTProute): IHTTProute => {
                    const subRoute: IHTTProute = {
                        path: item.prefix + subRouteItem.path,
                        name: subRouteItem.name
                    };
            
                    return subRoute;
                })];
            } else {
                // Handle the case where item is of type IHTTProute
                routes.push(item as IHTTProute);
            }          
        });        

        const route = routes.find((item: IHTTProute) => item.name === routeName);        

        if(!route){
            throw new Error(`Backend route '${routeName}' does not exist.`);
        }

        let apiPath = route.path;

        Object.keys(params).forEach((paramKey: string) => {
            const paramValue = params[paramKey];

            apiPath = apiPath.replace(`:${paramKey}`, paramValue);
        });

        return `${this.config.get('backendUrl')}${this.config.get('apiPrefix') || ''}${apiPath}`;
    }

    async uploadFile(url: string, file: File, onProgress: (progress: number) => void, options: IAPIOptions = {}): Promise<UploadResponse>
    {
        return upload(
            
            url,
            {
                file,
            },
            {
                onProgress,
                headers: this.token ? { Authorization: `Bearer ${this.token}` } : null,
            }
        );
    }

    public back = {
        get: <T>(routeName: string, options?: IAPIOptions): Promise<T> => this.get(this.getBackendUrl(routeName, options?.routeParams), options),
        post: <T, P extends object = object>(routeName: string, payload?: P, options?: IAPIOptions): Promise<T> => this.post(this.getBackendUrl(routeName, options?.routeParams), payload, options),
        put: <T, P extends object = object>(routeName: string, payload: P, options?: IAPIOptions): Promise<T> => this.put(this.getBackendUrl(routeName, options?.routeParams), payload, options),
        delete: <T>(routeName: string, options?: IAPIOptions): Promise<T> => this.delete(this.getBackendUrl(routeName, options?.routeParams), options),
        uploadFile: (routeName: string, file: File, onProgress: (progress: number) => void, options: IAPIOptions = {}): Promise<UploadResponse> => this.uploadFile(this.getBackendUrl(routeName, options?.routeParams), file, onProgress),
    };

    connectToAmplify()
    {        
        // "use client"       
        // const client = generateClient<Schema>() // use this Data client for CRUDL requests
        

        // /*== STEP 3 ===============================================================
        // Fetch records from the database and use them in your frontend component.
        // (THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
        // =========================================================================*/

        // /* For example, in a React component, you can use this snippet in your
        // function's RETURN statement */
        // // const { data: todos } = client.models.Todo.list()

        // // return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
    }
}

export default ApiServiceInstance.getSingleton();
export { IBackendRoute, RequestOptions, ApiServiceInstance, IHTTProute, IPrefixedHTTProutes };
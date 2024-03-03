import TheService from './_service';
import config from '../services/ConfigService';
import ConfigService from '../services/ConfigService';
import { upload } from 'upload';
const _DEFAULT_CONTENT_TYPE = 'application/json';
class ApiServiceInstance extends TheService {
    constructor() {
        super();
        this.back = {
            get: (routeName, options) => this.get(this.getBackendUrl(routeName, options === null || options === void 0 ? void 0 : options.routeParams), options),
            post: (routeName, payload, options) => this.post(this.getBackendUrl(routeName, options === null || options === void 0 ? void 0 : options.routeParams), payload, options),
            put: (routeName, payload, options) => this.put(this.getBackendUrl(routeName, options === null || options === void 0 ? void 0 : options.routeParams), payload, options),
            delete: (routeName, options) => this.delete(this.getBackendUrl(routeName, options === null || options === void 0 ? void 0 : options.routeParams), options),
            uploadFile: (routeName, file, onProgress, options = {}) => this.uploadFile(this.getBackendUrl(routeName, options === null || options === void 0 ? void 0 : options.routeParams), file, onProgress),
        };
    }
    addHeader(headers, key, val) {
        if (headers instanceof Headers) {
            headers.append(key, val);
        }
        else if (Array.isArray(headers)) {
            headers.push([key, val]);
        }
        else {
            headers[key] = val;
        }
    }
    // Function to get headers
    getHeaders(optHeaders = {}) {
        const headers = { ...optHeaders };
        if (!('Content-Type' in headers)) {
            this.addHeader(headers, 'Content-Type', _DEFAULT_CONTENT_TYPE);
        }
        if (this.token) {
            this.addHeader(headers, 'Authorization', `Bearer ${this.token}`);
        }
        if (headers['Content-Type'] === 'application/json') {
            this.addHeader(headers, 'Accept', 'application/json');
        }
        else if (headers['Content-Type'] === 'text/html') {
            this.addHeader(headers, 'Accept', 'text/html');
        }
        else {
            this.addHeader(headers, 'Accept', '*/*');
        }
        return headers;
    }
    setToken(token) {
        this.token = token;
    }
    async pureGet(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(options.headers),
            });
            return await response.text();
        }
        catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    async isGetTargetReachable(url, options = {}) {
        try {
            return !!(await this.pureGet(url, options));
        }
        catch (error) {
            return false;
        }
    }
    async get(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: this.getHeaders(options.headers),
            });
            return await response.json();
        }
        catch (error) {
            console.error('GET request failed:', error);
            throw error;
        }
    }
    async post(url, payload, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(options.headers),
                body: payload ? JSON.stringify(payload) : null,
            });
            return await response.json();
        }
        catch (error) {
            console.error('POST request failed:', error);
            throw error;
        }
    }
    async put(url, payload, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(options.headers),
                body: payload ? JSON.stringify(payload) : null,
            });
            return await response.json();
        }
        catch (error) {
            console.error('PUT request failed:', error);
            throw error;
        }
    }
    async delete(url, options = {}) {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(options.headers),
            });
            return await response.json();
        }
        catch (error) {
            console.error('DELETE request failed:', error);
            throw error;
        }
    }
    getBackendUrl(routeName, params = {}) {
        const routesPackage = ConfigService().get('backendRoutes');
        let routes = [];
        routesPackage.forEach((item) => {
            // Check if item is an instance of IPrefixedHTTProutes
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem) => {
                        const subRoute = {
                            path: item.prefix + subRouteItem.path,
                            name: subRouteItem.name
                        };
                        return subRoute;
                    })];
            }
            else {
                // Handle the case where item is of type IHTTProute
                routes.push(item);
            }
        });
        const route = routes.find((item) => item.name === routeName);
        if (!route) {
            throw new Error(`Backend route '${routeName}' does not exist.`);
        }
        let apiPath = route.path;
        Object.keys(params).forEach((paramKey) => {
            const paramValue = params[paramKey];
            apiPath = apiPath.replace(`:${paramKey}`, paramValue);
        });
        return `${config().get('backendUrl')}${config().get('apiPrefix') || ''}${apiPath}`;
    }
    async uploadFile(url, file, onProgress, options = {}) {
        return upload(url, {
            file,
        }, {
            onProgress
        });
    }
    connectToAmplify() {
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
const apiService = ApiServiceInstance.getSingleton();
export default ApiServiceInstance;
export { apiService as ApiService };
//# sourceMappingURL=ApiService.js.map
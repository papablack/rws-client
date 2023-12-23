import TheService from "./_service";
import { UploadResponse } from 'upload';
interface IAPIOptions {
    headers?: Headers;
    routeParams?: {
        [key: string]: string;
    };
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
declare class ApiService extends TheService {
    private token?;
    constructor();
    private addHeader;
    private getHeaders;
    setToken(token: string): void;
    get<T>(url: string, options?: IAPIOptions): Promise<T>;
    post<T, P>(url: string, payload?: P, options?: IAPIOptions): Promise<T>;
    put<T, P>(url: string, payload?: P, options?: IAPIOptions): Promise<T>;
    delete<T>(url: string, options?: IAPIOptions): Promise<T>;
    private getBackendUrl;
    uploadFile(url: string, file: File, onProgress: (progress: number) => void, options?: IAPIOptions): Promise<UploadResponse>;
    back: {
        get: <T>(routeName: string, options?: IAPIOptions) => Promise<T>;
        post: <T_1, P>(routeName: string, payload?: P, options?: IAPIOptions) => Promise<T_1>;
        put: <T_2, P_1>(routeName: string, payload: P_1, options?: IAPIOptions) => Promise<T_2>;
        delete: <T_3>(routeName: string, options?: IAPIOptions) => Promise<T_3>;
        uploadFile: (routeName: string, file: File, onProgress: (progress: number) => void, options?: IAPIOptions) => Promise<UploadResponse>;
    };
}
declare const _default: ApiService;
export default _default;
export { IBackendRoute };

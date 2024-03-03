import TheService from './_service';
import { RawSourceMap } from 'source-map';
declare class UtilsService extends TheService {
    getFileContents(filePath: string): Promise<string>;
    mergeDeep<T>(target: T | any, source: T | any): T;
    fetchSourceMap(jsFilePath: string): Promise<RawSourceMap>;
    getCurrentLineNumber(error?: Error): Promise<number>;
}
export default UtilsService;
declare const RWSUtilsService: UtilsService;
export { RWSUtilsService };

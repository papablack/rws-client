import { IRWSViteLoader, TSLoaderParams } from "./loader.type";
import fs from 'fs';
import chalk from 'chalk';
import md5 from 'md5';


// Interfejsy
interface ViewDecoratorData {
    decoratorArgs?: {
        template?: string;
        styles?: string;
        ignorePackaging?: boolean;
        debugPackaging?: boolean;
    };
    tagName: string;
    className: string;
}

interface DecoratorExtract {
    viewDecoratorData: ViewDecoratorData;
    replacedDecorator: string;
}

// Cache manager - możesz to wydzielić do osobnego pliku
class CacheManager {
    private cache: Map<string, string> = new Map();
    private customOptions: any;

    constructor(customOptions: any = null) {
        this.customOptions = customOptions;
    }

    getCachedItem(filePath: string, hash: string): string | null {
        const key = `${filePath}:${hash}`;
        return this.cache.get(key) || null;
    }

    cacheItem(filePath: string, content: string, originalContent: string): void {
        const key = `${filePath}:${md5(originalContent)}`;
        this.cache.set(key, content);
    }
}

// Helper functions - też możesz wydzielić
class LoadersHelper {
    static async extractRWSViewArgs(content: string): Promise<DecoratorExtract | null> {
        // Tutaj implementacja extractRWSViewArgs
        // Możesz użyć regexp lub parsera TypeScript do wyciągnięcia dekoratora
        return null; // Tymczasowo
    }

    static async getTemplate(
        filePath: string, 
        addDependency: (path: string) => void, 
        templateName: string | null, 
        isDev: boolean
    ): Promise<[string, string | null, boolean]> {
        // Implementacja getTemplate
        return ['', null, false]; // Tymczasowo
    }

    static async getStyles(
        filePath: string,
        addDependency: (path: string) => void,
        templateExists: boolean,
        stylesPath: string | null,
        isDev: boolean
    ): Promise<string> {
        // Implementacja getStyles
        return ''; // Tymczasowo
    }
}

// Główny loader
const loader: IRWSViteLoader<TSLoaderParams> = (params: TSLoaderParams) => {
    
    const cacheManager = new CacheManager();

    return {
        name: 'rws-typescript',
        enforce: 'pre',
        configResolved(config) {
            // Tutaj możesz dostać się do konfiguracji Vite
            // config.mode będzie 'development' lub 'production'
        },
        async transform(code: string, id: string) {
            if (!id.endsWith('.ts')) return null;
            if (id.endsWith('.debug.ts') || id.endsWith('.d.ts')) return null;
            if (id.includes('node_modules') && !id.includes('@rws-framework')) return null;

            let processedContent: string = code;
            const isDev: boolean = params.dev;
            let isIgnored: boolean = false;
            let isDebugged: boolean = false;

            try {
                const decoratorExtract: DecoratorExtract | null = await LoadersHelper.extractRWSViewArgs(processedContent);
                const decoratorData: ViewDecoratorData | null = decoratorExtract?.viewDecoratorData || null;

                const cachedCode: string = processedContent;
                // const cachedTS = cacheManager.getCachedItem(id, md5(cachedCode as string));

                // if (cachedTS) {
                //     return {
                //         code: cachedTS,
                //         map: null
                //     };
                // }

                if (!decoratorData) {
                    return {
                        code: processedContent,
                        map: null
                    };
                }

                const templateName = decoratorData.decoratorArgs?.template || null;
                const stylesPath = decoratorData.decoratorArgs?.styles || null;
                isIgnored = decoratorData.decoratorArgs?.ignorePackaging || false;
                isDebugged = decoratorData.decoratorArgs?.debugPackaging || false;

                const tagName = decoratorData.tagName;
                const className = decoratorData.className;

                if (tagName) {
                    const [template, htmlFastImports, templateExists] = await LoadersHelper.getTemplate(
                        id,
                        (path) => this.addWatchFile(path),
                        templateName,
                        isDev
                    );

                    const styles = await LoadersHelper.getStyles(
                        id,
                        (path) => this.addWatchFile(path),
                        templateExists,
                        stylesPath,
                        isDev
                    );

                    if (className && decoratorExtract?.replacedDecorator) {
                        processedContent = `${template}\n${styles}\n${decoratorExtract.replacedDecorator}`;
                    }

                    processedContent = `${htmlFastImports ? htmlFastImports + '\n' : ''}${processedContent}`;
                }

                const debugTsPath = id.replace('.ts', '.debug.ts');

                if (fs.existsSync(debugTsPath)) {
                    fs.unlinkSync(debugTsPath);
                }

                if (isDebugged) {
                    console.log(chalk.red('[RWS BUILD] Debugging into: ' + debugTsPath));
                    fs.writeFileSync(debugTsPath, processedContent);
                }

                cacheManager.cacheItem(id, processedContent, cachedCode);

                return {
                    code: processedContent,
                    map: null
                };
            } catch (e) {
                console.log(chalk.red('RWS Typescript loader error:'));
                console.error(e);
                throw new Error('RWS Build failed on: ' + id);
            }
        }
    };
};

export default loader;
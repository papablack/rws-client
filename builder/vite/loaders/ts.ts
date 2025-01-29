import { IRWSViteLoader, TSLoaderParams } from "./loader.type";
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';
import md5 from 'md5';
import JSON5 from 'json5'
import { RWSScssPlugin } from "../rws_scss_plugin";

interface DecoratorArgsData {
    template?: string;
    styles?: string;
    ignorePackaging?: boolean;
    debugPackaging?: boolean;
    fastElementOptions?: any;
}

interface ViewDecoratorData {
    decoratorArgs?: DecoratorArgsData;
    tagName: string;
    className: string;
    classNamePrefix?: string | null; // Added this field
}

interface DecoratorExtract {
    viewDecoratorData?: ViewDecoratorData | null;
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
    static extractRWSViewArgs(content: string, noReplace = false): DecoratorExtract | null {
        const viewReg = /@RWSView\(\s*["']([^"']+)["'](?:\s*,\s*([\s\S]*?))?\s*\)\s*(.*?\s+)?class\s+([a-zA-Z0-9_-]+)\s+extends\s+RWSViewComponent/gm;
      
        let m: RegExpExecArray | null = null;;
        let tagName: string | null = null;
        let className: string | null = null;
        let classNamePrefix: string | null = null;
        let decoratorArgs: DecoratorArgsData | null = null;
      
        const _defaultRWSLoaderOptions = {
          templatePath: 'template.html',
          stylesPath: 'styles.scss',
          fastOptions: { shadowOptions: { mode: 'open' } }
        }
      
        while ((m = viewReg.exec(content)) !== null) {
          if (m.index === viewReg.lastIndex) {
            viewReg.lastIndex++;
          }
      
          m.forEach((match, groupIndex) => {
            if (groupIndex === 1) {
              tagName = match;
            }
      
            if (groupIndex === 2) {
              if (match) {
                try {            
                  decoratorArgs = JSON5.parse(match);
                } catch(e){
                  console.log(chalk.red('Decorator options parse error: ') + e.message + '\n Problematic line:');
                  console.log(`
                    @RWSView(${tagName}, ${match})
                  `);
                  console.log(chalk.yellowBright(`Decorator options failed to parse for "${tagName}" component.`) + ' { decoratorArgs } defaulting to null.');
                  console.log(match);
      
                  throw new Error('Failed parsing @RWSView')
                }                   
              }
            }
      
            if (groupIndex === 3) {
              if(match){
                classNamePrefix = match;
              }
            }
      
            if (groupIndex === 4) {
              className = match;
            }
          });
        }
      
        if(!tagName || !className){
          return null;
        }
      
        let processedContent = content;
      
        let fastOptions = _defaultRWSLoaderOptions.fastOptions;
        decoratorArgs = decoratorArgs as unknown as DecoratorArgsData;
        if (decoratorArgs?.fastElementOptions) {
          fastOptions = decoratorArgs.fastElementOptions;
        }
       
        let replacedDecorator: string | null = null;
      
        if(!noReplace){
          const [addedParamDefs, addedParams] = this._extractRWSViewDefs(fastOptions, decoratorArgs || {});
          const replacedViewDecoratorContent = processedContent.replace(
            viewReg,
            `@RWSView('$1', null, { template: rwsTemplate, styles${addedParams.length ? ', options: {' + (addedParams.join(', ')) + '}' : ''} })\n$3class $4 extends RWSViewComponent `
          );
      
          replacedDecorator = `${addedParamDefs.join('\n')}\n${replacedViewDecoratorContent}`;
        }
      
        return {
          viewDecoratorData: {
            tagName,
            className,
            classNamePrefix,
            decoratorArgs
          },
          replacedDecorator: replacedDecorator || ''  // Ensure it's never null
        }
    }

    private static _extractRWSViewDefs(fastOptions = {}, decoratorArgs = {})
    {  
    const addedParamDefs: string[] = [];
    const addedParams: string[] = [];  

    for (const key in fastOptions){                
        addedParamDefs.push(`const ${key} = ${JSON.stringify(fastOptions[key])};`);
        addedParams.push(key);
    }

    return [addedParamDefs, addedParams];
    }

    static async getStyles(plugin: RWSScssPlugin, filePath: string, addDependency: (path: string) => void, templateExists: boolean, stylesPath?: string, isDev?: boolean): Promise<string> {
        if(!stylesPath){
          stylesPath = 'styles/layout.scss';
        }
      
        let styles = 'const styles: null = null;'
        const stylesFilePath = path.join(path.dirname(filePath), stylesPath);
      
        if (fs.existsSync(stylesFilePath)) {  
          const scsscontent = fs.readFileSync(stylesFilePath, 'utf-8');
        
          const codeData = await plugin.compileScssCode(scsscontent, path.join(path.dirname(filePath), 'styles'));      
          const cssCode = codeData.code;          
      
          styles = isDev ? `` : '';
      
          if (!templateExists) {
            styles += `import { css } from '@microsoft/fast-element';\n`;
          }
          styles += `const styles = ${templateExists ? 'T.' : ''}css\`${cssCode}\`;\n`;
      
          addDependency(path.join(path.dirname(filePath), stylesPath));
        }
      
        return styles;
      }
      
      static async getTemplate(filePath: string, addDependency: (path: string) => void, templateName?: string, isDev?: boolean) {
        if(!templateName){
          templateName = 'template';
        }
        const templatePath = path.dirname(filePath) + `/${templateName}.html`;
        let htmlFastImports: string | null = null;
        const templateExists = fs.existsSync(templatePath);            
        let template = 'const rwsTemplate: null = null;';
      
        if (templateExists) {
          const templateContent = fs.readFileSync(templatePath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
          htmlFastImports = `import * as T from '@microsoft/fast-element';\n`;
          template = `                
      //@ts-ignore                
      let rwsTemplate: any = T.html\`${templateContent}\`;
      `; 
        addDependency(templatePath);
        }
      
        return [template, htmlFastImports, templateExists];
      }
}

// Główny loader
const loader: IRWSViteLoader<TSLoaderParams> = async (params: TSLoaderParams) => {
    
    const cacheManager = new CacheManager();
    
    return {
        name: 'rws-typescript',
        enforce: 'pre',
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
                    return null;
                }

                let templateName: string | null = decoratorData.decoratorArgs?.template || null;
                let stylesPath = decoratorData.decoratorArgs?.styles || null;
                isIgnored = decoratorData.decoratorArgs?.ignorePackaging || false;
                isDebugged = decoratorData.decoratorArgs?.debugPackaging || false;

                const tagName = decoratorData.tagName;
                const className = decoratorData.className;

                const defaultTemplatePath = path.resolve(path.dirname(id), 'template.html');
                const defaultStylesPath = path.resolve(path.dirname(id), 'styles', 'layout.scss');

                if(!templateName && fs.existsSync(defaultTemplatePath)){
                    templateName ='template';
                }

                if(!stylesPath && fs.existsSync(defaultStylesPath)){
                    stylesPath ='styles/layout.scss';
                }

                if (tagName && templateName && stylesPath) {
                    const [template, htmlFastImports, templateExists] = await LoadersHelper.getTemplate(
                        id,
                        (path) => this.addWatchFile(path),
                        templateName,
                        isDev
                    );

                    const styles = await LoadersHelper.getStyles(
                        params.scssPlugin,
                        id,
                        (path) => this.addWatchFile(path),
                        templateExists as boolean,
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
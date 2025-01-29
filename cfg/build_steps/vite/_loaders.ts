import path from 'path';
import fs from 'fs';
import JSON5 from 'json5';
import chalk from 'chalk';
import { RWSScssPlugin } from '../../../builder/vite/rws_scss_plugin';
import { scssLoader, tsLoader, htmlLoader } from '../../../builder/vite/loaders';
import { HTMLLoaderParams, IRWSViteLoader, LoaderContent, SCSSLoaderParams, TSLoaderParams } from '../../../builder/vite/loaders/loader.type';
import { PluginOption } from 'vite';


interface RWSLoaderOptions {
    packageDir: string;
    nodeModulesPath: string;
    cssOutputPath: string;
    scssPlugin: RWSScssPlugin;
    tsConfigPath: string;
    dev: boolean;
}

interface ViewDecoratorData {
    tagName: string;
    className: string | null;
    classNamePrefix: string | null;
    decoratorArgs: any;
}

export function getRWSVitePlugins({ tsConfigPath, cssOutputPath, dev, scssPlugin }: RWSLoaderOptions): PluginOption[] {
    return [
        scssLoader({dev, scssPlugin: scssPlugin, cssOutputPath}), 
        tsLoader({dev, scssPlugin: scssPlugin, tsConfigPath}),  
        htmlLoader({dev})
    ];
}

function _extractRWSViewDefs(fastOptions: Record<string, any> = {}, decoratorArgs: Record<string, any> = {}) {
    const addedParamDefs: string[] = [];
    const addedParams: string[] = [];

    for (const key in fastOptions) {
        addedParamDefs.push(`const ${key} = ${JSON.stringify(fastOptions[key])};`);
        addedParams.push(key);
    }

    return [addedParamDefs, addedParams];
}

export function extractRWSViewArgs(content: string, noReplace = false): { viewDecoratorData: ViewDecoratorData, replacedDecorator: string | null } | null {
    const viewReg = /@RWSView\(\s*["']([^"']+)["'](?:\s*,\s*([\s\S]*?))?\s*\)\s*(.*?\s+)?class\s+([a-zA-Z0-9_-]+)\s+extends\s+RWSViewComponent/gm;
    let m;
    let tagName: string | null = null;
    let className: string | null = null;
    let classNamePrefix: string | null = null;
    let decoratorArgs: any = null;

    const _defaultRWSLoaderOptions = {
        templatePath: 'template.html',
        stylesPath: 'styles.scss',
        fastOptions: { shadowOptions: { mode: 'open' } }
    };

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
                    } catch(e) {
                        console.log(chalk.red('Decorator options parse error: ') + e.message + '\n Problematic line:');
                        console.log(`@RWSView(${tagName}, ${match})`);
                        console.log(chalk.yellowBright(`Decorator options failed to parse for "${tagName}" component.`) + ' { decoratorArgs } defaulting to null.');
                        console.log(match);
                        throw new Error('Failed parsing @RWSView');
                    }
                }
            }
            if (groupIndex === 3) {
                classNamePrefix = match || null;
            }
            if (groupIndex === 4) {
                className = match;
            }
        });
    }

    if (!tagName) {
        return null;
    }

    let processedContent = content;
    let fastOptions = _defaultRWSLoaderOptions.fastOptions;
    
    if (decoratorArgs?.fastElementOptions) {
        fastOptions = decoratorArgs.fastElementOptions;
    }

    let replacedDecorator: string | null = null;
    
    if (!noReplace) {
        const [addedParamDefs, addedParams] = _extractRWSViewDefs(fastOptions, decoratorArgs);
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
        replacedDecorator
    };
}

export async function getStyles(
    scssPlugin: RWSScssPlugin,
    filePath: string,
    addDependency: (path: string) => void,
    templateExists: boolean,
    stylesPath: string | null = null,
    isDev = false
): Promise<string> {
    if (!stylesPath) {
        stylesPath = 'styles/layout.scss';
    }

    let styles = 'const styles: null = null;';
    const stylesFilePath = path.dirname(filePath) + '/' + stylesPath;

    if (fs.existsSync(stylesFilePath)) {
        const scsscontent = fs.readFileSync(stylesFilePath, 'utf-8');

        const codeData = await scssPlugin.compileScssCode(
            scsscontent,
            path.dirname(filePath) + '/styles'
        );        

        const cssCode = codeData.code;
        styles = isDev ? `import './${stylesPath}';\n` : '';
        
        if (!templateExists) {
            styles += `import { css } from '@microsoft/fast-element';\n`;
        }
        
        styles += `const styles = ${templateExists ? 'T.' : ''}css\`${cssCode}\`;\n`;
        addDependency(path.dirname(filePath) + '/' + stylesPath);
    }

    return styles;
}

export async function getTemplate(
    filePath: string,
    addDependency: (path: string) => void,
    templateName: string | null = null,
    isDev = false
): Promise<[string, string | null, boolean]> {
    if (!templateName) {
        templateName = 'template';
    }

    const templatePath = path.dirname(filePath) + `/${templateName}.html`;
    let htmlFastImports: string | null = null;
    const templateExists = fs.existsSync(templatePath);
    let template = 'const rwsTemplate: null = null;';

    if (templateExists) {
        const templateContent = fs.readFileSync(templatePath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
        htmlFastImports = `import * as T from '@microsoft/fast-element';\nimport './${templateName}.html';\n`;
        template = `
            //@ts-ignore
            let rwsTemplate: any = T.html\`${templateContent}\`;
        `;
        addDependency(templatePath);
    }

    return [template, htmlFastImports, templateExists];
}
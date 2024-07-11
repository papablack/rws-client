// custom-html-loader.js
const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const tools = require('../../_tools');
const chalk = require('chalk');
const {html_error_proof} = require('./ts/html_error');
const RWSCssPlugin = require("../rws_scss_plugin");
const plugin = new RWSCssPlugin();

const _defaultRWSLoaderOptions = {
    templatePath: 'template.html',
    stylesPath: 'styles.scss',
    fastOptions: {  shadowOptions: { mode: 'open' }  }
}

module.exports = async function(content) { 
    let htmlFastImports = null;   
    let processedContent = content;
    const filePath = this.resourcePath;
    const isDev = this._compiler.options.mode === 'development';    

    const htmlMinify = this._compiler.options.htmlMinify || true;

    const RWSViewRegex = /(@RWSView\([^)]*)\)/;
    const tsSourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    let templatePath = 'template.html';
    let stylesPath = 'styles/layout.scss';
    let isIgnored = false;
    let isDebugged = false;
    let fastOptions = _defaultRWSLoaderOptions.fastOptions;
    
    const addedParamDefs = [];
    const addedParams = [];

    const decoratorData = tools.extractRWSViewArguments(tsSourceFile);

    if(!decoratorData){
        return content;
    }

    if(decoratorData.options){
        if(decoratorData.options.template){
            templatePath = decoratorData.options.template;
        }

        if(decoratorData.options.styles){
            stylesPath = decoratorData.options.styles;
        }

        
        if(decoratorData.options.ignorePackaging){
            isIgnored = true;
        }

        if(decoratorData.options.debugPackaging){
            isDebugged = true;
        }

        if(decoratorData.options.fastElementOptions){
            fastOptions = decoratorData.options.fastElementOptions;                   
        }        

        for (const key in fastOptions){                
            addedParamDefs.push(`const ${key} = ${JSON.stringify(fastOptions[key])};`);
            addedParams.push(key);
        }
    }    

    const tagName = decoratorData.tagName;
    
    try { 
        if(tagName){       
            const templateName = 'template';
            const templatePath = path.dirname(filePath) + `/${templateName}.html`;
    
            const templateExists = fs.existsSync(templatePath);                   

            let template = 'const rwsTemplate: null = null;';                            
            let styles = 'const styles: null = null;'

            if(fs.existsSync(path.dirname(filePath) + '/styles')){
                const scsscontent = fs.readFileSync(path.dirname(filePath) + '/' + stylesPath, 'utf-8');
                const codeData = plugin.compileScssCode(scsscontent, path.dirname(filePath) + '/styles', null, filePath, !isDev);        
                const cssCode = codeData.code;
           
                styles = `import './${stylesPath}';\n`;     
                if(!templateExists){
                    styles += `import { css } from '@microsoft/fast-element';\n`;     
                }       
                styles += `const styles = ${templateExists? 'T.': ''}css\`${cssCode}\`;\n`;

                this.addDependency(path.dirname(filePath) + '/' + stylesPath);
            }                                    
            
            if(templateExists){                         
                const templateContent = fs.readFileSync(templatePath, 'utf-8');
                htmlFastImports = `import * as T from '@microsoft/fast-element';\nimport './${templateName}.html';\n`;
                template = `                
//@ts-ignore                
let rwsTemplate: any = T.html\`${templateContent}\`;
`;              
                this.addDependency(templatePath);
            }
        
            const viewReg = /@RWSView\(['"]([a-zA-Z0-9_-]+)['"],?.*\)\sclass\s([a-zA-Z0-9_-]+) extends RWSViewComponent/gs

            let m;
            let className = null;

            while ((m = viewReg.exec(processedContent)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === viewReg.lastIndex) {
                    viewReg.lastIndex++;
                }
                
                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                    if(groupIndex === 2){
                        className = match;
                    }                    
                });
            }            

            if(className){                
                const replacedViewDecoratorContent = processedContent.replace(
                    viewReg,
                    `@RWSView('$1', null, { template: rwsTemplate, styles${addedParams.length? ', options: {' + (addedParams.join(', ')) + '}': ''} })\nclass $2 extends RWSViewComponent `
                );                            
                processedContent = `${template}\n${styles}\n${addedParamDefs.join('\n')}\n` + replacedViewDecoratorContent;   
            }            

            processedContent = `${htmlFastImports ? htmlFastImports + '\n' : ''}${processedContent}`;
        }

        const debugTsPath = filePath.replace('.ts','.debug.ts');

        if(fs.existsSync(debugTsPath)){
            fs.unlinkSync(debugTsPath);
        }

        if(isDebugged){
            console.log(chalk.red('[RWS BUILD] Debugging into: ' + debugTsPath));
            fs.writeFileSync(debugTsPath, processedContent); //for final RWS TS preview.
        }
      
        return processedContent;
    }catch(e){
        console.log(chalk.red('RWS Typescript loader error:'));
        console.error(e);       
        
        throw new Error('RWS Build failed on: ' + filePath);
    }
};
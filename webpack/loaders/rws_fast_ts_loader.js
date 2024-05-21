// custom-html-loader.js
const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const tools = require('../../_tools');

const _defaultRWSLoaderOptions = {
    templatePath: 'template.html',
    stylesPath: 'styles.scss',
    fastOptions: {  shadowOptions: { mode: 'open' }  }
}

const ERROR_HANDLER_CODE = (htmlContent) => {
    return `
    async function handleError(error: Error | any) {      
      const errorMessage = \`RWS HTML Error:\n\${error.stack}\`;
      console.error('RWS HTML error', errorMessage);      
      return T.html\`<div class="rws-error"><h1>RWS HTML template error</h1>\${errorMessage}</div>\`;
    }

    try {        
        //@ts-ignore
        rwsTemplate = T.html\`${htmlContent}\`;
      } catch (error: Error | any) {
        rwsTemplate = handleError(error);
      }
    `;
};

module.exports = async function(content) {    
    let processedContent = content;
    const filePath = this.resourcePath;
    const isDev = this._compiler.options.dev;

    const RWSViewRegex = /(@RWSView\([^)]*)\)/;
    const tsSourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    let templatePath = 'template.html';
    let stylesPath = 'styles/layout.scss';
    let isIgnored = false;
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
            let styles = 'const styles: null = null;'

            if(fs.existsSync(path.dirname(filePath) + '/styles')){
                styles = `import styles from './${stylesPath}';`;
            }
            
            const templateName = 'template';
            const templatePath = path.dirname(filePath) + `/${templateName}.html`;
            const templateExists = fs.existsSync(templatePath, 'utf-8');                   
            let template = 'const template: null = null;';

            if(templateExists){
                this.addDependency(templatePath);

                let htmlContent = fs.readFileSync(templatePath, 'utf-8');
                const originalContent = htmlContent;

                if(!isDev){
                    htmlContent = htmlContent.replace(/\n/g, '');
                }

                template = `import './${templateName}.html';            
                let rwsTemplate:any = null;
                
                ${ERROR_HANDLER_CODE(originalContent)}
              `;              
            }

            const viewReg = /(@RWSView\(\s*'[^']*'\s*(,\s*\{[^}]*\})?\s*)\)/s

            const replacedViewDecoratorContent = processedContent.replace(
                viewReg,
                `$1, ${addedParams.length ? '' : 'null, '}{ template: rwsTemplate, styles${addedParams.length? ', options: {' + (addedParams.join(', ')) + '}': ''} })`
            );

            processedContent = `import * as T from '@microsoft/fast-element';\n${template}\n${styles}\n${addedParamDefs.join('\n')}\n` + replacedViewDecoratorContent;
        }

        // if(filePath.indexOf('home') > -1){
        //     fs.writeFileSync(filePath.replace('.ts','.debug.ts'), processedContent); //for final RWS TS preview.
        // }
      
        return processedContent;

    }catch(e){
        console.error(e);
        return content;
    }
};
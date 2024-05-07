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

module.exports = async function(content) {    
    let processedContent = content;
    const filePath = this.resourcePath;
    const isDev = this._compiler.options.dev;

    const regex = /@RWSView/;
    const tsSourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

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
                        
            const lines = content.split('\n');
            const textToInsert = `static definition = { name: '${tagName}', template, styles${addedParams.length? ', ' + (addedParams.join(', ')) : ''} };`;

            let modifiedContent = '';
            let insertIndex = -1;

            lines.forEach((line, index) => {           
                modifiedContent += line + '\n';

                if (regex.test(line)) {
                    insertIndex = index + 2; // Set the position two lines below the match
                }

                if (index === insertIndex) {
                    modifiedContent += textToInsert + '\n'; // Insert the text
                }
            });

            replaced = modifiedContent;
            replaced = replaced.replace(`@RWSView('${tagName}')`, '');
            
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

                if(!isDev){
                    htmlContent = htmlContent.replace(/\n/g, '');
                }

                template = `import './${templateName}.html';
                //@ts-ignore            
                const template: any = T.html\`${htmlContent}\`;`;
            }

            processedContent = `import * as T from '@microsoft/fast-element';\n${template}\n${styles}\n${addedParamDefs.join('\n')}\n` + replaced;
        }

        // fs.writeFileSync(__dirname + '/../node_modules/.compiledev/' + decoratorData.tagName.replace('-', '_') + '.ts', processedContent); //for final RWS TS preview.
      
        return processedContent;

    }catch(e){
        console.error(e);
        console.warn('IN:\n\n');
        return content;
    }
};
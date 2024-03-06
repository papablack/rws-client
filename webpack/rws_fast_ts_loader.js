// custom-html-loader.js
const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const tools = require('../_tools');
const RWSPlugin = require("./rws_plugin");

const _defaultRWSLoaderOptions = {
    templatePath: 'template.html',
    stylesPath: 'styles.scss',
    fastOptions: {  shadowOptions: { mode: 'open' }  }
}

function toJsonString(str) {
    // Replace single quotes with double quotes
    str = str.replace(/'/g, '"');

    // Add double quotes around keys
    str = str.replace(/([a-zA-Z0-9_]+)(?=\s*:)/g, '"$1"');

    try {
        // Parse the string as JSON and then stringify it to get a JSON string
        const jsonObj = JSON.parse(str);
        return JSON.stringify(jsonObj);
    } catch (error) {
        console.error("Error in parsing:", error);
        return null;
    }
}

module.exports = function(content) { 
    
    let processedContent = content;
    const filePath = this.resourcePath;
    const options = this.getOptions() || {};
    const tsConfigPath = options.tsConfigPath || path.resolve(process.cwd(), 'tsconfig.json');
    const regex = /@RWSView/;

    const tsSourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

    let templatePath = 'template.html';
    let stylesPath = 'styles/layout.scss';
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
            const textToInsert = `  static definition = { name: '${tagName}', template, styles${addedParams.length? ', ' + (addedParams.join(', ')) : ''} };`;

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
            const plugin = new RWSPlugin();
            let styles = 'const styles = null;'

            if(fs.existsSync(path.dirname(filePath) + '/styles')){
                // const scssCode = fs.readFileSync(path.dirname(filePath) + '/styles/layout.scss', 'utf-8');
                // styles = 'const styles = T.css`' + plugin.compileScssCode(scssCode, path.dirname(filePath) + '/styles') + '`;'

                styles = `import styles from './${stylesPath}'`;
            }
            
            // const htmlCode = fs.readFileSync(path.dirname(filePath) + '/template.html', 'utf-8');                   

            let template = `import template from './${templatePath}'`;

            processedContent = ` 
            import * as T from '@microsoft/fast-element';\n           
            ${template}\n
            ${styles}\n
            ${addedParamDefs.join('\n')}
            \n      
        ` + replaced;                     
        }
      
        return processedContent;

    }catch(e){
        console.error(e);
        console.warn('IN:\n\n');
        console.log(processedContent);

        return content;
    }
};
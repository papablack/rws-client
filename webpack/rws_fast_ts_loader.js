// custom-html-loader.js
const ts = require('typescript');
const path = require('path');
const fs = require('fs');
const RWSSassPlugin = require("./rws_sass_plugin");
module.exports = function(content) { 
    let processedContent = content;
    const filePath = this.resourcePath;

    const regex = /@RWSView\(['"]([^'"]+)['"]\)/;

    try { 
        if(regex.test(content)){
            let tagName = null;        

            let match;
            while ((match = regex.exec(content)) !== null) {
                tagName = match[1];
                break;
            }
            
            
            const lines = content.split('\n');
            const textToInsert = `  static definition = { name: '${tagName}', template, styles };`;

            let modifiedContent = '';
            let insertIndex = -1;

            lines.forEach((line, index) => {
                if (regex.test(line)) {
                    insertIndex = index + 2; // Set the position two lines below the match
                }
                modifiedContent += line + '\n';

                if (index === insertIndex) {
                    modifiedContent += textToInsert + '\n'; // Insert the text
                }
            });

            replaced = modifiedContent;
            replaced = replaced.replace(`@RWSView('${tagName}')`, '');
            const plugin = new RWSSassPlugin();
            let styles = 'const styles = null;'

            if(fs.existsSync(path.dirname(filePath) + '/styles')){
                const scssCode = fs.readFileSync(path.dirname(filePath) + '/styles/layout.scss', 'utf-8');
                styles = 'const styles = T.css`' + plugin.compileCode(scssCode, path.dirname(filePath) + '/styles') + '`;'
            }
            
            // const htmlCode = fs.readFileSync(path.dirname(filePath) + '/template.html', 'utf-8');                   

            let template = `import template from './template.html'`;

            processedContent = ` 
            import * as T from '@microsoft/fast-element';\n           
            ${template}\n
            ${styles}\n\n      
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
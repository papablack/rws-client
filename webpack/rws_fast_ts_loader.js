// custom-html-loader.js
const ts = require('typescript');
const path = require('path');
const fs = require('fs');

module.exports = function(content) {  
    let processedContent = content;
    const filePath = this.resourcePath;

    const regex = /@RWSView\(['"]([^'"]+)['"]\)/;

    

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


        const styles = fs.existsSync(path.dirname(filePath) + '/styles') ? 'import "./styles/layout.scss";\nimport styles from "./styles/inc/layout.css";' : 'const styles = null;';

        processedContent = `        
        import template from "./template.html";\n        
        ${styles}\n\n      
      ` + replaced;        
             
    }
    
    return processedContent;
};
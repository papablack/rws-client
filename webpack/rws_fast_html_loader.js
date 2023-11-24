// custom-html-loader.js
module.exports = function(content) {
    
    return `import * as T from '@microsoft/fast-element';\nexport default T.html\`${content}\`;`;
};
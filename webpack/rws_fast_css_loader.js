// custom-css-loader.js
module.exports = function(content) {
    
    return `import { css } from '@microsoft/fast-element';\nexport default css\`${content}\`;`;
};

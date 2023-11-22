// custom-css-loader.js
module.exports = function(content) {
    console.log('cntnt', content);
    return `import { css } from '@microsoft/fast-element';\nexport default css\`${content}\`;`;
};

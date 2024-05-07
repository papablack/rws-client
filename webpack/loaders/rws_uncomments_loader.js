

const path = require('path');
const Terser = require('terser');

async function removeCommentsFromFile(code, inputSourceMap) {        
    const callback = this.async();
    const sourceMap = this.sourceMap;
    // Configure Terser to remove comments
    try {
        const minifyOptions = {
          format: {
            comments: false // Remove all comments
          },
          sourceMap: sourceMap
            ? {
                content: inputSourceMap || false,
                url: 'out.js.map'
              }
            : false
        };
    
        // Minify source code
        const result = await Terser.minify(code, minifyOptions);
    
        // Pass along the source map if enabled
        callback(null, result.code, result.map || inputSourceMap);
      } catch (err) {
        callback(err);
      }
}

module.exports = async function (source, inputSourceMap) {    
    return await removeCommentsFromFile.bind(this)(source, inputSourceMap);
};
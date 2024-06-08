

module.exports = async function(content) { 
    const filePath = this.resourcePath;
    const isDev = this._compiler.options.mode === 'development';    
   
    return content;
};
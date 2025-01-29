function html_error_proof(htmlContent){
  return `async function handleError(error: Error | any) {      
    const errorMessage = \`RWS HTML Error:\n\${error.stack}\`;
    console.error('RWS HTML error', errorMessage);      
    return T.html\`<div class="rws-error"><h1>RWS HTML template error</h1>\${errorMessage}</div>\`;
  }
      
  try {        
    //@rws-template-source
    rwsTemplate = 
  T.html\`
      ${htmlContent}\`;
  } catch (error: Error | any) {
    rwsTemplate = handleError(error);
  }`
}

module.exports = {
    html_error_proof
}
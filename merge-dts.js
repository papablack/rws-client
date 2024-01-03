const fs = require('fs');

const generatedTypes = fs.readFileSync('./dist/src/index.d.ts', { encoding: 'utf8' });
const customDeclarations = fs.readFileSync('./declarations.d.ts', { encoding: 'utf8' });

fs.writeFileSync('./dist/src/index.d.ts', generatedTypes + '\n' + customDeclarations);

console.log('RWS Loader declarations merged.')
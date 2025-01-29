const { rwsPath } = require('@rws-framework/console');

import _scss_fs_builder from './_fs';

const fs = require('fs');
const path = require('path');
const CSS_IMPORT_REGEX = /^(?!.*\/\/)(?!.*\/\*).*@import\s+['"]((?![^'"]*:[^'"]*).+?)['"];?/gm;
const SCSS_USE_REGEX = /^(?!.*\/\/)(?!.*\/\*).*@use\s+['"]?([^'"\s]+)['"]?;?/gm;

const WORKSPACE = rwsPath.findRootWorkspacePath(process.cwd());

function processImportPath(importPath: string, fileRootDir: string | null = null, noext: boolean = false): string 
{        
    if(!importPath){
        return '';
    }

    // Windows || Unix
    const isRootPath = /[A-Z]\:/.test(importPath.substring(0, 2)) || [...importPath][0] === '/'
    
    if (importPath.split('')[0] === '~') {
        return fillSCSSExt(replaceWithNodeModules(importPath, null, true), noext);
    }

    if (importPath.indexOf('@rws-mixins') === 0) {        
        return path.resolve(rwsPath.findPackageDir(__dirname), 'src', 'styles', 'includes.scss');
    }

    if (importPath.indexOf('@cwd') === 0) {
        return fillSCSSExt(path.join(process.cwd(), importPath.slice(4)), noext);
    }

    if (isRootPath) {
        return fillSCSSExt(importPath, noext);
    }    

    if (fileRootDir) {
        const relativized = path.join(path.resolve(fileRootDir), importPath);     

        if (importPath.split('')[0] === '.') {
            return fillSCSSExt(relativized, noext);
        }

        if (!fs.existsSync(relativized)) {
            const partSplit = relativized.split(path.sep);
            partSplit[partSplit.length - 1] = '_' + partSplit[partSplit.length - 1] + '.scss';

            const newPath = underscorePath(relativized);

            if (fs.existsSync(newPath)) {
                return newPath;
            }
        }
        return fillSCSSExt(relativized, noext);
    }

    return importPath;
}

function underscorePath(path, noext = false) {
    const partSplit = path.split(path.sep);
    partSplit[partSplit.length - 1] = '_' + partSplit[partSplit.length - 1] + (path.indexOf('.scss') > - 1 || noext ? '' : '.scss');
    return partSplit.join(path.sep);
}

function fillSCSSExt(scssPath, noext = false) {
    const underscoredPath = underscorePath(scssPath, noext);
    if (!fs.existsSync(scssPath) && fs.existsSync(underscoredPath)) {
        return underscoredPath;
    }

    if (noext) {
        return scssPath;
    }

    if ((!fs.existsSync(scssPath) || (fs.existsSync(scssPath) && fs.statSync(scssPath).isDirectory())) && fs.existsSync(`${scssPath}.scss`)) {
        return `${scssPath}.scss`;
    }

    if (fs.existsSync(`_${scssPath}.scss`)) {
        return `${scssPath}.scss`;
    }

    return scssPath;
}

function extractScssImports(fileContent, importRootPath) {
    let match;
    const imports: string[][] = [];

    while ((match = CSS_IMPORT_REGEX.exec(fileContent)) !== null) {
        const importPath = match[1];
        const importLine = match[0];

        if (fs.statSync(importRootPath).isFile()) {
            importRootPath = path.dirname(importRootPath);
        }

        const processedImportPath = processImportPath(importPath, importRootPath);

        imports.push([processedImportPath, importLine, path.resolve(processedImportPath)]);
    }

    return [imports, fileContent];
}

function extractScssUses(fileContent) {
    let match;
    const uses: string[][] = [];

    while ((match = SCSS_USE_REGEX.exec(fileContent)) !== null) {
        const usesPath: string = match[1];
        const usesLine: string = match[0];

        if (!uses.find((item) => {
            return item[0] == usesPath
        }) && !(usesPath !== 'sass:math')) {
            uses.push([usesPath, usesLine]);
        }
    }

    return [uses];
}

function detectImports(code) {
    return CSS_IMPORT_REGEX.test(code);
}

function replaceWithNodeModules(input, fileDir = null, absolute = false, token = '~') {
    return input.replace(token, absolute ? `${path.resolve(WORKSPACE, 'node_modules')}${path.sep}` : this.node_modules_dir(fileDir ? fileDir : process.cwd()));
}

function processImports(imports, fileRootDir, importStorage = {}, sub = false) {
    const _scss_fs = _scss_fs_builder(this);
    const importResults: {
        line: number,
        code: string
    }[] = [];

    const getStorage = (sourceComponentPath, importedFileContent) => {
        const sourceComponentPathFormatted = sourceComponentPath.replace(path.sep, '_');

        if (!(sourceComponentPathFormatted in importStorage)) {
            importStorage[sourceComponentPathFormatted] = importedFileContent;

            return importedFileContent;
        }

        return '';
    }
  
    imports.forEach(importData => {
        const originalImportPath = importData[0];
        let importPath = processImportPath(originalImportPath, fileRootDir);    
                
        let replacedScssContent = getStorage(importPath, _scss_fs.getCodeFromFile(importPath).replace(/\/\*[\s\S]*?\*\//g, ''));

        const recursiveImports = extractScssImports(replacedScssContent, importPath)[0];

        if (recursiveImports.length) {

            replacedScssContent = replaceImports(processImports(recursiveImports, path.dirname(importPath), importStorage, true), replacedScssContent);
        }

        importResults.push({
            line: importData[1],
            code: replacedScssContent
        });
    });

    return importResults;
}

function replaceImports(processedImports, code) {
    processedImports.forEach(importObj => {
        code = code.replace(importObj.line, importObj.code);
    });

    return code;
}

export default (element) => ({
    processImportPath: processImportPath.bind(element),
    fillSCSSExt: fillSCSSExt.bind(element),
    underscorePath: underscorePath.bind(element),
    detectImports: detectImports.bind(element),
    extractScssUses: extractScssUses.bind(element),
    extractScssImports: extractScssImports.bind(element),
    replaceImports: replaceImports.bind(element),
    processImports: processImports.bind(element),
    replaceWithNodeModules: replaceWithNodeModules.bind(element)
});
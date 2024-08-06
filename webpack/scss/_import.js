const { rwsPath } = require('@rws-framework/console');
const _tools = require('../../_tools');
const _scss_fs_builder = require('./_fs');
let _scss_fs = null;
const fs = require('fs');
const path = require('path');
const CSS_IMPORT_REGEX = /^(?!.*\/\/)(?!.*\/\*).*@import\s+['"]((?![^'"]*:[^'"]*).+?)['"];?/gm;
const SCSS_USE_REGEX = /^(?!.*\/\/)(?!.*\/\*).*@use\s+['"]?([^'"\s]+)['"]?;?/gm;

function processImportPath(importPath, fileRootDir = null, noext = false) {
    _scss_fs = _scss_fs_builder(this);
    
    if (importPath.split('')[0] === '~') {
        return fillSCSSExt(replaceWithNodeModules(importPath, null, true), noext);
    }

    if (importPath.indexOf('@rws-mixins') === 0) {
        return path.resolve(rwsPath.findPackageDir(__dirname), 'src', 'styles', 'includes.scss');
    }

    if (importPath.indexOf('@cwd') === 0) {
        return fillSCSSExt(process.cwd() + '/' + importPath.slice(4), noext);
    }

    if (importPath.split('')[0] === '/') {

        return fillSCSSExt(importPath, noext);
    }    

    if (fileRootDir) {
        const relativized = path.resolve(fileRootDir) + '/' + importPath;     

        if (importPath.split('')[0] === '.') {
            return fillSCSSExt(relativized, noext);
        }

        if (!fs.existsSync(relativized)) {
            const partSplit = relativized.split('/');
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
    const partSplit = path.split('/');
    partSplit[partSplit.length - 1] = '_' + partSplit[partSplit.length - 1] + (path.indexOf('.scss') > - 1 || noext ? '' : '.scss');
    return partSplit.join('/');
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
    _scss_fs = _scss_fs_builder(this);
    let match;
    const imports = [];

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
    _scss_fs = _scss_fs_builder(this);
    let match;
    const uses = [];

    while ((match = SCSS_USE_REGEX.exec(fileContent)) !== null) {
        const usesPath = match[1];
        const usesLine = match[0];

        if (!uses.find((item) => {
            return item[0] == usesPath
        }) && !usesPath !== 'sass:math') {
            uses.push([usesPath, usesLine]);
        }
    }

    // console.log(uses);

    return [uses];
}

function detectImports(code) {
    return CSS_IMPORT_REGEX.test(code);
}

function replaceWithNodeModules(input, fileDir = null, absolute = false, token = '~') {
    _scss_fs = _scss_fs_builder(this);
    return input.replace(token, absolute ? `${path.resolve(_tools.findRootWorkspacePath(process.cwd()), 'node_modules')}/` : this.node_modules_dir(fileDir ? fileDir : process.cwd()));
}

function processImports(imports, fileRootDir, importStorage = {}, sub = false) {
    _scss_fs = _scss_fs_builder(this);
    const importResults = [];

    const getStorage = (sourceComponentPath, importedFileContent) => {
        const sourceComponentPathFormatted = sourceComponentPath.replace('/', '_');

        if (!(sourceComponentPathFormatted in importStorage)) {
            importStorage[sourceComponentPathFormatted] = importedFileContent;

            return importedFileContent;
        }

        return '';
    }
  
    imports.forEach(importData => {
        const originalImportPath = importData[0];
        let importPath = processImportPath(originalImportPath, fileRootDir);            
        _scss_fs = _scss_fs_builder(this);
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

module.exports = (element) => ({
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
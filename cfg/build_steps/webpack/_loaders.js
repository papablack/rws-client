const path = require('path');
const fs = require('fs');
const os = require('os');

const RWSCssPlugin = require("../../../builder/webpack/rws_scss_plugin");
const plugin = new RWSCssPlugin();
const JSON5 = require('json5');
const chalk = require('chalk');
const { timingCounterStart, timingCounterStop } = require('./_timing');
const { rwsRuntimeHelper } = require('@rws-framework/console');

function getRWSLoaders(packageDir, nodeModulesPath, tsConfigPath, devDebug) {
  const scssLoader = packageDir + '/webpack/loaders/rws_fast_scss_loader.js';
  const tsLoader = packageDir + '/webpack/loaders/rws_fast_ts_loader.js';
  const htmlLoader = packageDir + '/webpack/loaders/rws_fast_html_loader.js';


  return [
    {
      test: /\.html$/,
      use: [
        {
          loader: htmlLoader,
        },
      ],
    },
    {
      test: /\.(ts)$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            allowTsInNodeModules: true,
            configFile: path.resolve(tsConfigPath)            
          }
        },
        {
          loader: tsLoader,
        }
      ],
      exclude: [        
        /node_modules\/(?!\@rws-framework\/[A-Z0-9a-z])/,
        /\.debug\.ts$/,
        /\.d\.ts$/,
      ],
    },
    {
      test: /\.scss$/i,
      use: [
        scssLoader,
      ],
    },
  ]
}

function _extractRWSViewDefs(fastOptions = {}, decoratorArgs = {})
{  
  const addedParamDefs = [];
  const addedParams = [];  

  for (const key in fastOptions){                
    addedParamDefs.push(`const ${key} = ${JSON.stringify(fastOptions[key])};`);
    addedParams.push(key);
  }

  return [addedParamDefs, addedParams];
}

function extractRWSViewArgs(content, noReplace = false) {
  const viewReg = /@RWSView\(\s*["']([^"']+)["'](?:\s*,\s*([\s\S]*?))?\s*\)\s*(.*?\s+)?class\s+([a-zA-Z0-9_-]+)\s+extends\s+RWSViewComponent/gm;

  let m;
  let tagName = null;
  let className = null;
  let classNamePrefix = null;
  let decoratorArgs = null;

  const _defaultRWSLoaderOptions = {
    templatePath: 'template.html',
    stylesPath: 'styles.scss',
    fastOptions: { shadowOptions: { mode: 'open' } }
  }


  while ((m = viewReg.exec(content)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === viewReg.lastIndex) {
      viewReg.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        tagName = match;
      }

      if (groupIndex === 2) {
        if (match) {
          try {            
            decoratorArgs = JSON5.parse(match);
          } catch(e){
            console.log(chalk.red('Decorator options parse error: ') + e.message + '\n Problematic line:');
            console.log(`
              @RWSView(${tagName}, ${match})
            `);
            console.log(chalk.yellowBright(`Decorator options failed to parse for "${tagName}" component.`) + ' { decoratorArgs } defaulting to null.');
            console.log(match);

            throw new Error('Failed parsing @RWSView')
          }                   
        }
      }

      if (groupIndex === 3) {
        if(match){
          classNamePrefix = match;
        }
      }

      if (groupIndex === 4) {
        className = match;
      }
    });
  }

  if(!tagName){
    return null;
  }

  let processedContent = content;

  let fastOptions = _defaultRWSLoaderOptions.fastOptions;

  if (decoratorArgs && decoratorArgs.fastElementOptions) {
    fastOptions = decoratorArgs.fastElementOptions;
  }
 
  let replacedDecorator = null;

  if(!noReplace){
    const [addedParamDefs, addedParams] = _extractRWSViewDefs(fastOptions, decoratorArgs);
    const replacedViewDecoratorContent = processedContent.replace(
      viewReg,
      `@RWSView('$1', null, { template: rwsTemplate, styles${addedParams.length ? ', options: {' + (addedParams.join(', ')) + '}' : ''} })\n$3class $4 extends RWSViewComponent `
    );

    // console.log({replacedViewDecoratorContent});

    replacedDecorator = `${addedParamDefs.join('\n')}\n${replacedViewDecoratorContent}`;
  }

  return {
    viewDecoratorData: {
      tagName,
      className,
      classNamePrefix,
      decoratorArgs
    },
    replacedDecorator
  }
}

async function getStyles(filePath, addDependency, templateExists, stylesPath = null, isDev = false) {
  if(!stylesPath){
    stylesPath = 'styles/layout.scss';
  }

  let styles = 'const styles: null = null;'
  const stylesFilePath = path.dirname(filePath) + '/' + stylesPath;

  if (fs.existsSync(stylesFilePath)) {  
    const scsscontent = fs.readFileSync(stylesFilePath, 'utf-8');
    timingCounterStart();
    const codeData = await plugin.compileScssCode(scsscontent, path.dirname(filePath) + '/styles', null, filePath, !isDev);
    const elapsed = timingCounterStop();
    let currentTimingList = rwsRuntimeHelper.getRWSVar('_timer_css');

    if(currentTimingList){
      currentTimingList += `\n${filePath}|${elapsed}`;
    }else{
      currentTimingList = `${filePath}|${elapsed}`;
    }

    rwsRuntimeHelper.setRWSVar('_timer_css', currentTimingList);

    const cssCode = codeData.code;

    styles = isDev ? `import './${stylesPath}';\n` : '';

    if (!templateExists) {
      styles += `import { css } from '@microsoft/fast-element';\n`;
    }
    styles += `const styles = ${templateExists ? 'T.' : ''}css\`${cssCode}\`;\n`;

    addDependency(path.dirname(filePath) + '/' + stylesPath);
  }

  return styles;
}

async function getTemplate(filePath, addDependency, templateName = null, isDev = false) {
  if(!templateName){
    templateName = 'template';
  }
  const templatePath = path.dirname(filePath) + `/${templateName}.html`;
  let htmlFastImports = null;
  const templateExists = fs.existsSync(templatePath);

  let template = 'const rwsTemplate: null = null;';

  if (templateExists) {
    const templateContent = fs.readFileSync(templatePath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
    htmlFastImports = `import * as T from '@microsoft/fast-element';\nimport './${templateName}.html';\n`;
    template = `                
//@ts-ignore                
let rwsTemplate: any = T.html\`${templateContent}\`;
`; addDependency(templatePath);
  }

  return [template, htmlFastImports, templateExists];
}

module.exports = { getRWSLoaders, extractRWSViewArgs, getTemplate, getStyles }
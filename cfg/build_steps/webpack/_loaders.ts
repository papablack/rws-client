import path from 'path';
import fs from 'fs';
import os from 'os';
import JSON5 from 'json5';
import chalk from 'chalk';
import { timingCounterStart, timingCounterStop } from './_timing';
import { rwsRuntimeHelper } from '@rws-framework/console';
// @ts-ignore
import RWSCssPlugin from '../../../webpack/rws_scss_plugin';

const plugin = new RWSCssPlugin();

interface WebpackLoader {
  loader: string;
  options?: Record<string, any>;
}

interface WebpackRule {
  test: RegExp;
  use: WebpackLoader | WebpackLoader[] | { loader: string };
  exclude?: RegExp[];
}

interface ViewDecoratorData {
  tagName: string;
  className: string | null;
  classNamePrefix: string | null;
  decoratorArgs: Record<string, any> | null;
}

interface ExtractRWSViewResult {
  viewDecoratorData: ViewDecoratorData;
  replacedDecorator: string | null;
}

interface FastOptions {
  shadowOptions: {
    mode: 'open';
  };
  [key: string]: any;
}

type DefaultFastOptions = {
  shadowOptions: {
    readonly mode: 'open';
  };
};

interface DecoratorArgs extends Record<string, any> {
  fastElementOptions?: FastOptions;
}

export function getRWSLoaders(
  packageDir: string,
  nodeModulesPath: string,
  tsConfigPath: string,
  devDebug: Record<string, any>
): WebpackRule[] {
  const scssLoader = `${packageDir}/webpack/loaders/rws_fast_scss_loader.js`;
  const tsLoader = `${packageDir}/webpack/loaders/rws_fast_ts_loader.js`;
  const htmlLoader = `${packageDir}/webpack/loaders/rws_fast_html_loader.js`;

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
        { loader: scssLoader },
      ],
    },
  ];
}

function _extractRWSViewDefs(
  fastOptions: Partial<FastOptions> = {},
  decoratorArgs: DecoratorArgs = {}
): [string[], string[]] {
  const addedParamDefs: string[] = [];
  const addedParams: string[] = [];

  for (const key in fastOptions) {
    addedParamDefs.push(`const ${key} = ${JSON.stringify(fastOptions[key])};`);
    addedParams.push(key);
  }

  return [addedParamDefs, addedParams];
}

export function extractRWSViewArgs(content: string, noReplace = false): ExtractRWSViewResult | null {
  const viewReg = /@RWSView\(\s*["']([^"']+)["'](?:\s*,\s*([\s\S]*?))?\s*\)\s*(.*?\s+)?class\s+([a-zA-Z0-9_-]+)\s+extends\s+RWSViewComponent/gm;

  let tagName: string | null = null;
  let className: string | null = null;
  let classNamePrefix: string | null = null;
  let decoratorArgs: DecoratorArgs = {};

  const _defaultRWSLoaderOptions = {
    templatePath: 'template.html',
    stylesPath: 'styles.scss',
    fastOptions: { shadowOptions: { mode: 'open' } } as DefaultFastOptions
  };

  let m: RegExpExecArray | null;
  while ((m = viewReg.exec(content)) !== null) {
    if (m.index === viewReg.lastIndex) {
      viewReg.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      if (groupIndex === 1) {
        tagName = match;
      }

      if (groupIndex === 2) {
        if (match) {
          try {
            decoratorArgs = JSON5.parse(match);
          } catch (e) {
            console.log(chalk.red('Decorator options parse error: ') + e.message + '\n Problematic line:');
            console.log(`
              @RWSView(${tagName}, ${match})
            `);
            console.log(chalk.yellowBright(`Decorator options failed to parse for "${tagName}" component.`) + ' { decoratorArgs } defaulting to null.');
            console.log(match);

            throw new Error('Failed parsing @RWSView');
          }
        }
      }

      if (groupIndex === 3) {
        classNamePrefix = match || null;
      }

      if (groupIndex === 4) {
        className = match;
      }
    });
  }

  if (!tagName) {
    return null;
  }

  let processedContent = content;
  let fastOptions = _defaultRWSLoaderOptions.fastOptions;

  if (decoratorArgs && decoratorArgs.fastElementOptions) {
    fastOptions = decoratorArgs.fastElementOptions;
  }

  let replacedDecorator: string | null = null;

  if (!noReplace) {
    const [addedParamDefs, addedParams] = _extractRWSViewDefs(fastOptions, decoratorArgs);
    const replacedViewDecoratorContent = processedContent.replace(
      viewReg,
      `@RWSView('$1', null, { template: rwsTemplate, styles${addedParams.length ? ', options: {' + addedParams.join(', ') + '}' : ''} })\n$3class $4 extends RWSViewComponent `
    );

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
  };
}

export async function getStyles(
  filePath: string,
  addDependency: (path: string) => void,
  templateExists: boolean,
  stylesPath: string | null = null,
  isDev = false
): Promise<string> {
  if (!stylesPath) {
    stylesPath = 'styles/layout.scss';
  }

  let styles = 'const styles: null = null;';
  const stylesFilePath = path.dirname(filePath) + '/' + stylesPath;

  if (fs.existsSync(stylesFilePath)) {
    const scsscontent = fs.readFileSync(stylesFilePath, 'utf-8');
    timingCounterStart();
    const codeData = await plugin.compileScssCode(scsscontent, path.dirname(filePath) + '/styles', null, filePath, !isDev);
    const elapsed = timingCounterStop();
    let currentTimingList = rwsRuntimeHelper.getRWSVar('_timer_css');

    if (currentTimingList) {
      currentTimingList += `\n${filePath}|${elapsed}`;
    } else {
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

export async function getTemplate(
  filePath: string,
  addDependency: (path: string) => void,
  templateName: string | null = null,
  isDev = false
): Promise<[string, string | null, boolean]> {
  if (!templateName) {
    templateName = 'template';
  }
  const templatePath = path.dirname(filePath) + `/${templateName}.html`;
  let htmlFastImports: string | null = null;
  const templateExists = fs.existsSync(templatePath);

  let template = 'const rwsTemplate: null = null;';

  if (templateExists) {
    const templateContent = fs.readFileSync(templatePath, 'utf-8').replace(/<!--[\s\S]*?-->/g, '');
    htmlFastImports = `import * as T from '@microsoft/fast-element';\nimport './${templateName}.html';\n`;
    template = `                
//@ts-ignore                
let rwsTemplate: any = T.html\`${templateContent}\`;
`;
    addDependency(templatePath);
  }

  return [template, htmlFastImports, templateExists];
}

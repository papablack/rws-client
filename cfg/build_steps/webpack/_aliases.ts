import path from 'path';

interface Aliases {
  [key: string]: string;
}

export function loadAliases(
  packageDir: string,
  nodeModulesPath: string,
  srcDir: string
): Aliases {
  return {
    'src': `${srcDir}/src`,
    '@rws-framework/foundation': path.resolve(packageDir, 'foundation', 'rws-foundation.js')
  };
}

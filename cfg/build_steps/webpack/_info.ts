import chalk from 'chalk';

interface BuildInfo {
  executionDir: string;
  tsConfigPath: string;
  outputDir: string;
  dev: boolean;
  publicDir?: string;
  parted: boolean;
  partedPrefix?: string;
  partedDirUrlPrefix?: string;
  devtool: string | boolean;
  plugins: Record<string, any>;
}

export function start(
  executionDir: string,
  tsConfigPath: string,
  outputDir: string,
  isDev: boolean,
  publicDir: string | undefined,
  isParted: boolean,
  partedPrefix: string | undefined,
  partedDirUrlPrefix: string | undefined,
  devTools: string | boolean,
  rwsPlugins: Record<string, any>
): void {
  console.log(chalk.green('Build started with'));
  const info: BuildInfo = {
    executionDir,
    tsConfigPath,
    outputDir,
    dev: isDev,
    publicDir,
    parted: isParted,
    partedPrefix,
    partedDirUrlPrefix,
    devtool: devTools,
    plugins: rwsPlugins
  };
  console.log(info);
}

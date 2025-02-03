import { Configuration } from 'webpack';
import { getRWSLoaders } from './_loaders';
import * as path from 'path';

interface DevExternalsVars {
  packed: Array<{ request: string; context: string }>;
  ignored: Array<{ request: string; context: string }>;
  frontendRequestContextCache: Array<{ request: string; context: string }>;
}

export function createWebpackConfig(
    executionDir: string,
    clientPkgPath: string,
    _packageDir: string,
    isDev: boolean,
    devTools: Configuration['devtool'],
    devDebug: Record<string, any>,
    isParted: boolean,
    partedPrefix: string | undefined,
    outputDir: string,
    outputFileName: string,
    automatedChunks: Record<string, string>,
    modules_setup: string[],
    aliases: Record<string, string>,
    tsConfigPath: string,
    WEBPACK_PLUGINS: Configuration['plugins'],
    rwsExternals: Configuration['externals'],
    devExternalsVars: DevExternalsVars
): Configuration {
    return {
        context: executionDir,
        entry: {
            ...automatedChunks
        },
        mode: isDev ? 'development' : 'production',
        target: 'web',
        devtool: devTools,
        output: {
            path: outputDir,
            filename: isParted ? (partedPrefix || 'rws') + '.[name].js' : outputFileName,
            sourceMapFilename: '[file].map',
        },
        resolve: {
            extensions: ['.ts', '.js', '.scss', '.css'],
            modules: modules_setup,
            alias: {
                ...aliases
            }
        },
        module: {
            rules: getRWSLoaders(clientPkgPath, path.resolve(_packageDir, 'node_modules'), tsConfigPath, devDebug),
        },
        plugins: WEBPACK_PLUGINS,
        externals: (rwsExternals as any)(executionDir, modules_setup, automatedChunks, {
            _vars: devExternalsVars
        }),
        cache: {
            type: 'filesystem',
            buildDependencies: {
                config: [__filename],
            },
        }
    };
}
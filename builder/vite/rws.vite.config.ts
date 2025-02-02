import path from 'path';
import fs from 'fs';
import { processEnvDefines } from '../../cfg/build_steps/vite/_env_defines';
import { getRWSVitePlugins } from '../../cfg/build_steps/vite/_loaders';
import { rwsPath } from '@rws-framework/console';
import type { RWSViteConfig } from '../../cfg/build_steps/vite/types';
import type { UserConfig } from 'vite'; // Add this import
import { RWSScssPlugin } from './rws_scss_plugin';

import { ScriptTarget } from 'typescript';

interface CompilerOptionsConfig {
    baseUrl: string;
    experimentalDecorators: boolean;
    emitDecoratorMetadata: boolean;
    target: 'ES2018' | 'ES2020' | 'ESNext';
    module: 'es2022' | 'ESNext' | 'commonjs';
    moduleResolution: 'node' | 'bundler';
    strict: boolean;
    esModuleInterop: boolean;
    resolveJsonModule: boolean;
    outDir: string;
    strictNullChecks: boolean;
    skipLibCheck: boolean;
    allowSyntheticDefaultImports: boolean;
    sourceMap: boolean;
    declaration: boolean;
    lib: Array<'DOM' | 'ESNext' | 'ES2018' | 'ES2020'>; // add other lib options as needed
  }

interface TSConfig {
    compilerOptions: CompilerOptionsConfig;
    paths?: {[key: string]: string[] };
    include?: string[];
    exclude?: string[];
  }

function logError(error: any) {
    console.error('Vite config error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    throw error;
  }

function loadTsConfig(tsPath: string): TSConfig | null 
{
    if(!fs.existsSync(tsPath)){
        return null;
    }

    try {
      const tsConfig = JSON.parse(fs.readFileSync(tsPath, 'utf-8'));
      return tsConfig;
    } catch (error) {
      logError(error);
      return null;
    }
}

export const _DEFAULT_CFG: RWSViteConfig = {
    dev: true,
    entry: path.resolve(rwsPath.findPackageDir(process.cwd()), 'src', 'index.ts'),
    outDir: path.resolve(rwsPath.findPackageDir(process.cwd()), 'dist'),
    tsConfigPath: path.resolve(rwsPath.findPackageDir(process.cwd()), 'tsconfig.json'),
    cssOutputPath: path.resolve(rwsPath.findPackageDir(process.cwd()), 'public', 'css'),
};

export function rwsViteBuilder(config: Partial<RWSViteConfig> = _DEFAULT_CFG, devDebug = false): UserConfig {
    if(!config.tsConfigPath){
        config.tsConfigPath = _DEFAULT_CFG.tsConfigPath;
    }

    if(!config.cssOutputPath){
        config.cssOutputPath = _DEFAULT_CFG.cssOutputPath;
    }

    if(!config.outDir){
        config.outDir = _DEFAULT_CFG.outDir;
    }

    const scssPlugin = new RWSScssPlugin({ autoCompile: [], dev: config.dev as boolean });


    const theConfig: RWSViteConfig = {..._DEFAULT_CFG, ...config};

    const tsConfig: TSConfig | null = loadTsConfig(theConfig.tsConfigPath);

    if(!tsConfig){
        throw new Error(`File "${theConfig.tsConfigPath}" was not found!`)
    }

    const pkgDir: string = rwsPath.findPackageDir(process.cwd());

    const outFileName = theConfig.outFileName || 'client.rws.js';
    
    return {
        define: processEnvDefines(theConfig, _DEFAULT_CFG, devDebug),        
        plugins: getRWSVitePlugins({ 
            scssPlugin,
            packageDir: pkgDir, 
            nodeModulesPath: `${rwsPath.findRootWorkspacePath(process.cwd())}/node_modules`, 
            tsConfigPath: theConfig.tsConfigPath, 
            cssOutputPath: theConfig.cssOutputPath as string,
            dev: config.dev as boolean 
        }),        
        build: {
            minify: !config.dev,
            sourcemap: config.dev,
            outDir: theConfig.outDir,
            emptyOutDir: true,
            copyPublicDir: false,
            rollupOptions: {
              output: {
                entryFileNames: outFileName,
                chunkFileNames: [...outFileName.split('.').slice(0, -1), 'chunk', outFileName.split('.').at(-1)].join('.'),
              }
            },
            lib: {
                entry: theConfig.entry,
                formats: ['es'],
                fileName: () => outFileName
            }            
        },
        esbuild: {
            target: tsConfig?.compilerOptions?.target?.toString().toLowerCase() || ScriptTarget.ES2022.toString().toLowerCase(),
            tsconfigRaw: {
                compilerOptions: tsConfig.compilerOptions
            }
        }
    };
}
import path from 'path';
import { fileURLToPath } from 'url';
import { processEnvDefines } from '../../cfg/build_steps/vite/_env_defines';
import { getRWSVitePlugins } from '../../cfg/build_steps/vite/_loaders';
import { rwsPath } from '@rws-framework/console';
import type { RWSViteConfig } from '../../cfg/build_steps/vite/types';
import type { UserConfig } from 'vite'; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const _DEFAULT_CFG: RWSViteConfig = {
    dev: true,
    tsConfigPath: path.resolve(rwsPath.findPackageDir(process.cwd()), 'tsconfig.json')
};

export function rwsViteBuilder(config: Partial<RWSViteConfig> = _DEFAULT_CFG, devDebug = false): UserConfig {
    if(!config.tsConfigPath){
        config.tsConfigPath = _DEFAULT_CFG.tsConfigPath;
    }

    const theConfig: RWSViteConfig = {..._DEFAULT_CFG, ...config};

    // Return a plain configuration object
    return {
        define: processEnvDefines(theConfig, _DEFAULT_CFG, devDebug),        
        plugins: getRWSVitePlugins({ 
            packageDir: rwsPath.findPackageDir(process.cwd()), 
            nodeModulesPath: `${rwsPath.findRootWorkspacePath(process.cwd())}/node_modules`, 
            tsConfigPath: theConfig.tsConfigPath, 
            dev: config.dev 
        }),        
        build: {
            minify: !config.dev,
            sourcemap: config.dev,
            outDir: 'dist',
            rollupOptions: {
                input: {
                    main: path.resolve(process.cwd(), 'index.html')
                }
            }
        }
    };
}
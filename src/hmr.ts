//@ts-ignore
import { hmrPlugin, presets } from '@open-wc/dev-server-hmr';

const AUTORELOAD_CFG = {
    plugins: [
        hmrPlugin({
            include: ['src/**/*'],
            presets: [presets.fastElement],
        }),
    ],
};

const HMR = {
    autoReloadConfig: (): any => {    
        return AUTORELOAD_CFG;
    }
};

export default HMR;
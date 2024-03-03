//@ts-expect-error no-types
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
    autoReloadConfig: () => {
        return AUTORELOAD_CFG;
    }
};
export default HMR;
//# sourceMappingURL=hmr.js.map
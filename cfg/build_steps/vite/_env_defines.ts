import { RWSViteConfig } from "./types";

export function processEnvDefines(frontCfg: RWSViteConfig, defaults: RWSViteConfig, devDebug: any = null) {
    let _rws_defines = {
        '_RWS_DEV_DEBUG': JSON.stringify(devDebug),
        '_RWS_DEFAULTS': JSON.stringify(defaults),
        '_RWS_BUILD_OVERRIDE': JSON.stringify(frontCfg)
    }

    const rwsDefines = frontCfg.defines || null;

    if (rwsDefines) {
        _rws_defines = { ..._rws_defines, ...rwsDefines }
    }

    return _rws_defines;
}

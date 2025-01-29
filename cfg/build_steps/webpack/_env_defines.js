

function processEnvDefines(BuildConfigurator, config, devDebug) {
    let _rws_defines = {
        'process.env._RWS_DEV_DEBUG': JSON.stringify(devDebug),
        'process.env._RWS_DEFAULTS': JSON.stringify(BuildConfigurator.exportDefaultConfig()),
        'process.env._RWS_BUILD_OVERRIDE': JSON.stringify(BuildConfigurator.exportBuildConfig())
    }

    const rwsDefines = BuildConfigurator.get('rwsDefines') || config.rwsDefines || null;

    if (rwsDefines) {
        _rws_defines = { ..._rws_defines, ...rwsDefines }
    }

    return _rws_defines;
}

module.exports = { processEnvDefines }
import { RWSConfigBuilder } from '@rws-framework/console';

export interface RWSConfig {
  rwsDefines?: Record<string, string>;
}

interface DevDebug {
  [key: string]: boolean | string | number | undefined;
}

interface RWSDefines {
  [key: string]: string;
}

export function processEnvDefines(
  BuildConfigurator: RWSConfigBuilder<RWSConfig>,  // Made generic type explicit
  config: RWSConfig,
  devDebug: DevDebug
): RWSDefines {
  let _rws_defines: RWSDefines = {
    'process.env._RWS_DEV_DEBUG': JSON.stringify(devDebug),
    'process.env._RWS_DEFAULTS': JSON.stringify(BuildConfigurator.exportDefaultConfig()),
    'process.env._RWS_BUILD_OVERRIDE': JSON.stringify(BuildConfigurator.exportBuildConfig())
  };

  const rwsDefines = BuildConfigurator.get('rwsDefines') || config.rwsDefines || null;

  if (rwsDefines) {
    _rws_defines = { ..._rws_defines, ...rwsDefines };
  }

  return _rws_defines;
}
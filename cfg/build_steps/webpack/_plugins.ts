import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { processEnvDefines, RWSConfig } from './_env_defines';
import path from 'path';
import { RWSConfigBuilder } from '@rws-framework/console';

interface RWSWebpackPluginsBag {
  _plugins: webpack.WebpackPluginInstance[];
  add(plugin: webpack.WebpackPluginInstance | webpack.WebpackPluginInstance[] | null): void;
  getPlugins(): webpack.WebpackPluginInstance[];
}

interface RWSFrontendConfig extends RWSConfig {
  outputDir?: string;
  plugins?: webpack.WebpackPluginInstance[];
  publicDir?: string;
  publicIndex?: string;
}

interface DevDebug {
  profiling?: boolean;
  [key: string]: any;
}

export const RWS_WEBPACK_PLUGINS_BAG: RWSWebpackPluginsBag = {
  _plugins: [],
  add(plugin) {
    if (Array.isArray(plugin)) {
      if (!plugin.length) {
        return;
      }

      plugin.forEach((item) => {
        if (item) {
          RWS_WEBPACK_PLUGINS_BAG.add(item);
        }
      });
    } else {
      if (!plugin) {
        return;
      }

      if (!this._plugins.includes(plugin)) {
        this._plugins.push(plugin);
      }
    }
  },
  getPlugins() {
    return this._plugins;
  }
};

function getPackageModPlugins(): webpack.WebpackPluginInstance[] {
  return [
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en-gb/),
    new webpack.IgnorePlugin({
      resourceRegExp: /.*\.es6\.js$/,
      contextRegExp: /node_modules/
    }),
  ];
}

function getDefinesPlugins(
  BuildConfigurator: RWSConfigBuilder<any>,
  rwsFrontendConfig: RWSFrontendConfig,
  devDebug: DevDebug
): webpack.WebpackPluginInstance[] {
  const _rws_defines = processEnvDefines(BuildConfigurator, rwsFrontendConfig, devDebug);

  return [
    new webpack.DefinePlugin(_rws_defines)
  ];
}

function getBuilderDevPlugins(
  BuildConfigurator: RWSConfigBuilder<any>,
  rwsFrontendConfig: RWSFrontendConfig,
  tsConfigPath: string,
  devDebug: DevDebug
): webpack.WebpackPluginInstance[] {
  if (!devDebug?.profiling) {
    return [];
  }

  const profiling = new webpack.debug.ProfilingPlugin({
    outputPath: path.join(BuildConfigurator.get('outputDir') || rwsFrontendConfig.outputDir || '', '.profiling/profileEvents.json'),
  });

  return [
    profiling
  ];
}

function getBuilderOptimPlugins(
  BuildConfigurator: RWSConfigBuilder<any>,
  rwsFrontendConfig: RWSFrontendConfig,
  tsConfigPath: string
): webpack.WebpackPluginInstance[] {
  return [];
}

export function addStartPlugins(
  rwsFrontendConfig: RWSFrontendConfig,
  BuildConfigurator: RWSConfigBuilder<any>,
  devDebug: DevDebug,
  isHotReload: boolean,
  isReport: boolean,
  tsConfigPath: string
): void {
  RWS_WEBPACK_PLUGINS_BAG.add([
    ...getDefinesPlugins(BuildConfigurator, rwsFrontendConfig, devDebug),
    ...getBuilderDevPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath, devDebug),
    ...getBuilderOptimPlugins(BuildConfigurator, rwsFrontendConfig, tsConfigPath),
    ...getPackageModPlugins()
  ]);

  if (isHotReload) {
    const { publicDir, publicIndex } = rwsFrontendConfig;
    
    if (!publicDir) {
      throw new Error('No public dir set');
    }

    if (!publicIndex) {
      throw new Error('No public index set');
    }

    RWS_WEBPACK_PLUGINS_BAG.add(new HtmlWebpackPlugin({
      template: `${publicDir}/${publicIndex}`,
    }));
  }

  const overridePlugins = rwsFrontendConfig.plugins || [];

  RWS_WEBPACK_PLUGINS_BAG.add(overridePlugins);

  if (isReport) {
    RWS_WEBPACK_PLUGINS_BAG.add(new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
    }));
  }
}

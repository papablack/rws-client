import { RWSConfigBuilder } from '@rws-framework/console';
import { Configuration } from 'webpack';

interface RWSFrontendConfig {
  backendUrl?: string;
  apiPort?: number;
}

export function webpackDevServer(
  BuildConfigurator: RWSConfigBuilder<any>,
  rwsFrontendConfig: RWSFrontendConfig,
  cfgExport: Configuration
): void {
  const backendUrl = BuildConfigurator.get('backendUrl') || rwsFrontendConfig.backendUrl;
  const apiPort = BuildConfigurator.get('apiPort') || rwsFrontendConfig.apiPort;

  if (backendUrl && apiPort) {
    // cfgExport.devServer = {
    //   hot: true, // Enable hot module replacement
    //   open: true, // Automatically open the browser
    // }
  }
}

const chalk = require('chalk');

module.exports = {
    start: (executionDir, tsConfigPath, outputDir, isDev, publicDir, isParted, partedPrefix, partedDirUrlPrefix, devTools, rwsPlugins) => {
        console.log(chalk.green('Build started with'))
        console.log({
        executionDir,
        tsConfigPath,
        outputDir,
        dev: isDev,
        publicDir,
        parted: isParted,
        partedPrefix,
        partedDirUrlPrefix,
        devtool: devTools,
        plugins: rwsPlugins
        });
    }
}
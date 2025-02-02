const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const tools = require('../../../_tools');

function scanComponents(partedComponentsLocations, executionDir, pkgCodeDir) {
    const foundRWSUserClasses = tools.findComponentFilesWithText(executionDir, '@RWSView', ['dist', 'node_modules', '@rws-framework/client']);
    const foundRWSClientClasses = tools.findComponentFilesWithText(pkgCodeDir, '@RWSView', ['dist', 'node_modules']);
    let RWSComponents = [...foundRWSUserClasses, ...foundRWSClientClasses];

    if (partedComponentsLocations) {
        partedComponentsLocations.forEach((componentDir) => {
            RWSComponents = [...RWSComponents, ...(tools.findComponentFilesWithText(path.resolve(componentDir), '@RWSView', ['dist', 'node_modules', '@rws-framework/client']))];
        });
    }

    return RWSComponents;
}

function setComponentsChunks(clientEntry, RWSComponents = [], isParted = false) {
    let automatedChunks = {
        client: clientEntry,
    };
    const automatedEntries = {};
    RWSComponents.forEach((fileInfo) => {
        const isIgnored = fileInfo.isIgnored;

        if (isIgnored === true) {
            // console.warn('Ignored: '+ fileInfo.filePath);
            return;
        }

        automatedEntries[fileInfo.tagName] = fileInfo.filePath;

        if (isParted) {
            automatedChunks[fileInfo.tagName] = fileInfo.filePath;
        }
    });

    return { automatedChunks, automatedEntries }
}

function generateRWSInfoFile(outputDir, automatedEntries) {
    const rwsInfoJson = outputDir + '/rws_info.json'
    fs.writeFile(rwsInfoJson, JSON.stringify({ components: Object.keys(automatedEntries) }, null, 2), () => {});
}

async function partedComponentsEvents(partedComponentsLocations, rwsPlugins, isParted) {
    if(!isParted){
        return partedComponentsLocations;
    }

    for (const pluginKey of Object.keys(rwsPlugins)) {
        const plugin = rwsPlugins[pluginKey];
        partedComponentsLocations = await plugin.onComponentsLocated(partedComponentsLocations);
    }

    return partedComponentsLocations;
}

module.exports = { scanComponents, setComponentsChunks, generateRWSInfoFile, partedComponentsEvents }
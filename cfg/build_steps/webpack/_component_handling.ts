import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import tools from '../../../_tools';

interface FileInfo {
  filePath: string;
  tagName: string;
  isIgnored: boolean;
}

interface RWSPlugin {
  onComponentsLocated(locations: string[]): Promise<string[]>;
}

interface ChunksResult {
  automatedChunks: Record<string, string>;
  automatedEntries: Record<string, string>;
}

export function scanComponents(
  partedComponentsLocations: string[] | undefined,
  executionDir: string,
  pkgCodeDir: string
): FileInfo[] {
  const foundRWSUserClasses = tools.findComponentFilesWithText(
    executionDir,
    '@RWSView',
    ['dist', 'node_modules', '@rws-framework/client']
  );
  const foundRWSClientClasses = tools.findComponentFilesWithText(
    pkgCodeDir,
    '@RWSView',
    ['dist', 'node_modules']
  );
  let RWSComponents: FileInfo[] = [...foundRWSUserClasses, ...foundRWSClientClasses];

  if (partedComponentsLocations) {
    partedComponentsLocations.forEach((componentDir) => {
      RWSComponents = [
        ...RWSComponents,
        ...(tools.findComponentFilesWithText(
          path.resolve(componentDir),
          '@RWSView',
          ['dist', 'node_modules', '@rws-framework/client']
        ))
      ];
    });
  }

  return RWSComponents;
}

export function setComponentsChunks(
  clientEntry: string,
  RWSComponents: FileInfo[] = [],
  isParted = false
): ChunksResult {
  const automatedChunks: Record<string, string> = {
    client: clientEntry,
  };
  const automatedEntries: Record<string, string> = {};

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

  return { automatedChunks, automatedEntries };
}

export function generateRWSInfoFile(
  outputDir: string,
  automatedEntries: Record<string, string>
): void {
  const rwsInfoJson = `${outputDir}/rws_info.json`;
  fs.writeFile(
    rwsInfoJson,
    JSON.stringify({ components: Object.keys(automatedEntries) }, null, 2),
    () => {}
  );
}

export async function partedComponentsEvents(
  partedComponentsLocations: string[] | undefined,
  rwsPlugins: Record<string, RWSPlugin>,
  isParted: boolean
): Promise<string[] | undefined> {
  if (!isParted) {
    return partedComponentsLocations;
  }

  let locations = partedComponentsLocations;
  for (const pluginKey of Object.keys(rwsPlugins)) {
    const plugin = rwsPlugins[pluginKey];
    if (locations) {
      locations = await plugin.onComponentsLocated(locations);
    }
  }

  return locations;
}

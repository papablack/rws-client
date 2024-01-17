import { SourceMapConsumer } from 'source-map';
let sourceMap = null;
async function fetchSourceMap(jsFilePath) {
    // Assuming the source map URL is the JS file URL with a '.map' extension
    const sourceMapUrl = jsFilePath;
    try {
        const response = await fetch(sourceMapUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    }
    catch (error) {
        console.error('Failed to fetch source map:', error);
        return null;
    }
}
async function getCurrentLineNumber(error = null) {
    if (!error) {
        error = new Error();
    }
    const stack = error.stack || '';
    const stackLines = stack.split('\n');
    const relevantLine = stackLines[1];
    // Extract file path from the stack line
    const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
    if (!match)
        return -1;
    const filePath = match[1];
    // Assuming the source map is in the same directory with '.map' extension
    const sourceMapPath = `${filePath}.map`;
    if (sourceMap === null) {
        sourceMap = await fetchSourceMap(sourceMapPath);
    }
    const consumer = await new SourceMapConsumer(sourceMap);
    // Extract line and column number
    const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
    if (!lineMatch)
        return -1;
    const originalPosition = consumer.originalPositionFor({
        line: parseInt(lineMatch[1]),
        column: parseInt(lineMatch[2]),
    });
    return originalPosition.line;
}
export default {
    getCurrentLineNumber
};
//# sourceMappingURL=UtilsService.js.map
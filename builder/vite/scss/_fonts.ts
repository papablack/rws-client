const fs = require('fs');
const path = require('path');
const FONT_REGEX = /url\(['"]?(.+?\.(woff|woff2|eot|ttf|otf))['"]?\)/gm;

import _scss_import_builder from './_import';
let _scss_import: any = null;

function hasFontEmbeds(css) {
    return FONT_REGEX.test(css);
}

function embedFontsInCss(css, cssFilePath) {
    let match;

    while ((match = FONT_REGEX.exec(css)) !== null) {
        const fontPath = match[1];
        const absoluteFontPath = path.resolve(path.dirname(cssFilePath), fontPath);

        if (fs.existsSync(absoluteFontPath)) {
            const fontData = fs.readFileSync(absoluteFontPath);
            const base64Font = fontData.toString('base64');
            const fontMimeType = getFontMimeType(path.extname(absoluteFontPath));
            const fontDataURL = `data:${fontMimeType};base64,${base64Font}`;

            css = css.replace(new RegExp(match[0], 'g'), `url(${fontDataURL})`);
        }
    }

    return css;
}

function getFontMimeType(extension) {
    switch (extension) {
        case '.woff': return 'font/woff';
        case '.woff2': return 'font/woff2';
        case '.eot': return 'application/vnd.ms-fontobject';
        case '.ttf': return 'font/ttf';
        case '.otf': return 'font/otf';
        default: return 'application/octet-stream';
    }
}

function convertFontToBase64(fontPath) {
    return fs.readFileSync(fontPath, { encoding: 'base64' });
}

function replaceFontUrlWithBase64(cssContent) {
    const fontFaceRegex = /@font-face\s*\{[^}]*\}/g;
    let fontFaces = [...cssContent.matchAll(fontFaceRegex)];
    _scss_import = _scss_import_builder(this);

    for (const fontFace of fontFaces) {
        const fontFaceContent = fontFace[0];
        const urlRegex = /url\((['"]?)([^)'"]+)(\1)\)/g;
        let match;

        let modifiedFontFaceContent = fontFaceContent;

        while ((match = urlRegex.exec(fontFaceContent)) !== null) {
            // Create a promise to convert each font to Base64 and replace in CSS
            const base64 = convertFontToBase64(_scss_import.processImportPath(match[2], null, true));
            const base64Font = `data:font/woff2;base64,${base64}`;

            modifiedFontFaceContent = modifiedFontFaceContent.replace(match[2], base64Font);
        }

        cssContent = cssContent.replace(fontFaceContent, modifiedFontFaceContent)
    };

    return cssContent;
}

export default function(element) {
    return {
        hasFontEmbeds: hasFontEmbeds.bind(element),
        embedFontsInCss: embedFontsInCss.bind(element),
        getFontMimeType: getFontMimeType.bind(element),
        convertFontToBase64: convertFontToBase64.bind(element),
        replaceFontUrlWithBase64: replaceFontUrlWithBase64.bind(element)
    };
};
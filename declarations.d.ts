export * from './dist/src/index';

declare module '*.css' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.scss' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.html' {
    const content: import('@microsoft/fast-element').ViewTemplate;
    export default content;
}
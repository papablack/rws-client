//@ts-ignore all

declare module '*.scss' {
    const content: import('@microsoft/fast-element').ElementStyles;
    export default content;
}

declare module '*.html' {
    const content: import('@microsoft/fast-element').ViewTemplate;
    export default content;
}